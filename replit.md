# HustleCoreX — Agency Website

Premium marketing website for HustleCoreX, an agency for online fitness coaches.

## Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Express.js + in-memory storage
- **Fonts**: Space Grotesk, JetBrains Mono
- **UI**: Custom minimal design system

## Brand
- **Name**: HustleCoreX
- **Logo mark**: HCX (orange square badge)
- **Primary colour**: `#FF4500` (orange, used sparingly as accent)
- **Background**: `#070707` / surfaces `#0C0C0C`
- **Philosophy**: Editorial, minimal, premium — Stripe/Linear-inspired dark aesthetic

## Design Principles
- Mobile-first: 390px → tablet → desktop
- Bordered grid system for all card layouts
- `clamp()` fluid type for headings
- Dividers between every section (instead of background changes)
- Orange accent on icons, CTAs, and active states only

## Sections
1. Nav — fixed, transparent→opaque on scroll, mobile hamburger
2. Hero — full viewport, stats row
3. Problem — 6-card bordered grid (before/after)
4. System — 5-pillar tab interface
5. Services — 6-card bordered grid
6. Process — numbered bordered list
7. Results — 4 testimonials + stats row
8. Pricing — 3 plans (Launchpad $2,497 / Growth System $4,997 / Empire custom)
9. FAQ — accordion in bordered container
10. CTA Strip — horizontal banner
11. Apply — lead capture form (2-col desktop, 1-col mobile)
12. Footer — 4-col grid

## API
- `POST /api/leads` — Submit application (name, email, instagram, revenue, goal, message)
- `GET /api/leads` — List leads

## Running
```
npm run dev
```
Port 5000.
