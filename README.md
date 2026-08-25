eVCharge — Next.js (dashboards + Flutter API)

App Router project serving:
- **Web dashboards** at `/vendor`, `/owner`, `/admin` (cookie session)
- **JSON API** at `/api/*` for the Flutter driver app (Bearer JWT)

Supabase is used as **Postgres only**. Auth is custom JWT (`jose` + `bcryptjs`). The `service_role` key stays server-side forever.

## Setup

1. Copy env vars:

```bash
cp .env.example .env.local
```

2. In Supabase SQL Editor, run **in order**:

- `supabase/migrations/20260731120000_initial_schema.sql`
- `supabase/migrations/20260731140000_terminals_public_read_and_places.sql` (Google Places columns + public `SELECT` RLS for the Flutter anon key)

> If you previously ran the Auth-linked schema (`profiles` / `auth.users`), drop those objects first or use a fresh project — this migration is custom-auth only.

3. Install and run:

```bash
npm install
npm run dev
```

4. Seed demo terminals (service_role, local only):

```bash
node --env-file=.env.local scripts/seed-terminals.mjs scripts/sample-terminals.json
```

5. Seed demo users for every role (local/staging only):

```bash
npm run seed:users
```

| Email | Password | Dashboard |
|---|---|---|
| `admin@evcharge.pk` | `Admin123!` | `/admin` |
| `staff@evcharge.pk` | `Staff123!` | `/admin` |
| `vendor@evcharge.pk` | `Vendor123!` | `/vendor` |
| `owner@evcharge.pk` | `Owner123!` | `/owner` |
| `driver@evcharge.pk` | `Driver123!` | API / Flutter (no dashboard) |

Or create only a super admin:

```bash
node --env-file=.env.local scripts/create-admin.mjs admin@evcharge.pk 'YourPassword123'
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local Next.js |
| `npm run lint` | ESLint |
| `npm test` | Vitest (lib validations) |
| `npm run types:supabase` | Regenerate `types/database.types.ts` |
| `node --env-file=.env.local scripts/seed-terminals.mjs <file.json>` | Upsert scraped/manual terminals |
| `npm run seed:users` | Seed demo admin/staff/vendor/owner/driver users |
| `node --env-file=.env.local scripts/create-admin.mjs <email> <password>` | Create/update super admin |

## Auth contract

| Client | Token storage | Sent as |
|---|---|---|
| Dashboard | `httpOnly` cookie `evcharge_session` | Cookie (middleware + layout) |
| Flutter | `flutter_secure_storage` | `Authorization: Bearer <token>` |

Two ways in, one session shape (`{ data: { token, user }, error }`):

- **Dashboard (vendor / owner / admin)** — `POST /api/v1/auth/login` with email + password. Also receives the `httpOnly` cookie.
- **Driver app (Flutter)** — `POST /api/v1/auth/otp/request` then `POST /api/v1/auth/otp/verify` with a `+92` mobile number and a 4-digit code. Drivers never set an email or password; the first successful verification creates the account. Flutter uses `data.token` as `Authorization: Bearer`.

`POST /api/v1/auth/login` and `/signup` stay live for dashboard sign-in and for driver-app builds older than 2.0.0 (see the Flutter repo's API compatibility rules) — do not delete them.

### OTP delivery

Not wired up yet. `lib/server/modules/auth/otp.sender.ts` issues a fixed code of **`1234`** and echoes it back as `data.devCode` so the app can be exercised end to end. Replacing that one file with a WhatsApp Business template send is the whole integration: `isDevOtpMode()` returns false, `generateCode()` goes random, `sendCode()` calls the provider, and `devCode` drops out of the response. Codes live 5 minutes, allow 5 wrong guesses, and are rate-limited to one send per 30s per number.

Requires migration `20260822120000_phone_otp_auth.sql` (nullable `users.email` / `users.password_hash`, `users.phone_number`, `phone_otp_challenges`).

Demo logins (after `npm run seed:users`): `vendor@evcharge.pk` / `Vendor123!`, `owner@evcharge.pk` / `Owner123!`, `admin@evcharge.pk` / `Admin123!`.

Dashboard tenant scope comes from `vendor_members` / `owner_members` (no demo fallback). Apply migration `20260810130000_session_indexes_and_rollups.sql`, then optionally `node --env-file=.env.local scripts/refresh-session-rollups.mjs` for revenue charts.


## Flutter public reads

The driver app reads `terminals` **directly from Supabase** with the `anon` key. RLS policy `Public can read public terminals` allows `SELECT` where `is_public = true`. Authenticated mutations still go through this Next.js API with `service_role`.
