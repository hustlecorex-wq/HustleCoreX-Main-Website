import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
// Relative, not the @shared alias — the alias only exists at build time.
import { insertLeadSchema } from "../shared/schema.js";
import { subscribeToMailchimp } from "./mailchimp.js";
import { requireAdmin } from "./adminAuth.js";
import { z } from "zod";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The wire format of the application form. Wider than `insertLeadSchema`,
 * because two of the fields never reach the database: `website` is the bot
 * trap and `consent` is the opt-in that gates the Mailchimp call.
 */
const applicationSchema = insertLeadSchema.extend({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z
    .string()
    .trim()
    .regex(EMAIL_PATTERN, "Please enter a valid email address."),
  website: z.string().optional(),
  consent: z.boolean().optional(),
});

/** Copy shown to the applicant. Anything more specific stays in the log. */
const NEWSLETTER_MESSAGE = {
  compliance:
    "This address was unsubscribed or marked as spam before, so we can't add " +
    "it again from our side. You can re-subscribe yourself from any of our " +
    "earlier emails.",
  invalid: "Mailchimp rejected this email address.",
  unknown:
    "We saved your application, but couldn't send the confirmation email. " +
    "We'll still be in touch.",
} as const;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/leads", async (req, res) => {
    try {
      const { website, consent, ...data } = applicationSchema.parse(req.body);

      // Honeypot. Answer exactly like a success so the bot learns nothing,
      // but store nothing and call nobody.
      if (website && website.trim().length > 0) {
        console.warn("[Routes] Honeypot triggered, submission discarded.");
        return res.json({ success: true });
      }

      // The lead is written first and unconditionally. Whatever Mailchimp does
      // next, the application must not be lost.
      const lead = await storage.createLead(data);

      if (!consent) {
        return res.json({
          success: true,
          lead,
          newsletter: { subscribed: false },
        });
      }

      const result = await subscribeToMailchimp(data.name, data.email);

      if (result.ok) {
        await storage.setMailchimpStatus(lead.id, result.status);
        return res.json({
          success: true,
          // Echo the status we just wrote, not the one from the insert.
          lead: { ...lead, mailchimpStatus: result.status },
          newsletter: { subscribed: true, status: result.status },
        });
      }

      const failedStatus =
        result.reason === "not_configured" ? "skipped" : "failed";
      await storage.setMailchimpStatus(lead.id, failedStatus);

      return res.json({
        success: true,
        lead: { ...lead, mailchimpStatus: failedStatus },
        newsletter: {
          subscribed: false,
          message:
            result.reason === "not_configured"
              ? undefined
              : NEWSLETTER_MESSAGE[result.reason],
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: err.errors[0]?.message ?? "Please check the form and try again.",
          errors: err.errors,
        });
      } else {
        console.error("[Routes] POST /api/leads error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  // Lets the dashboard check a passcode without pulling the whole lead list.
  app.get("/api/admin/verify", requireAdmin, (_req, res) => {
    res.json({ success: true });
  });

  app.get("/api/leads", requireAdmin, async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.patch("/api/leads/:id", requireAdmin, async (req, res) => {
    try {
      // Express 5's param typing widens once a guard middleware is in front.
      const id = String(req.params.id);
      const { contacted } = req.body;
      if (typeof contacted !== "boolean") {
        return res.status(400).json({ success: false, message: "Contacted field must be a boolean" });
      }
      const lead = await storage.updateLead(id, contacted);
      res.json({ success: true, lead });
    } catch (err) {
      console.error("[Routes] PATCH lead failed:", err);
      res.status(500).json({ success: false, message: "Failed to update lead status" });
    }
  });

  return httpServer;
}
