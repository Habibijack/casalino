# CLAUDE.md -- Casalino B2B Coding Standards

## Project Overview
Casalino is a B2B SaaS platform for Swiss property management companies.
AI-powered end-to-end rental management: from listing creation to signed contract.
Monorepo with Turborepo + pnpm.

## Architecture
apps/web          -> Next.js 15 (App Router, RSC) -- deployed on Vercel
apps/api          -> Hono.js API server -- deployed on Railway
apps/workers      -> BullMQ background jobs -- deployed on Railway
packages/db       -> Drizzle ORM schema + migrations (shared)
packages/shared   -> Types, Zod validators, constants (shared)
packages/ui       -> shadcn/ui component library (shared)
packages/email    -> React Email templates (shared)

## Tech Stack
- **Language**: TypeScript strict (NO `any`, NO `as`, NO `@ts-ignore`)
- **Framework**: Next.js 15 with App Router and Server Components
- **API**: Hono.js with typed middleware
- **Styling**: Tailwind CSS v4 + shadcn/ui (Design Tokens in globals.css)
- **Database**: Supabase PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth (Magic Link + Google OAuth)
- **AI**: Claude API (Anthropic SDK)
- **Background Jobs**: BullMQ + Redis (Upstash)
- **Validation**: Zod (all inputs validated)
- **Email**: Resend + React Email
- **Icons**: Lucide React only
- **Credit Check**: tilbago CredRep API

## 4 Core Features
1. **Inserat-Erstellung** (free) -- AI text DE/FR/IT, price suggestion, multi-portal publishing
2. **AI-Bewerber-Screening** (CHF 199/listing) -- 100-point score, tilbago credit, Sprach-Bridge
3. **Besichtigungs-Autopilot** (included) -- Slot booking, reminders, no-show tracking
4. **Smart Mietvertrag** (CHF 49/contract) -- Pre-filled, digital signature, handover protocol

## Coding Rules

### TypeScript
- ALWAYS use `strict: true`
- NEVER use `any` -- use `unknown` and narrow
- NEVER use `as` type assertions -- use type guards
- NEVER use `@ts-ignore` or `@ts-expect-error`
- Max 50 lines per function
- Max 300 lines per file
- All exports must be typed
- Named exports everywhere (except Next.js pages/layouts)
- English variable/function names (not `bewerbung`, use `application`)

### File Naming
- Components: PascalCase (`Button.tsx`, `Sidebar.tsx`)
- Utils/hooks: camelCase (`useAuth.ts`, `formatPrice.ts`)
- Schema/config: kebab-case (`org-members.ts`, `drizzle.config.ts`)

### Database (Drizzle)
- Table names: snake_case (`org_members`)
- Column names: snake_case (`created_at`)
- Primary keys: uuid with defaultRandom()
- Always include: created_at, updated_at
- Always use RLS policies via Supabase
- Organization-scoped: every user-facing table has org_id
- Soft delete: deleted_at (nullable timestamp)
- JSONB for flexible data

### API (Hono.js)
- Base path: /api/v1/{resource}
- Always validate input with Zod
- Always return typed ApiResponse<T>
- Use cursor-based pagination
- Rate limit all endpoints
- Auth middleware: JWT verification via Supabase
- Org-context middleware: resolve org_id from user membership

### UI Rules (Phase 1: German only)
- ALL UI text hardcoded in German for Phase 1
- NUR shadcn/ui components -- no other UI libraries
- NUR Lucide icons -- no FontAwesome, Heroicons, etc.
- KEINE Emojis in the UI -- not in buttons, headers, badges, labels
- Dark mode support via CSS variables (class strategy)
- Desktop-first layout (min-width 1024px for dashboard)

### Design System
- **Primary**: #1A1714 (dark -- sidebar, headers, primary buttons)
- **Accent**: #E8503E (CTAs, active states, badges, highlights)
- **Background**: #FAFAF8 (light) / #09090B (dark)
- **Card**: #FFFFFF (light) / #1C1917 (dark)
- **Border**: #E5E5E5 (light) / #292524 (dark)
- **Sidebar**: #1A1714 bg, #FAFAF8 text, 220px fixed
- **Font**: Inter (headings 600-700, body 400)
- **Border Radius**: 6px (badges), 8px (inputs), 12px (cards)
- **Grid**: 8px base
- **Shadows**: subtle (0 1px 2px rgba(0,0,0,0.05))

### Score System (100 Points)
```
80-100 -> success (#16A34A) -> "Top-Kandidat"
60-79  -> info (#2563EB) -> "Gut"
40-59  -> warning (#CA8A04) -> "Durchschnitt"
< 40   -> destructive (#DC2626) -> "Unter Schwelle"
```

### Scoring Weights
- Financial: 35 pts (income-to-rent ratio)
- Dossier: 25 pts (document completeness)
- Matching: 20 pts (criteria fit)
- Communication: 10 pts (response quality)
- Credit: 10 pts (tilbago check)

### AI Model Routing
- Fast (Haiku): screening, summaries, communication drafts
- Quality (Sonnet): listing generation, ranking, contracts

### Sprach-Bridge
- AI communicates in applicant's language
- Dashboard always German (Phase 1)
- Applicant language is auto-detected, NOT a scoring factor

### Anti-Discrimination (CRITICAL)
NEVER include in scoring: nationality, gender, age, religion, sexual orientation.
Residence permit only binary: has_swiss_residence_permit: boolean
All scores logged in audit_log with anonymized inputs.

### Security
- Supabase Auth + RLS on ALL tables
- Documents in Supabase Storage with org-scoped policies
- API keys ONLY in .env, never in code
- Rate limiting on all API routes
- CORS: casalino.ch + localhost
- Input validation with Zod on every endpoint
- XSS protection via React (default escaped)
- No raw SQL -- Drizzle ORM only

### Git Workflow
- Branch naming: feature/phase-X-description
- Commit messages: "Phase X: description"
- Always run type-check before commit

## Commands
```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm type-check   # TypeScript check all packages
pnpm lint         # Lint all packages
pnpm db:generate  # Drizzle migrations generate
pnpm db:push      # Push schema to Supabase
pnpm db:seed      # Seed dev data
```

## Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# tilbago
TILBAGO_API_URL=
TILBAGO_API_KEY=

# Resend
RESEND_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3737
API_URL=http://localhost:4000
```

NEVER commit .env.local files.
