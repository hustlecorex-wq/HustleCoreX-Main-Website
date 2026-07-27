import type { Request } from "express";

/**
 * Spam defences for the public application endpoint.
 *
 * Four independent checks, cheapest first. None of them can be perfect on
 * their own, and each one catches a different kind of junk:
 *
 *   honeypot   a hidden field only an automated filler will populate
 *   time trap  a form submitted faster than a human could read it
 *   rate limit the same address hammering the endpoint
 *   link spam  the payload advertising something
 *
 * Deliberately no third-party captcha: it costs a network round trip on every
 * submission, leaks visitors to another company, and this form is a low-value
 * target. Revisit if real spam gets through.
 */

/** How the caller should react. `silent` means answer like a success. */
export type SpamVerdict =
  | { spam: false }
  | { spam: true; action: "silent"; reason: string }
  | { spam: true; action: "reject"; reason: string; status: number; message: string };

const OK: SpamVerdict = { spam: false };

/* ------------------------------------------------------------------ *
 * Rate limiting
 * ------------------------------------------------------------------ */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

/**
 * In-memory, per instance. On Vercel each warm function keeps its own map, so
 * this throttles a burst from one source rather than guaranteeing a global
 * ceiling. That is the right trade here: no extra storage, no added latency,
 * and a scripted flood still hits it because those reuse one connection.
 */
const hits = new Map<string, number[]>();

function sweep(now: number) {
  // Bounded cleanup so a long-lived instance cannot grow the map forever.
  if (hits.size < 500) return;
  // forEach rather than for-of: the project targets an older lib and does not
  // enable downlevelIteration.
  hits.forEach((stamps: number[], key: string) => {
    const fresh = stamps.filter((t) => now - t < WINDOW_MS);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  });
}

export function clientKey(req: Request): string {
  // Vercel sets x-forwarded-for; the left-most entry is the real client.
  const forwarded = req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.ip ?? "unknown";
}

function rateLimited(key: string, now: number): boolean {
  const stamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  stamps.push(now);
  hits.set(key, stamps);
  sweep(now);
  return stamps.length > MAX_PER_WINDOW;
}

/* ------------------------------------------------------------------ *
 * Content heuristics
 * ------------------------------------------------------------------ */

const URL_PATTERN = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|xyz|top|click|shop)\b)/gi;

function countLinks(value: string | null | undefined): number {
  if (!value) return 0;
  return (value.match(URL_PATTERN) ?? []).length;
}

/** A real person's name does not contain a link or BBCode. */
function nameLooksLikeSpam(name: string): boolean {
  return countLinks(name) > 0 || /\[url|<a\s|\{|\}/i.test(name);
}

/* ------------------------------------------------------------------ *
 * Time trap
 * ------------------------------------------------------------------ */

const MIN_FILL_MS = 3000;
const MAX_FORM_AGE_MS = 12 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ *
 * Entry point
 * ------------------------------------------------------------------ */

export type SpamInput = {
  website?: string;
  renderedAt?: number;
  name: string;
  goal?: string | null;
  message?: string | null;
  instagram?: string | null;
};

export function checkForSpam(req: Request, input: SpamInput): SpamVerdict {
  const now = Date.now();

  // 1. Honeypot. Answer exactly like a success so the bot learns nothing.
  if (input.website && input.website.trim().length > 0) {
    return { spam: true, action: "silent", reason: "honeypot" };
  }

  // 2. Time trap. A missing stamp is tolerated — an old cached page, a browser
  //    with scripting quirks, or a legitimate curl should not be punished.
  if (typeof input.renderedAt === "number" && Number.isFinite(input.renderedAt)) {
    const elapsed = now - input.renderedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) {
      return {
        spam: true,
        action: "reject",
        reason: "time-trap",
        status: 400,
        message: "That went through a little too fast. Please try again.",
      };
    }
    if (elapsed > MAX_FORM_AGE_MS) {
      return {
        spam: true,
        action: "reject",
        reason: "stale-form",
        status: 400,
        message: "This page has been open for a while. Please reload and try again.",
      };
    }
  }

  // 3. Link spam.
  if (nameLooksLikeSpam(input.name)) {
    return { spam: true, action: "silent", reason: "link-in-name" };
  }
  if (countLinks(input.goal) + countLinks(input.message) > 2) {
    return { spam: true, action: "silent", reason: "link-flood" };
  }

  // 4. Rate limit. Last, so a flood of obvious junk does not fill the map.
  if (rateLimited(clientKey(req), now)) {
    return {
      spam: true,
      action: "reject",
      reason: "rate-limit",
      status: 429,
      message: "Too many applications from this connection. Please try again later.",
    };
  }

  return OK;
}

/** Exposed for tests. */
export function resetRateLimiter() {
  hits.clear();
}
