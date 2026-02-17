# Saudi SME Invoice & VAT System (VatFlow)

## Overview

VatFlow is a multi-tenant SaaS application for Saudi SMEs to manage invoices with ZATCA (Saudi tax authority) e-invoicing compliance. It provides invoice lifecycle management (Draft → Sent → Paid → Cancelled), client management, financial reporting with charts, and subscription-based usage limits. The system is architecturally ready for ZATCA Phase 2 integration with database fields for UUIDs, hashing, and XML generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses a three-folder monorepo pattern:
- `client/` — React frontend (Vite-powered SPA)
- `server/` — Express.js backend API
- `shared/` — Shared types, schemas, and route definitions used by both client and server

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter (lightweight client-side router)
- **State/Data**: TanStack Query for server state management with custom hooks per resource (`use-invoices`, `use-clients`, `use-organization`, `use-auth`)
- **UI Library**: Shadcn UI components (Radix primitives + Tailwind CSS), configured with the "new-york" style
- **Charts**: Recharts for dashboard and reporting visualizations
- **Forms**: React Hook Form with Zod validation via `@hookform/resolvers`
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support), custom fonts (Outfit for display, Plus Jakarta Sans for body)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript (run via `tsx` in dev, esbuild-bundled for production)
- **Database**: PostgreSQL with Drizzle ORM
- **Schema management**: `drizzle-kit push` for schema sync (migrations stored in `./migrations`)
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js, sessions stored in PostgreSQL via `connect-pg-simple`
- **API pattern**: RESTful JSON APIs under `/api/` prefix, with shared route/schema definitions in `shared/routes.ts`
- **Validation**: Zod schemas for all API inputs, shared between client and server via `drizzle-zod`
- **Static serving**: In production, the built client is served from `dist/public`

### Multi-Tenancy Model
- Organization-based tenant isolation — every data query filters by `organization_id`
- Users belong to exactly one organization
- Two subscription plans: `free` (10 invoices/month limit) and `basic` (unlimited)
- Middleware chain: `requireAuth` → `requireOrg` ensures proper access control

### Database Schema (PostgreSQL + Drizzle)
Key tables defined in `shared/schema.ts`:
- **organizations** — tenant table with name, VAT number, subscription plan, ZATCA fields
- **users** — linked to organizations, with Replit ID for auth, roles (admin/member)
- **clients** — customer records scoped to organization
- **invoices** — full lifecycle with status enum (draft/sent/paid/cancelled), VAT calculations, ZATCA placeholders (UUID, hash, previous hash, XML)
- **invoice_items** — line items for each invoice
- **audit_logs** — tracking all invoice actions
- **sessions** — Replit Auth session storage (managed separately in `shared/models/auth.ts`)

Note: There are two user table definitions — one in `shared/schema.ts` (the main app users with organization links) and one in `shared/models/auth.ts` (Replit Auth's required user table). The auth storage layer in `server/replit_integrations/auth/storage.ts` uses the auth-specific table.

### Build System
- **Dev**: `tsx server/index.ts` with Vite dev server middleware (HMR enabled)
- **Production build**: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Database**: `npm run db:push` syncs schema to PostgreSQL

### Key Design Decisions
1. **Shared route definitions** — API routes, methods, and response schemas are defined once in `shared/routes.ts` and used by both frontend hooks and backend handlers, ensuring type safety across the stack
2. **Drizzle over raw SQL** — Chosen for type-safe queries and easy schema-to-TypeScript generation
3. **Shadcn UI (copy-paste components)** — All UI components live in `client/src/components/ui/` and can be customized directly
4. **Demo data seeding** — New organizations get automatically seeded with sample clients and invoices for immediate demo experience

## External Dependencies

### Database
- **PostgreSQL** — Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM** — Schema definition, query building, and migrations

### Authentication
- **Replit Auth (OIDC)** — Handles user authentication via OpenID Connect
- **express-session + connect-pg-simple** — Server-side sessions stored in PostgreSQL
- **Required env vars**: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`, `ISSUER_URL`

### Key NPM Packages
- `express` — HTTP server
- `passport` + `openid-client` — Auth middleware
- `zod` + `drizzle-zod` — Runtime validation
- `@tanstack/react-query` — Client-side data fetching
- `recharts` — Data visualization
- `date-fns` — Date manipulation
- `wouter` — Client-side routing
- `react-hook-form` — Form management
- Full Shadcn/Radix UI component library

### Third-Party Services
- **Replit OIDC Provider** — External authentication provider (no self-managed passwords)
- No other external APIs currently integrated, though the build script references optional packages like `stripe`, `openai`, `nodemailer` for potential future use