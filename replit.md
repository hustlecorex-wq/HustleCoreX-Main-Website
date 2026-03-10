# APEX Coaching Agency Website

A premium, minimalist marketing website for an online fitness coaching agency.

## Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Express.js + in-memory storage
- **Fonts**: Space Grotesk (body), JetBrains Mono (mono)
- **UI**: Shadcn components, custom minimal design system

## Design System
- **Background**: `#080808` (near-black)
- **Primary accent**: `#FF4500` (orange — used sparingly)
- **Typography**: Space Grotesk, black weight headlines at `-0.02em` tracking
- **Cards**: Bordered grid layout with `rgba(255,255,255,0.06)` dividers, `bg-[#0A0A0A]`
- **Philosophy**: Minimal, sharp, professional — inspired by Stripe/Linear/Vercel

## Page Sections (top to bottom)
1. **Nav** — Fixed, transparent-to-opaque on scroll, mobile hamburger
2. **Hero** — Full-screen, stats row, two CTAs
3. **Problem** — 6-card bordered grid showing before/after
4. **System** — 5-pillar tab interface (Brand, Website, Leads, Automation, Analytics)
5. **Services** — 6-card bordered grid
6. **Process** — 5-step bordered list layout
7. **Results** — 4 testimonial cards + stats row
8. **Pricing** — 3 plans (Launchpad $2,497, Growth System $4,997, Empire custom)
9. **FAQ** — Accordion in bordered container
10. **CTA Strip** — Horizontal banner
11. **Apply** — Lead capture form (2-column on desktop)
12. **Footer** — 4-column grid

## API
- `POST /api/leads` — Submit application form (stores name, email, instagram, revenue, goal, message)
- `GET /api/leads` — List all leads

## Running
```
npm run dev
```
Serves on port 5000 (Express + Vite proxy).
