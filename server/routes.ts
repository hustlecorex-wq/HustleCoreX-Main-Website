import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
// Relative, not the @shared alias — the alias only exists at build time.
import { insertLeadSchema } from "../shared/schema.js";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/leads", async (req, res) => {
    try {
      const data = insertLeadSchema.parse(req.body);

      const lead = await storage.createLead(data);

      res.json({ success: true, lead });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: err.errors });
      } else {
        console.error("[Routes] POST /api/leads error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  });

  app.get("/api/leads", async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const { id } = req.params;
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
