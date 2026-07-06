# Vanorika Inventory

A multi-tenant, row-level-security-isolated inventory management PWA built
for small retail businesses (Next.js 16 + Prisma + Postgres). Each business
("tenant") gets its own owner/staff accounts, product catalog, categories,
and an immutable stock-movement ledger, with tenant isolation enforced at
the database level via Postgres RLS — not just application code.

## Local development

Requires Node.js and Docker Desktop (for local Postgres).

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start local Postgres** (Docker, port `5433`)
   ```bash
   npm run db:up
   ```

3. **Create the test database** (one-time only — it is *not* created by
   migrations, only `vanorika` (dev) exists by default via
   `docker-compose.yml`):
   ```bash
   docker compose exec db psql -U postgres -c "CREATE DATABASE vanorika_test;"
   ```

4. **Apply migrations** to both databases. `.env` targets the dev database
   (`vanorika`) and is picked up automatically; `.env.test` targets
   `vanorika_test` the same way for the test suite. To apply migrations by
   hand to each:
   ```bash
   npx prisma migrate deploy
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/vanorika_test?schema=public" npx prisma migrate deploy
   ```
   This also runs the RLS migration, which creates the non-superuser
   `app_user` Postgres role that the app queries through at runtime (see
   `DEPLOY.md` for why this matters before you ever deploy anywhere real).

5. **Seed demo data** (creates a demo business, owner login, and a couple of
   sample products):
   ```bash
   npx prisma db seed
   ```
   Demo login: `owner@vanorika.test` / `password123`.

6. **Run it**
   ```bash
   npm run dev
   ```
   Then open [http://localhost:3000](http://localhost:3000).

### Running the test suites

```bash
npm test      # vitest — unit + integration (rls, auth, permissions, stock, products, settings, dashboard, actions-shape, tenant-isolation)
npm run e2e   # playwright — full browser E2E of the core inventory loop
```

`npm test` reads `.env.test` (pointed at `vanorika_test`) automatically;
make sure step 3–4 above have been run against that database first.

## Deploying

See [`DEPLOY.md`](./DEPLOY.md) for the Vercel + Neon runbook, including the
mandatory `app_user` password rotation and RLS verification steps required
before any non-local deployment.

## Tech stack

Next.js 16, React 19, Prisma 6.19, NextAuth v5 (beta), Postgres 16 with
row-level security, Tailwind CSS v4, Vitest, Playwright.
