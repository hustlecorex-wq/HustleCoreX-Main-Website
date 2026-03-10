# APEX Coaching Agency — replit.md

## Overview

This is a marketing landing page and lead capture system for **APEX Coaching Agency**, a service that helps online fitness coaches build premium brands. The site presents the agency's offerings and collects leads via a contact/application form. Submitted leads (name, email, Instagram, current revenue, goal, message) are stored and can be retrieved via an API.

The project is a full-stack TypeScript monorepo with:
- A **React SPA** (single page) for the public-facing marketing site
- An **Express REST API** backend for lead capture
- A **PostgreSQL database** via Drizzle ORM for persistent lead/user storage
- An in-memory fallback storage layer (`MemStorage`) used when a database is not connected

The app currently has one real page (`Home`) with animated sections, a lead form, and a `NotFound` fallback.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend

- **Framework:** React 18 with TypeScript, bootstrapped with Vite
- **Routing:** `wouter` (lightweight client-side routing); only two routes: `/` (Home) and a 404 catch-all
- **State/Data Fetching:** TanStack React Query (`@tanstack/react-query`) for server state; mutations used for form submission
- **Forms:** `react-hook-form` with `@hookform/resolvers` and Zod schemas shared from `shared/schema.ts`
- **UI Components:** shadcn/ui component library (Radix UI primitives + Tailwind CSS), "new-york" style
- **Styling:** Tailwind CSS with CSS custom properties for theming; always dark mode (no light theme toggle); primary accent color is orange (`hsl(17 100% 50%)`)
- **Animations:** Framer Motion for scroll-triggered animations (`useInView`, `AnimatePresence`), animated counters
- **Fonts:** Space Grotesk (sans), JetBrains Mono (mono), Montserrat — loaded from Google Fonts
- **Path aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend

- **Framework:** Express 5 (TypeScript), running via `tsx` in development
- **Entry point:** `server/index.ts` creates an HTTP server, registers routes, and either sets up Vite middleware (dev) or serves static files (production)
- **API routes** (defined in `server/routes.ts`):
  - `POST /api/leads` — validates with Zod and creates a lead
  - `GET /api/leads` — returns all leads
- **Storage abstraction:** `IStorage` interface in `server/storage.ts` with two implementations:
  - `MemStorage` — in-memory Map-based storage (default, no DB needed)
  - Database storage via Drizzle ORM (PostgreSQL) — schema defined, but the active storage instance is `MemStorage`; to switch, instantiate a DB-backed class
- **Build:** Custom `script/build.ts` uses esbuild (server) + Vite (client) to produce a `dist/` folder

### Database

- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema** (`shared/schema.ts`):
  - `users` table: `id` (uuid PK), `username` (unique), `password`
  - `leads` table: `id` (uuid PK), `name`, `email`, `instagram` (nullable), `currentRevenue`, `goal`, `message` (nullable), `createdAt`, `contacted`
- **Validation:** `drizzle-zod` generates Zod schemas from Drizzle table definitions; these schemas are shared between client and server via the `shared/` directory
- **Migrations:** Drizzle Kit handles schema pushes (`npm run db:push`); migrations output to `./migrations/`
- **Connection:** Requires `DATABASE_URL` environment variable; currently the app uses `MemStorage` by default and does not instantiate a database connection unless explicitly wired up

### Shared Code

- `shared/schema.ts` is imported by both the frontend (for form validation types) and backend (for API validation and DB types). This is the single source of truth for data shapes.

### Dev vs Production

- **Development:** `tsx server/index.ts` starts the server; Vite middleware is injected into Express for HMR
- **Production:** Client is built to `dist/public/`, server is bundled with esbuild to `dist/index.cjs`; Express serves static files from `dist/public/`

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| **PostgreSQL** | Primary database (requires `DATABASE_URL` env var) |
| **Drizzle ORM + drizzle-kit** | Database ORM and migrations |
| **Drizzle Zod** | Auto-generates Zod schemas from Drizzle table definitions |
| **Zod** | Runtime validation on both client and server |
| **Google Fonts** | Space Grotesk, JetBrains Mono, Montserrat — loaded via CDN link in `index.html` |
| **Radix UI** | Headless accessible UI primitives (full suite via shadcn/ui) |
| **Framer Motion** | Page and scroll animations on the Home page |
| **TanStack React Query** | Server state management and API mutations |
| **react-hook-form** | Form state management |
| **wouter** | Lightweight client-side routing |
| **connect-pg-simple** | PostgreSQL session store (included as a dependency, not yet wired up) |
| **Replit Vite plugins** | `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` — dev tooling for Replit environment |

### Environment Variables Required

- `DATABASE_URL` — PostgreSQL connection string (required for `drizzle-kit` and database storage; app runs with in-memory storage without it)