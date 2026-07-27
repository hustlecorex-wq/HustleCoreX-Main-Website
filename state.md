# Project State & Architecture Blackboard

## 1. System Overview & Tech Stack
*   **Core Stack:** Node.js, Express, React (Vite), Drizzle ORM (PostgreSQL on Supabase), TailwindCSS
*   **Primary APIs:** None
*   **Deployment/Hosting:** Vercel (Static frontend + Node.js Serverless API Functions) at https://hustlecorex-main-website.vercel.app
*   **Active Database:** Supabase PostgreSQL

## 2. Active Database Schemas & Data Models
```typescript
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  instagram: text("instagram"),
  currentRevenue: text("current_revenue").notNull(),
  goal: text("goal").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  contacted: boolean("contacted").default(false).notNull(),
});
```

## 3. Marketing Site (client/)

Single-page site at `/`, rebuilt around a dark "ember beam" direction. Lead
dashboard stays at `/developer`.

*   **Page:** `client/src/pages/Home.tsx` — hero (video slot), client roster,
    what we do, results, mission, apply, footer.
*   **Components:** `client/src/components/site/`
    *   `Ambient.tsx` — `HeroBeam` (the light source; anchored to its
        container's bottom edge so it always strikes the top of the video
        frame) and `SiteBackdrop` (grain + low warm wash).
    *   `Nav.tsx` — floating pill nav with scroll-spy and mobile menu.
    *   `ApplyForm.tsx` — qualification form.
    *   `AdminAccess.tsx` — small fixed lock button in the bottom-right corner.
        Opens a passcode panel; entering `44445` writes `dev_auth` to
        localStorage and routes to `/developer`. The passcode lives in both
        this file and `Developer.tsx` — change it in both or the shortcut
        will drop you on the dashboard's own login screen.
*   **Design tokens:** `client/src/index.css` (`--void`, `--panel`, `--ember`,
    `--flare`, `--chalk`, `--ash`) mirrored into `tailwind.config.ts`.
*   **Type:** General Sans (Fontshare) for voice, JetBrains Mono for labels.
*   **Hero video:** self-hosted, not embedded. `client/public/walkthrough.mp4`
    (1900x948, 4:03, ~14MB) with `client/public/walkthrough-poster.jpg` behind
    it. Paths and aspect are the `HERO_VIDEO` / `HERO_POSTER` / `HERO_ASPECT`
    constants at the top of `Home.tsx`.

    The frame's aspect ratio is set from the file rather than fixed at 16:9, so
    a replacement recording needs `HERO_ASPECT` updated to match or it will be
    cropped by `object-cover`. `preload="none"` keeps the file off the wire
    until someone presses play.

### Lead field mapping

The apply form asks more than the table stores, so two answers are folded into
`message` rather than adding columns — no migration needed:

| Form field        | Column          |
| ----------------- | --------------- |
| Monthly revenue   | `currentRevenue`|
| Biggest time drain| `goal`          |
| Business type + client count | `message` (`"Business: X · Clients: Y"`) |
