# CLAUDE.md – Casalino Coding Standards

## Project Overview
Casalino is a multilingual AI-powered apartment search assistant for Switzerland.
Monorepo with Turborepo + pnpm.

## Architecture
apps/web          → Next.js 15 (App Router, RSC) – deployed on Vercel
apps/scraper      → Standalone worker (Playwright, BullMQ) – deployed on Railway
packages/db       → Drizzle ORM schema + migrations (shared)
packages/shared   → Types, Zod validators, constants (shared)
packages/ui       → shadcn/ui components (shared)

## Tech Stack
- **Language**: TypeScript strict (NO `any`, NO `as`, NO `@ts-ignore`)
- **Framework**: Next.js 15 with App Router and Server Components
- **Styling**: Tailwind CSS v4 + shadcn/ui (Casalino Design Tokens in globals.css)
- **Database**: Supabase PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth (Magic Link + Google OAuth)
- **AI**: Vercel AI SDK (provider-agnostic: OpenAI, Anthropic, Google)
- **i18n**: next-intl with /de/, /fr/, /it/ URL routing
- **Validation**: Zod (all inputs validated)
- **Email**: Resend + React Email

## Coding Rules

### TypeScript
- ALWAYS use `strict: true`
- NEVER use `any` – use `unknown` and narrow
- NEVER use `as` type assertions – use type guards
- NEVER use `@ts-ignore` or `@ts-expect-error`
- Max 50 lines per function
- Max 300 lines per file
- All exports must be typed

### File Naming
- Components: PascalCase (`Button.tsx`, `ChatPanel.tsx`)
- Utils/hooks: camelCase (`useChat.ts`, `formatPrice.ts`)
- Schema/config: kebab-case (`search-profiles.ts`, `drizzle.config.ts`)

### Database (Drizzle)
- Table names: snake_case (`search_profiles`)
- Column names: snake_case (`created_at`)
- Primary keys: uuid with defaultRandom()
- Always include: created_at, updated_at
- Always use RLS policies via Supabase

### API Routes
- Path: /api/v1/{resource}
- Always validate input with Zod
- Always return typed ApiResponse<T>
- Use cursor-based pagination
- Rate limit all endpoints

### i18n (Multilingual)
- ALL user-facing strings via next-intl `t()` function
- NEVER hardcode text in components
- Message files: src/messages/{locale}.json
- UI languages: DE, FR, IT
- AI chat: responds in user's language (auto-detect)
- Sprach-Bridge: user writes any language → output in listing language

### AI Integration Rules
| Feature | Input Language | Output Language |
|---------|---------------|-----------------|
| Chatbot | User's language | Same language |
| Inserat-Decoder | Listing language | User's preferred_language |
| Motivationsschreiben | User profile | LISTING language |
| Email Alerts | – | User's preferred_language |

### Design System
- **Headings**: font-heading (Instrument Serif)
- **Body**: font-body (Satoshi)
- **Primary**: #E8503E (CTAs, FAB, Brand)
- **Background**: #FAF7F2
- **Cards**: #FFFFFF with border-border
- **Grid**: 8px base
- **Border Radius**: 12-20px (cards), 100px (pills)
- **Touch Targets**: min 44px
- **Shadows**: subtle (0 1px 3px rgba(0,0,0,0.04))

### Chat Architecture
- Panel: 92vh slide-up, 0.4s cubic-bezier(0.32, 0.72, 0, 1)
- FAB: fixed bottom-right, primary color
- Chat types: 'main' (via FAB) | 'listing' (via "Interesse bekunden")
- Draft badge: green, "KI-GENERIERTER ENTWURF"

### Security
- Supabase Auth + RLS on ALL user tables
- Documents in Supabase Storage with user policies
- API keys ONLY in .env, never in code
- Rate limiting on all API routes
- CORS: casalino.ch + localhost
- Input validation with Zod on every endpoint
- XSS protection via React (default escaped)

### Git Workflow
- Branch naming: feature/sprint-X-description
- Commit messages: "Sprint X: description"
- Always run type-check before commit

## Commands
```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm type-check   # TypeScript check all packages
pnpm lint         # Lint all packages
```

## Environment Variables
See apps/web/.env.example for required variables.
NEVER commit .env.local files.
