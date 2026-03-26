import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

const FASTSUBMIT_URL = process.env.FASTSUBMIT_URL!;
const FASTSUBMIT_API_KEY = process.env.FASTSUBMIT_API_KEY!;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/leads", async (req, res) => {
    try {
      const data = insertLeadSchema.parse(req.body);

      const lead = await storage.createLead(data);

      const payload = {
        name: data.name,
        email: data.email,
        instagram_headline: data.instagram ?? "",
        field_1773303162142: data.currentRevenue,
        field_1773303170671: data.goal,
        field_1773303182985: data.message ?? "",
      };
      console.log("[FastSubmit] sending payload:", JSON.stringify(payload));
      fetch(FASTSUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (r) => {
          const text = await r.text();
          console.log("[FastSubmit] response status:", r.status, "body:", text);
        })
        .catch((err) => console.error("[FastSubmit] forward failed:", err));

      res.json({ success: true, lead });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: err.errors });
      } else {
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.get("/api/leads", async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  return httpServer;
}
