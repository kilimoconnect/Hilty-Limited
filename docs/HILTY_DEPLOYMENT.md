# Hilty Deployment Guide (Vercel)

The Next.js + Payload app lives in the **`web/`** subfolder of this repo. Local dev uses SQLite;
production uses Postgres automatically when a Postgres URL is set.

## 1. Fix the 404 — set the Root Directory
The Vercel `404: NOT_FOUND` happens because Vercel builds the repo root, which has no app.

**Vercel → Project → Settings → Build & Deployment → Root Directory → `web` → Save → Redeploy.**

- Framework preset: **Next.js** (auto). Build command / output: **default** (do not override).
- Install command: default (`npm install`).

## 2. Database — Postgres (required on Vercel)
SQLite cannot run on Vercel's read-only/ephemeral serverless filesystem. Provision Postgres
(Vercel Postgres, Neon, or Supabase) and set **`DATABASE_URI`** to its `postgres://…` string
(Vercel Postgres also exposes `POSTGRES_URL`, which is used automatically).

The app auto-selects the adapter:
- `DATABASE_URI`/`POSTGRES_URL` starting with `postgres` → **Postgres**.
- otherwise → **SQLite** (local dev only).

**First deploy schema:** the Postgres adapter runs with `push` **off** in production. Create the
schema with a migration before/at first deploy:
```bash
cd web
DATABASE_URI="postgres://…" npm run payload -- migrate:create   # generate a migration from the schema
DATABASE_URI="postgres://…" npm run payload -- migrate           # apply it (run in CI or once)
```
(Or temporarily set `push` on for the very first deploy, then switch to migrations.)

**Seed the first admin + reference data** against the production DB (once):
```bash
cd web
DATABASE_URI="postgres://…" PAYLOAD_ADMIN_EMAIL=… PAYLOAD_ADMIN_PASSWORD=… npm run seed
```
Change the admin password immediately after first login.

## 3. File storage — object storage (required for uploads)
Local `private-uploads/` and `media-uploads/` are **not persisted** on serverless. Before customers
upload BOQs or Design Studio images in production, add a storage adapter (e.g.
`@payloadcms/storage-s3` or `@payloadcms/storage-vercel-blob`) and configure its bucket/credentials,
plus `DESIGN_STORAGE_BUCKET`. **TODO before go-live** (uploads will otherwise fail on Vercel).

## 4. Environment-variable checklist (Vercel → Settings → Environment Variables)
Required:
- `PAYLOAD_SECRET` — long random string (sessions/JWT). **Required.**
- `DATABASE_URI` — `postgres://…` (or rely on Vercel `POSTGRES_URL`).
- `NEXT_PUBLIC_SITE_URL` — the production URL (canonical/OG/metadata base).

Recommended / feature-gated (all SERVER-SIDE — never `NEXT_PUBLIC_` except the site URL):
- `STAFF_NOTIFY_EMAIL`, and an email transport (Go SMTP / provider) for notifications.
- AI advisor: `OPENAI_API_KEY`, `OPENAI_MODEL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AI_PRIMARY_PROVIDER`,
  `AI_TIMEOUT_MS`, `AI_MAX_INPUT_CHARACTERS`, `AI_RATE_LIMIT_PER_IP`, `AI_CONVERSATION_RETENTION_DAYS`.
- Design Studio images: `OPENAI_IMAGE_MODEL`, `GEMINI_IMAGE_MODEL`, `IMAGE_PRIMARY_PROVIDER`,
  `IMAGE_GENERATION_TIMEOUT_MS`, `IMAGE_MAX_UPLOAD_MB`, `IMAGE_MAX_GENERATIONS_PER_SESSION`,
  `IMAGE_DAILY_LIMIT_PER_IP`, `DESIGN_IMAGE_RETENTION_DAYS`, `DESIGN_STORAGE_BUCKET`.
- Ops sync: `HILTY_OPS_WEBHOOK_URL`, `HILTY_OPS_API_KEY`, `DESIGN_FOLLOWUP_HOURS`.

Without the AI/image keys the advisor and preview steps use their **safe fallbacks** (the site still
works). See `web/.env.example` for the full list.

## 5. Deployment checklist
- [ ] Root Directory = `web`.
- [ ] `PAYLOAD_SECRET`, `DATABASE_URI` (Postgres), `NEXT_PUBLIC_SITE_URL` set.
- [ ] Migrations applied; first admin seeded; admin password changed.
- [ ] Object storage configured (uploads).
- [ ] Custom domain + HTTPS (Vercel enforces HTTPS).
- [ ] Redeploy; verify `/`, `/products`, `/paint-calculator`, `/design-studio`, `/admin`, `/ops`.

## 6. Monitoring checklist
- [ ] Add error monitoring (e.g. Sentry) via env DSN — do **not** log customer PII/images/chat.
- [ ] Watch AI/image provider logs (provider, latency, fallback reason — already PII-free).
- [ ] Uptime check on `/` and `/admin`.

## 7. Backup & rollback
- **Backup:** enable automated Postgres backups (provider dashboard) + object-storage versioning.
- **Rollback (code):** Vercel → Deployments → promote the previous good deployment.
- **Rollback (data):** restore the latest Postgres backup; keep the prior backup until verified.
- **DNS cutover:** keep the existing WordPress site live until the new site is verified on a staging
  URL, then switch DNS. Keep a WordPress full backup before cutover.
