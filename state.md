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

Single-page site at `/`, dark "ember beam" direction. Lead dashboard stays at
`/developer`, privacy policy at `/privacy`, and `/apply` opens the home page on
the form.

*   **Page:** `client/src/pages/Home.tsx` - hero, showcase, what we build,
    results, mission, apply, footer.
*   **Components:** `client/src/components/site/`
    *   `Ambient.tsx` - `HeroBeam` (the light source; anchored to its
        container's bottom edge, which is now the line the showcase sits on)
        and `SiteBackdrop` (grain + low warm wash).
    *   `Showcase.tsx` - the work, all of it, on one screen. See below.
    *   `SectionRule.tsx` - the eyebrow/rule/count line every section opens
        with. The right-hand slot only ever holds a real count.
    *   `ProofWall.tsx` - filmed and written reviews in one collage.
    *   `Nav.tsx` - floating pill nav with scroll-spy and mobile menu.
    *   `ApplyForm.tsx` - qualification form.
    *   `VideoFrame.tsx` - self-hosted player, used only by the testimonial
        clips now that the walkthrough videos are gone.
    *   `AdminAccess.tsx` - small fixed lock button in the bottom-right corner.
        Opens a passcode panel; entering `44445` writes `dev_auth` to
        localStorage and routes to `/developer`. The passcode lives in both
        this file and `Developer.tsx` - change it in both or the shortcut
        will drop you on the dashboard's own login screen.
*   **Design tokens:** `client/src/index.css` (`--void`, `--panel`, `--ember`,
    `--flare`, `--chalk`, `--ash`, `--ash-dim`, `--ash-faint`) mirrored into
    `tailwind.config.ts`.
*   **Type:** Satoshi for headlines (`.display`, `.heading`), General Sans for
    running text, JetBrains Mono for labels and counts.

    Both Fontshare faces come from one request in `client/index.html`, and the
    `f[0]=`/`f[1]=` indices in that URL are load-bearing. Fontshare's own
    documented `f[]=a&f[]=b` form does not survive two families: it serves the
    first and silently substitutes Clash Display for the second, with a 200.

### The showcase

`Showcase.tsx` holds every finished build - the dashboards and the websites -
in one section that stays one screen tall however many are added. A stage shows
the selected build, a rail underneath carries all of them at once, and picking
one swaps the stage instead of adding another 700px to the page.

What separates the two kinds of work is the chrome, not the section: a system
is framed in an app window with the product's own section tabs, a site in a
browser window with its address bar. The address is only ever a domain we know
resolves - `isDomain()` decides whether the padlock appears at all.

Auto-advance moves the stage every 7s, stops for good on the first deliberate
pick, pauses on hover, and does not run at all under reduced motion or while
the section is off screen. The lit rule on the active rail cell is both the
selection marker and the timer.

Stills live in `client/public/work/`, cut to 1680x712 to match `.window-stage`.
The dashboard stills were pulled out of the walkthrough recordings with ffmpeg
before those were deleted, cropped to clear both the webcam overlay in the
bottom-right corner and the app's own top nav bar - otherwise the window would
carry two stacked nav bars, its own and the screenshot's:

    ffmpeg -ss <t> -i recording.mp4 -frames:v 1       -vf "crop=1817:770:0:90,scale=1680:712:flags=lanczos" -q:v 4 out.jpg

On a phone the stage switches to 3:2 and a system anchors to its top-left
corner: the full 2.36:1 shot at that width is 138px tall and nothing in it can
be read.

### Above the fold

The hero's reveals are CSS animations (`.line-rise`, `.rise-in`), not scripted
ones. A JS reveal that starts at opacity 0 and waits on a frame callback leaves
the hero blank if those frames are throttled, which is what a background tab
does. Everything below the fold still uses framer-motion `whileInView`.

### Lead field mapping

The apply form asks more than the table stores, so two answers are folded into
`message` rather than adding columns - no migration needed:

| Form field        | Column          |
| ----------------- | --------------- |
| Monthly revenue   | `currentRevenue`|
| Biggest time drain| `goal`          |
| Business type + client count | `message` (`"Business: X · Clients: Y"`) |
