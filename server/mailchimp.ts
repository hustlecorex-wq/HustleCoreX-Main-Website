import { createHash } from "crypto";

/**
 * Mailchimp Marketing API, called with plain fetch.
 *
 * No SDK on purpose: one endpoint, one verb, and Node 18+ ships fetch. The
 * subscriber hash is an MD5 of the lowercased address, which is Mailchimp's
 * own addressing scheme and not a security decision.
 */

export type SubscribeResult =
  | { ok: true; status: "pending" | "subscribed" }
  | { ok: false; reason: "compliance" | "invalid" | "not_configured" | "unknown" };

const REQUIRED_VARS = [
  "MAILCHIMP_API_KEY",
  "MAILCHIMP_SERVER_PREFIX",
  "MAILCHIMP_AUDIENCE_ID",
] as const;

/**
 * Logged once at boot instead of failing on every request, so a missing value
 * is obvious in the deploy log rather than a mystery 500 hours later.
 */
export function verifyMailchimpConfig(): boolean {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.warn(
      `[Mailchimp] Not configured. Missing: ${missing.join(", ")}. ` +
        `Leads will still be stored, but nobody will be subscribed to the audience.`,
    );
    return false;
  }

  console.log("[Mailchimp] Configuration found for all required variables.");
  return true;
}

function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

/** Everything from the application that is worth carrying into the audience. */
export type SubscriberDetails = {
  name: string;
  email: string;
  instagram?: string | null;
  currentRevenue?: string | null;
  /** The client-count answer, stored in the lead as "Clients: <answer>". */
  message?: string | null;
  /** The "biggest time drain" free text. */
  goal?: string | null;
};

/** Mailchimp text merge fields hold 255 characters. Longer answers are cut. */
function fitMergeField(value: string | null | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed.length > 255 ? trimmed.slice(0, 252) + "..." : trimmed;
}

/**
 * Upserts a contact into the audience. Never throws — the caller has already
 * persisted the lead and must not lose it because an upstream call failed.
 */
export async function subscribeToMailchimp(
  details: SubscriberDetails,
): Promise<SubscribeResult> {
  const { name, email } = details;
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !serverPrefix || !audienceId) {
    return { ok: false, reason: "not_configured" };
  }

  const address = email.trim().toLowerCase();
  const [firstName, ...rest] = name.trim().split(/\s+/);

  const url =
    `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}` +
    `/members/${subscriberHash(address)}`;

  // PUT, not POST: a repeat application of the same address is an update
  // rather than a "Member Exists" error.
  //
  // status_if_new must be "pending" here. The double opt-in switch in the
  // audience settings only governs Mailchimp's own signup forms; for the API
  // this field is the only thing that triggers a confirmation email.
  const body = {
    email_address: address,
    status_if_new: "pending",
    merge_fields: {
      FNAME: firstName ?? "",
      LNAME: rest.join(" "),
      // These four are custom fields on the audience, created as non-public so
      // they never appear on Mailchimp's own signup forms.
      INSTA: fitMergeField(details.instagram),
      REVENUE: fitMergeField(details.currentRevenue),
      // The lead stores this as "Clients: <answer>"; the audience only wants
      // the answer.
      CLIENTS: fitMergeField(details.message).replace(/^Clients:\s*/i, ""),
      BOTTLENECK: fitMergeField(details.goal),
    },
  };

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const payload = (await response.json()) as { status?: string };
      const status = payload.status === "subscribed" ? "subscribed" : "pending";
      console.log(`[Mailchimp] Contact upserted with status "${status}".`);
      return { ok: true, status };
    }

    // Error bodies carry the address but never the key, so they are safe to log.
    const detail = (await response.json().catch(() => ({}))) as {
      title?: string;
      detail?: string;
    };
    const title = detail.title ?? `HTTP ${response.status}`;
    console.error(`[Mailchimp] Subscribe failed: ${title} — ${detail.detail ?? ""}`);

    if (title === "Member In Compliance State") {
      return { ok: false, reason: "compliance" };
    }
    if (title === "Invalid Resource") {
      return { ok: false, reason: "invalid" };
    }
    return { ok: false, reason: "unknown" };
  } catch (err) {
    console.error("[Mailchimp] Request threw:", err);
    return { ok: false, reason: "unknown" };
  }
}
