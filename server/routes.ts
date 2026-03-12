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

      fetch(FASTSUBMIT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${FASTSUBMIT_API_KEY}`,
        },
        body: JSON.stringify(data),
      }).catch((err) => console.error("[FastSubmit] forward failed:", err));

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
