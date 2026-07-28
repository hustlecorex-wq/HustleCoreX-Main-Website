/* ═══════════════════════════════════════════════════════════════
   Stack Tower - the only place tools, prices and order are defined.
   Nothing below is hard-coded in the scene components.

   Every price is the MONTHLY-BILLED list price a solo online coach
   actually pays, not the discounted annual rate. Annual pricing makes
   the tower look cheaper than the reality it is arguing against.

   Verified 2026-07-28. Re-check before any campaign that quotes these
   numbers publicly - SaaS pricing moves, and a stale figure on a sales
   page is worse than no figure at all.
   ═══════════════════════════════════════════════════════════════ */

export type StackTool = {
  /** stable key - also used as the React key and the GSAP label */
  id: string;
  /** shown on the front face of the block */
  name: string;
  /** what the coach is actually buying, listed under the tower */
  role: string;
  /** monthly USD, billed monthly */
  priceUsd: number;
  /** which tier the price refers to - keeps the claim defensible */
  tier: string;
  /** where the number came from */
  source: string;
};

/* Order = order of the fall. Index 0 lands first and ends up at the
   bottom of the tower, the last index lands on top. */
export const STACK_TOOLS: StackTool[] = [
  {
    id: "trainerize",
    name: "ABC Trainerize",
    role: "Client app, programming, check-ins",
    priceUsd: 50,
    tier: "Pro, with Stripe payments and nutrition add-on",
    source: "https://www.pt-suite.com/blog/trainerize-add-on-trap-real-cost-2026",
  },
  {
    id: "kajabi",
    name: "Kajabi",
    role: "Courses, funnels, email",
    priceUsd: 179,
    tier: "Basic, billed monthly",
    source: "https://kourses.com/kajabi-pricing/",
  },
  {
    id: "manychat",
    name: "ManyChat",
    role: "Instagram DM automation",
    priceUsd: 29,
    tier: "Pro, 2,500 contacts",
    source: "https://setsmart.io/blog/manychat-pricing",
  },
  {
    id: "calendly",
    name: "Calendly",
    role: "Call booking",
    priceUsd: 12,
    tier: "Standard, per seat, billed monthly",
    source: "https://www.usecarly.com/blog/calendly-pricing/",
  },
  {
    id: "zapier",
    name: "Zapier",
    role: "Glue between all of the above",
    priceUsd: 30,
    tier: "Professional, billed monthly",
    source: "https://automationatlas.io/answers/zapier-pricing-explained-2026/",
  },
];

/** Running total after each block lands - drives the counter. */
export const STACK_CUMULATIVE: number[] = STACK_TOOLS.reduce<number[]>(
  (acc, tool) => [...acc, (acc[acc.length - 1] ?? 0) + tool.priceUsd],
  [],
);

export const STACK_TOTAL_MONTHLY =
  STACK_CUMULATIVE[STACK_CUMULATIVE.length - 1] ?? 0;

export const STACK_TOTAL_YEARLY = STACK_TOTAL_MONTHLY * 12;

export const formatUsd = (value: number) =>
  `$${Math.round(value).toLocaleString("en-US")}`;

/* ─── scene geometry ────────────────────────────────────────────
   Kept here so the tower stays proportional when blocks are added or
   removed. The scene reads these values; it never redefines them. */
export const BLOCK = {
  width: 3.4,
  height: 0.62,
  depth: 1.5,
  /** vertical gap between stacked blocks */
  gap: 0.05,
  /** corner rounding */
  radius: 0.07,
  /** thickness of the ember rim */
  rim: 0.022,
  /** y a block falls from */
  dropFrom: 7.2,
} as const;

/** Resting y of block `index`, with the whole tower centred on origin. */
export function restingY(index: number, count = STACK_TOOLS.length) {
  const step = BLOCK.height + BLOCK.gap;
  const towerHeight = count * step - BLOCK.gap;
  return -towerHeight / 2 + BLOCK.height / 2 + index * step;
}

/* ─── brand tokens, mirrored from client/src/index.css ───────────
   WebGL materials cannot read CSS custom properties, so the values the
   scene needs live here as well. Change them in both places. */
export const SCENE_COLORS = {
  void: "#07070A",
  panel: "#0E0E13",
  ember: "#FF4A17",
  chalk: "#F5F3F1",
  ash: "#9A9AA5",
} as const;
