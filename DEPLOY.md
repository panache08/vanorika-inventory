# Deploying Vanorika Inventory

Target stack: **Vercel** (app) + **Neon** (Postgres). This mirrors the same
two-role, RLS-enforced pattern used by the booking-platform project.

## Database (Neon)

### Before anything else: rotate the `app_user` password

The RLS migration (`prisma/migrations/20260706140500_rls/migration.sql`)
creates a Postgres role called `app_user` with a **hardcoded development
password**: `'app_pw'`. That is fine for local Docker — it is never exposed
outside your machine. It is **not** fine for any deployed environment.

After you run migrations against a real (Neon) database, immediately do:

```sql
ALTER ROLE app_user PASSWORD '<a-strong-generated-secret>';
```

Then build `APP_DATABASE_URL` using `app_user` + that new secret — never
`app_pw`. Treat leaving `app_pw` in place on a deployed database as a
security incident, not a checklist item: `app_user` has read/write on every
tenant's rows (RLS is what scopes it down to one tenant at a time via
`current_business_id()`), so a guessable password on a reachable host is a
direct path to every business's data.

### The two-URL split

This app deliberately uses **two different Postgres roles**, wired through
**two different env vars**:

| Env var | Role | Used for | Bypasses RLS? |
|---|---|---|---|
| `DATABASE_URL` | superuser/owner (Neon's default role) | `prisma migrate deploy`, `prisma db seed` **only** — never by the running app | Yes (by design, so migrations/seeding can set up the schema and roles) |
| `APP_DATABASE_URL` | `app_user` (created by the RLS migration) | the running Next.js app, all runtime queries | No — this is the whole point |

Do not let the app connect with `DATABASE_URL`. If it did, every Prisma
query would run as the schema owner, RLS's `FORCE ROW LEVEL SECURITY` would
still technically apply, but you'd have thrown away the defense-in-depth of
using a role that structurally *cannot* bypass it. Keep the split.

### Steps

1. Create a Neon project. Note its default (owner) connection string — that
   is your `DATABASE_URL` for migration/seed steps only.
2. Apply the schema:
   ```bash
   DATABASE_URL="<neon-owner-url>" npx prisma migrate deploy
   ```
   This runs all three migrations, including the RLS migration that creates
   `app_user` with the dev password `app_pw`.
3. **Rotate `app_user`'s password** (see above — do this before anything else
   touches this database):
   ```sql
   ALTER ROLE app_user PASSWORD '<a-strong-generated-secret>';
   ```
4. Verify `app_user` is genuinely non-superuser and cannot bypass RLS:
   ```sql
   SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'app_user';
   ```
   Both columns **must** read `f`. If either is `t`, do not deploy — find
   out why (e.g. a role inheritance issue) and fix it first.
5. Build `APP_DATABASE_URL` as `app_user` + the rotated password + the
   **pooled** Neon connection string (Neon's dashboard labels this;
   it's the one meant for application traffic, distinct from the direct/owner
   connection used for migrations). Add a `connection_limit` sized to your
   Neon plan so concurrent stock operations (sales, receiving, adjustments)
   don't exhaust the pool — local dev uses `connection_limit=25` as a
   reference point; check your plan's max connections before choosing a
   number for production.
6. Seed the first tenant:
   ```bash
   DATABASE_URL="<neon-owner-url>" npx prisma db seed
   ```
   (Seeding runs as the owner role and intentionally bypasses RLS — that's
   expected and is why it uses `DATABASE_URL`, not `APP_DATABASE_URL`.)

## App (Vercel)

1. Import the repo. Framework preset: **Next.js**.
2. Build command: `prisma generate && next build` — this is already the
   `build` script in `package.json`, so the default Vercel build command
   works unmodified.
3. Set environment variables in the Vercel project settings:
   - `DATABASE_URL` — Neon owner URL (only needed at build/deploy time if you
     run migrations as part of your pipeline; not read by the running app)
   - `APP_DATABASE_URL` — `app_user` + rotated password + pooled connection
     string + `connection_limit`
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`, do not reuse
     the local dev value
   - `AUTH_TRUST_HOST` — `true`
4. Deploy. Log in with the seeded owner (`owner@vanorika.test` /
   `password123` if you used the repo's seed script as-is) and **change that
   password immediately** from the app's settings screen.

## Post-deploy checklist

- [ ] RLS verified: `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname='app_user';` returns `f, f`.
- [ ] `app_user`'s password was rotated away from the migration's default `app_pw`.
- [ ] Changed the seeded owner's password (`owner@vanorika.test` by default).
- [ ] Rotated `AUTH_SECRET` and any DB passwords that were echoed to a
      terminal, CI log, or chat transcript during setup.
- [ ] Added real categories, products, and staff users via the app (the
      seed data is a demo fixture, not production inventory).
- [ ] Confirmed `APP_DATABASE_URL` points at the **pooled** Neon connection
      string with a `connection_limit` appropriate for the plan.
