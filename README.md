# DevBoards.io — Frontend

Server-side rendered public web app. Built with Qwik + QwikCity for maximum performance and resumability.

## Tech Stack

- **Framework**: [Qwik](https://qwik.dev/) 1.16 + QwikCity (SSR + routing)
- **Runtime**: [Bun](https://bun.sh/) (server), browser (client)
- **Build**: Vite
- **Language**: TypeScript 5.4.5 (strict)
- **Styling**: Tailwind CSS 3.4
- **Testing**: Playwright E2E

## Prerequisites

- Bun v1.2+
- Backend running at `PUBLIC_API_URL` (default: `http://localhost:3001`)

## Setup

```bash
cd apps/frontend
bun install
cp .env.example .env
# Edit .env
bun run dev     # port 3000
```

## Environment Variables

```bash
PUBLIC_API_URL=http://localhost:3001    # Backend URL
PUBLIC_GOOGLE_MAPS_KEY=                # Google Maps API key (job search map)
VITE_CLARITY_ID=                       # Microsoft Clarity analytics (optional)
```

## Project Structure

```
src/
├── entry.bun.ts      # Server entry — security headers (CSP, HSTS)
├── entry.ssr.tsx     # SSR entry point
├── root.tsx          # Root with I18nProvider, AuthProvider, ThemeProvider
├── routes/           # Directory-based routing (QwikCity)
│   ├── api/proxy/    # Server-side API proxy → backend
│   ├── jobs/         # Job listing + detail
│   ├── news/         # News feed + article detail
│   ├── profile/      # User profile + wizard
│   ├── admin/        # Admin stats + content management
│   ├── auth/         # Login, register, forgot/reset password
│   └── contact/      # Contact form
├── components/       # Reusable UI components
├── contexts/         # Auth, I18n, Theme, Jobs contexts
├── locales/          # i18n JSON files (it, en, es, de, fr)
├── hooks/            # useInfiniteScroll
├── types/            # TypeScript models
└── utils/            # API client, sanitization, date, logging
e2e/                  # Playwright E2E specs (~11 files)
```

## Scripts

```bash
bun run dev            # Development server
bun run build          # Production build
bun run build.types    # TypeScript check only
bun run serve          # Serve production build locally
bun run preview        # Local production preview
bun run test.e2e       # Run Playwright tests (requires backend on :3001)
bun run test.e2e.ui    # Playwright UI mode
bun run test.e2e.report # View last HTML report
bun run lint           # ESLint
bun run fmt            # Prettier format
bun run fmt.check      # Check formatting
```

## API Proxy

All client-side API calls go through `/api/proxy/[...path]`:

1. Client sends request to `/api/proxy/auth/login`
2. Server route injects `Authorization: Bearer <token>`
3. Forwards to `{PUBLIC_API_URL}/auth/login`
4. Returns proxied response

This avoids CORS and keeps JWTs out of browser storage.

## i18n

- 5 locales: `it` (default), `en`, `es`, `de`, `fr`
- Files: `src/locales/{lang}.json`
- Persistence: cookie `preferred-language`
- Usage: `const t = useTranslate()` → `t('jobs.search_placeholder')`

## Qwik Rules

- Never use `useVisibleTask$` — SSR unsafe, fails linting.
- Use `$` suffix on all event handlers: `onClick$`, not `onClick`.
- Use `QRL<() => void>` type for function props.
- Keep `$()` wrappers for all operations that cross component boundaries.

## Security Headers

Defined in `entry.bun.ts` (applied server-side on every response):

- CSP with `trusted-types` — update when adding new external domains.
- HSTS `max-age=63072000; includeSubDomains; preload`
- Custom CSRF guard for bodyless DELETE requests.

## Docker

```bash
docker build \
  --build-arg PUBLIC_API_URL=https://api.devboards.io \
  --build-arg PUBLIC_GOOGLE_MAPS_KEY=your-key \
  -t devboards-frontend .
```

Two-stage: Bun builder → Bun runtime server. Healthcheck on `GET /health`.
