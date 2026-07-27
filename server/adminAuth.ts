import { timingSafeEqual } from "crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Guards the lead endpoints.
 *
 * Until now the only gate was a passcode compared inside the React bundle,
 * which meant the value shipped to every visitor and the API itself was wide
 * open — anyone could read every applicant's name and email by requesting
 * /api/leads directly. The check has to happen here, on the server.
 */

export const ADMIN_HEADER = "x-admin-passcode";

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, which would itself leak the
  // length, so compare lengths only after a fixed-cost comparison.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Logged once at boot, mirroring the Mailchimp config check. */
export function verifyAdminConfig(): boolean {
  if (!process.env.ADMIN_PASSCODE) {
    console.warn(
      "[Admin] ADMIN_PASSCODE is not set. The lead endpoints will refuse " +
        "every request until it is configured.",
    );
    return false;
  }
  console.log("[Admin] Passcode configured, lead endpoints are protected.");
  return true;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_PASSCODE;

  // Fail closed. An unset secret must never mean "let everyone in".
  if (!expected) {
    console.error("[Admin] Refused a request because ADMIN_PASSCODE is unset.");
    return res.status(503).json({
      success: false,
      message: "Admin access is not configured on the server.",
    });
  }

  const provided = req.header(ADMIN_HEADER);

  if (!provided || !safeEquals(provided, expected)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  return next();
}
