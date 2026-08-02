# Next.js Coding Practices

Reference doc for the Next.js side of the project: the vendor/owner/super-admin web dashboards, and the API layer the Flutter app calls for anything requiring auth or writes (per `CONTEXT.md`). Hand this to Claude Code alongside the Flutter docs.

## Stack decisions

- **App Router**, not Pages Router.
- **TypeScript** everywhere — no `.js` files in `app/` or `lib/`.
- **Hosted on Vercel.**
- **Supabase is Postgres only** — no Supabase Auth. This app owns the custom auth system (JWT issuing/verification) referenced in `CONTEXT.md`.
- This codebase serves **two audiences** from one project: rendered pages for the web dashboards, and JSON Route Handlers (`app/api/*`) that the Flutter app calls. Keep that distinction explicit in the folder structure below — don't blur dashboard page logic and public API logic together.

## Hard rule — do not deviate

**The Supabase `service_role` key only ever lives in server-side code** — Route Handlers, Server Components, Server Actions. Never in a file that ships to the browser, never prefixed `NEXT_PUBLIC_`, never passed into a Client Component as a prop. If a Client Component needs Supabase data, it goes through a Route Handler or Server Action, not a direct Supabase call with an elevated key.

## Folder structure

```
app/
  (dashboard)/                 -- route group: authenticated web UI
    layout.tsx                  -- checks session, redirects if unauthenticated
    vendor/
      page.tsx
      terminals/
        page.tsx
    owner/
      page.tsx
    admin/
      page.tsx
  api/                          -- JSON endpoints, consumed by Flutter and/or dashboard client components
    auth/
      login/route.ts
      logout/route.ts
    terminals/
      route.ts                  -- GET list, POST create
      [id]/route.ts              -- GET/PATCH/DELETE single terminal
  layout.tsx
  page.tsx
  globals.css
middleware.ts                   -- protects (dashboard) routes by checking the session cookie
lib/
  supabase/
    server.ts                    -- server-only client, uses service_role key
  auth/
    jwt.ts                       -- sign/verify functions, uses JWT_SECRET
    session.ts                   -- cookie read/write helpers for the dashboard
  validations/
    terminal.ts                  -- zod schemas, shared between Route Handlers and forms
  utils/
components/
  ui/                            -- shared, dumb, reusable components
  features/
    terminals/
      terminal-table.tsx
      terminal-form.tsx
types/
  database.types.ts              -- generated: `supabase gen types typescript`
```

## Server Components by default

- Every component is a Server Component unless it needs interactivity, browser APIs, or React hooks — only then add `'use client'` at the top of the file.
- Dashboard pages fetch data directly in the Server Component (`await` a Supabase query or a `lib/` helper) rather than fetching client-side and showing a spinner. Reserve client-side fetching (`useEffect`, React Query, etc.) for genuinely interactive things like live filters or polling.
- Keep Client Components small and pushed to the leaves of the tree — a page can be a Server Component that renders one small Client Component for the interactive part, rather than the whole page being client-rendered.

## Supabase client setup

```ts
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';

// Server-only. Never import this file from a Client Component.
export function supabaseServer() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
```

No client-side Supabase client is needed in this project — the browser never talks to Supabase directly from the dashboard. All reads and writes go through Server Components, Server Actions, or Route Handlers.

## Custom auth

```ts
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

export function signToken(payload: { userId: string; role: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
}
```

- **Web dashboard**: session token stored in an `httpOnly` cookie, set on login in `app/api/auth/login/route.ts`. `middleware.ts` checks this cookie on every request to `(dashboard)/*` and redirects to login if missing/invalid.
- **Flutter app**: same login route returns the JWT in the JSON response body instead of (or in addition to) a cookie. Flutter stores it in `flutter_secure_storage` and sends it as `Authorization: Bearer <token>` on subsequent calls to `app/api/*`.
- Password hashing (`bcrypt`) happens only inside the login/signup Route Handlers, using `supabaseServer()` — never anywhere else.

## Route Handler conventions

```ts
// app/api/terminals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  const { data, error } = await supabaseServer()
    .from('terminals')
    .select('*');

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data, error: null });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { role } = verifyToken(authHeader.replace('Bearer ', ''));
    if (role !== 'super_admin' && role !== 'vendor') {
      return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid token' }, { status: 401 });
  }

  // ...validate body with zod, then insert
}
```

- **Consistent response envelope**: every Route Handler returns `{ data, error }`, never a bare array or a thrown unhandled exception.
- **Every route that isn't a public read validates the `Authorization` header** and checks role before touching Supabase.
- **Validate request bodies with `zod`** before they reach Supabase — don't rely on database constraints alone to catch bad input.

## Validation

```ts
// lib/validations/terminal.ts
import { z } from 'zod';

export const createTerminalSchema = z.object({
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  chargerClass: z.enum(['AC', 'DC']),
  connectorType: z.string().optional(),
});
```

Reuse the same schema on both the Route Handler (server-side validation) and any dashboard form (client-side validation via `react-hook-form` + `zodResolver`), so the rules only live in one place.

## Naming conventions

- Files and folders: `kebab-case`
- Components: `PascalCase` function name, file name in `kebab-case` (`terminal-table.tsx` exports `TerminalTable`)
- Route Handler files are always `route.ts`, Server Component pages are always `page.tsx` — this is a Next.js convention, not optional
- One exported component per file

## Type safety

- Generate Supabase types after every schema change: `supabase gen types typescript --project-id <id> > types/database.types.ts`
- Use the generated `Database` type when creating the Supabase client so query results are typed, not `any`
- No `any` in `lib/` or `app/api/` — if a type is genuinely unknown, use `unknown` and narrow it

## Error handling

- Route Handlers never let an unhandled exception reach the client — wrap Supabase calls and auth checks in `try/catch`, return the `{ data: null, error: message }` shape with an appropriate status code
- Server Components that fail to fetch required data should throw, and rely on a route-level `error.tsx` to render a fallback — don't silently render an empty page
- Log errors server-side with enough context to debug (route, user role, but never log tokens or password hashes)

## Styling

- Tailwind CSS, utility classes directly in JSX — avoid separate CSS files unless styling something Tailwind genuinely can't express cleanly
- Shared, purely presentational pieces (buttons, inputs, cards) live in `components/ui/`; feature-specific composed components live in `components/features/<feature>/`

## Environment variables

| Variable | Exposure | Notes |
|---|---|---|
| `SUPABASE_URL` | Server only | Used inside `lib/supabase/server.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Never `NEXT_PUBLIC_`, never in a Client Component |
| `JWT_SECRET` | Server only | Signs/verifies auth tokens |
| `NEXT_PUBLIC_*` | Anything here ships to the browser | Only put genuinely public values behind this prefix — double-check before adding one |

Set these per-environment in Vercel (development/preview/production), never commit `.env.local`.

## Linting & formatting

- ESLint with `next/core-web-vitals` config as the base
- Prettier for formatting, run on save / pre-commit
- `no-explicit-any` and `no-unused-vars` enabled, not just defaults

## Testing

- Unit tests for `lib/` utilities (JWT signing/verification, validation schemas) with Vitest
- Route Handler tests: call the handler function directly with a mocked `NextRequest`, assert on the response shape and status code
- End-to-end: Playwright for the dashboard's critical flows (login, viewing terminals list)
- `__tests__/` or colocated `*.test.ts` files, mirroring the `lib/`/`app/` structure
