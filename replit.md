# HustleCoreX — Agency Website

Premium marketing website for HustleCoreX, an agency for online fitness coaches.

## Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Express.js + in-memory storage
- **Fonts**: Space Grotesk, JetBrains Mono
- **UI**: Fully custom minimal design system

## Brand
- **Name**: HustleCoreX
- **Logo**: `@assets/logo_transparent.png` (orange crown/sword mark, background removed)
- **Founder photo**: `@assets/main_profile_pic_20260225_150724_0000_1773138297391.png`
- **Colour discipline**: `#FF4500` orange used ONLY on primary CTAs and eyebrow labels
- **Background**: `#080808` with subtle SVG noise texture / surfaces `#0D0D0D`
- **Borders**: `rgba(255,255,255,0.05)` — extremely subtle throughout
- **Philosophy**: World-class editorial, radical simplicity — Stripe/Linear/Vercel aesthetic

## Typography
- `.display` — 900 weight, -0.04em tracking, 0.92 line-height
- `.heading` — 800 weight, -0.03em tracking, 1.0 line-height
- `.label` — 11px, 0.18em tracking, uppercase, white/28
- `.label-accent` — same but orange/55
- Hero display: `clamp(3.6rem, 8.5vw, 7.5rem)`
- Section h2: `clamp(2.8rem, 5.5vw, 4.5rem)`

## Page Sections
1. **Nav** — fixed, transparent → frosted on scroll, mobile fullscreen overlay
2. **Hero** — cinematic full-viewport: 3-tier typographic headline (outline/6-FIGURE shimmer/white), floating result cards (desktop), stats row, CTAs
3. **Ticker** — scrolling social proof bar
4. **Problem** — editorial 2-col: headline left, before/after grid right
5. **System** — scroll-driven vertical journey (4 PillarRow components with unique visuals)
6. **Results** — 4 testimonial cards (real coach photos) + aggregate stats block
7. **FAQ** — accordion in bordered container
8. **CTAStrip** — urgency banner with glow effect
9. **Apply** — lead capture form (Controller selects for automation compatibility)
10. **Footer** — 4-col grid

## API
- `POST /api/leads` — Submit application (name, email, instagram, currentRevenue, goal, message)
- `GET /api/leads` — List all leads (in-memory)

## Form Notes
- Select fields use `Controller` from react-hook-form (not `register`) for proper controlled behaviour
- All interactive elements have `data-testid` attributes for e2e testing

## Running
```
npm run dev
```
Port 5000.
