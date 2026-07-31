# EVCharge — Next.js (dashboards + Flutter API)

App Router project serving:
- **Web dashboards** at `/vendor`, `/owner`, `/admin` (cookie session)
- **JSON API** at `/api/*` for the Flutter driver app (Bearer JWT)

Supabase is used as **Postgres only**. Auth is custom JWT (`jose` + `bcryptjs`). The `service_role` key stays server-side forever.

## Setup

1. Copy env vars:

```bash
cp .env.example .env.local
```

2. In Supabase SQL Editor, run:

`supabase/migrations/20260731120000_initial_schema.sql`

> If you previously ran the Auth-linked schema (`profiles` / `auth.users`), drop those objects first or use a fresh project — this migration is custom-auth only.

3. Install and run:

```bash
npm install
npm run dev
```

4. Create a super admin (run once in a Node REPL or temporary script with your env loaded):

```ts
import bcrypt from 'bcryptjs';
// hash = await bcrypt.hash('your-password', 12)
// INSERT INTO users (email, password_hash, role, full_name)
// VALUES ('admin@evcharge.pk', '<hash>', 'super_admin', 'Admin');
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run lint` | ESLint |
| `npm test` | Vitest (lib validations) |
| `npm run types:supabase` | Regenerate `types/database.types.ts` |

## Auth contract

| Client | Token storage | Sent as |
|---|---|---|
| Dashboard | `httpOnly` cookie `evcharge_session` | Cookie (middleware + layout) |
| Flutter | `flutter_secure_storage` | `Authorization: Bearer <token>` |

Both use `POST /api/auth/login` → `{ data: { token, user }, error }`.
