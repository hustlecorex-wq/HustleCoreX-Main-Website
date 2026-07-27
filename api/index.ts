// No-op on Vercel, where the values come from the project's env vars, but it
// makes `vercel dev` behave like `npm run dev`.
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
// Explicit .js extensions: package.json sets "type": "module", so the
// compiled function runs as ESM and Node will not guess at extensions.
import { registerRoutes } from "../server/routes.js";
import { initializeDatabase } from "../server/db.js";
import { verifyMailchimpConfig } from "../server/mailchimp.js";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      console.log(`[Express] ${logLine}`);
    }
  });

  next();
});

// Lazy initialization for serverless environments
let initializedPromise: Promise<void> | null = null;

async function init() {
  verifyMailchimpConfig();
  await initializeDatabase();
  await registerRoutes(httpServer, app);

  // Custom global error handler
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}

const handler = async (req: Request, res: Response) => {
  if (!initializedPromise) {
    initializedPromise = init();
  }
  await initializedPromise;
  return app(req, res);
};

export default handler;
