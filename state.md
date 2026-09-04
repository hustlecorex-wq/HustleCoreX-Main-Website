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
    *   `Showcase.tsx` - the work, all of it, in one pinned pan. See below.
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
in one section that pins while you walk it. Scrolling down moves the track
sideways one pixel per pixel of scroll, so it reads as panning a shelf rather
than as the page being taken away. The segment row and the arrows jump straight
to a build, and `Skip ahead` leaves for `#build` (the What we build section,
which exists to be landed on).

What separates the two kinds of work is the chrome, not the section: a system
is framed in an app window carrying the product's name and mark, a site in a
browser window carrying its address. A site's `chrome` is an address bar with a
padlock in it, so it may only ever hold a domain that resolves.

**What is in the frame is the build itself.** Five of the six are loaded live in
an iframe at 1440x900 - their real desktop width - and scaled to the frame by
`--fit`, so a visitor can click in and use Katie's dashboard rather than look at
a picture of it. Three things make that work:

*   The frame is covered by `.window-shield` until it is clicked. An uncovered
    iframe swallows the wheel, and a carousel driven by the wheel would stop
    dead over every card. Clicking hands the pointer over; Escape, a click
    outside, the Release button in the window bar, or moving to another build
    hands it back.
*   At most four frames are alive: the build being read, its neighbours, and
    nothing more than two away. Nothing is mounted at all until the section is
    within 500px of the viewport, so the page still loads at the cost of six
    stills.
*   Below `PAN_QUERY` (1024px wide, 660px tall - mirrored in `index.css`) the
    pinning is dropped, the same track becomes a swipeable rail, and nothing is
    framed: a dashboard drawn 335px wide is not a dashboard, so the phone gets
    the still and a cue that opens the live build in its own tab.

**Before adding a build with a `live` URL, check the host will be framed:**

    curl -sI <url> | grep -i "x-frame-options\|content-security"

Anything answering `X-Frame-Options`, or a `frame-ancestors` that does not
name this site, renders as a blank box with nothing in our console to say why.

All six are framed. Five of them set no framing header at all. BOWT is the
exception: it used to answer `X-Frame-Options: SAMEORIGIN` and could not be
framed, so `EliteFitnessApp/vercel.json` in the Main Fitness Dashboard repo
now answers

    Content-Security-Policy: frame-ancestors 'self' https://hustlecorex.com
      https://www.hustlecorex.com https://hustlecorex-main-website.vercel.app

instead - which is stricter than `SAMEORIGIN` was for everyone except us.
That header is the only reason BOWT is in a frame, so if that project ever
drops it, drop `live` from the BOWT entry and it goes back to a poster and a
link on its own. It names the deployed origins only, so the BOWT card is a
blank frame on `localhost` - that one is expected, and the other five still
run there.

Posters live in `client/public/work/live-*.jpg`, cut to 1440x900 to match the
frame exactly - so the swap from still to live build is invisible. They are
captured from the builds themselves:

    chrome --headless=new --hide-scrollbars --window-size=1440,900       --virtual-time-budget=15000 --screenshot=out.png <url>
    ffmpeg -y -i out.png -q:v 4 client/public/work/live-<id>.jpg

On a phone the frame switches to 4:3 and shows the top of the shot at a bigger
scale: the full 16:10 at that width is 209px tall and little in it can be read.

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
