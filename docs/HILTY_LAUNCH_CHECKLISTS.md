# Hilty Launch Checklists (Portion 10)

Live site: **https://hilty-limited.vercel.app** · Repo: **kilimoconnect/Hilty-Limited** ·
DB: **Supabase Postgres** · Storage: **Supabase `hilty` bucket**. Deployment/infra specifics:
[HILTY_DEPLOYMENT.md](HILTY_DEPLOYMENT.md).

## 1. Production deployment checklist
- [x] Vercel **Root Directory = `web`**; **Framework = nextjs** (`web/vercel.json`).
- [x] **Postgres** (`DATABASE_URI` = Supabase Session pooler); schema migrated; first admin seeded.
- [x] `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL` set.
- [x] **Object storage** (`S3_*` → Supabase `hilty` bucket); private files return 403 to the public.
- [x] AI keys (`OPENAI_API_KEY` / `GEMINI_API_KEY` + models + primaries).
- [x] HTTPS enforced (Vercel) + HSTS header; security headers; old-URL redirects; `poweredByHeader` off.
- [x] `sitemap.xml`, `robots.txt` (disallow /admin,/ops,/api), Organization + LocalBusiness JSON-LD.
- [ ] **Change the seeded admin password** after first login. **← DO THIS.**
- [ ] **Rotate the Supabase anon key** (was exposed during setup).
- [ ] Point the real domain (**hilty.co.tz**) at Vercel + set `NEXT_PUBLIC_SITE_URL` to it; keep the
      old WordPress site live until this is verified, then cut DNS over (keep a WP backup).
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console (set `NEXT_PUBLIC_GSC_VERIFICATION`).

## 2. Owner content-confirmation checklist (before promoting to hilty.co.tz)
See [HILTY_CONTENT_GAPS.md](HILTY_CONTENT_GAPS.md). Confirm:
- [ ] **Branches** — is it **Goba or Mapinga** (with Bunju + Kibaha)? Exact addresses, GPS pins, hours, phones.
- [ ] **Contact details** — info@hilty.co.tz / +255 757 327 708 (and the WhatsApp number).
- [ ] **Products** — add real Plascon/accessory products (catalogue is intentionally empty).
      Provide **verified coverage + pack sizes** so the calculator shows litres, and **verified prices**
      (else "Request current price"). Only owned/authorised images & TDS.
- [ ] **Colour data** — the old site used Benjamin Moore names/codes; supply the correct Plascon data.
- [ ] **Services** — confirm the 6 service pages' wording; no warranty/"Platinum plan" unless official.
- [ ] **Projects** — add only genuine completed projects (before/after, testimonials with permission).
- [ ] **Kiswahili** — native review of the SW copy; logo file + exact brand hex.
- [ ] **Design Studio** — approved sample-room images for "Start without a photo".
- [ ] **AI/legal** — confirm disclaimers; who owns the AI + Supabase billing.

## 3. Environment-variable checklist (Vercel → Settings → Environment Variables)
**Required:** `PAYLOAD_SECRET` (Secret), `DATABASE_URI` (Postgres), `NEXT_PUBLIC_SITE_URL` (Config).
**Storage:** `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION` (Config), `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (Secret).
**AI (server-only, never NEXT_PUBLIC):** `OPENAI_API_KEY`, `GEMINI_API_KEY` (Secret); `OPENAI_MODEL`,
`GEMINI_MODEL`, `OPENAI_IMAGE_MODEL`, `GEMINI_IMAGE_MODEL`, `AI_PRIMARY_PROVIDER`, `IMAGE_PRIMARY_PROVIDER`,
`AI_TIMEOUT_MS`, `AI_MAX_INPUT_CHARACTERS`, `AI_RATE_LIMIT_PER_IP`, `AI_CONVERSATION_RETENTION_DAYS`,
`IMAGE_*`, `DESIGN_IMAGE_RETENTION_DAYS` (Config).
**Notifications/ops:** `STAFF_NOTIFY_EMAIL`, `HILTY_OPS_WEBHOOK_URL`, `HILTY_OPS_API_KEY`, `DESIGN_FOLLOWUP_HOURS`.
**SEO:** `NEXT_PUBLIC_GSC_VERIFICATION` (Config). Full list + notes in `web/.env.example`.

## 4. Monitoring checklist
- [ ] Add error monitoring (e.g. Sentry) via a server DSN — **never log customer PII, chat or images**
      (the app's own logs are already metadata-only).
- [ ] Watch AI logs (`[ai]` / `[design-image]` — provider, latency, fallback reason; PII-free).
- [ ] Uptime checks on `/`, `/admin`, `/api/health` equivalent.
- [ ] Review analytics (`/admin` → Website analytics + Design analytics) — counts only, no PII.
- [ ] Email deliverability (configure a real SMTP/Go SMTP transport for staff + customer emails).

## 5. Rollback plan
- **Code:** Vercel → Deployments → **Promote** the previous good deployment (or `git revert` + push).
- **Data:** restore the latest **Supabase** Postgres backup; keep the prior backup until verified.
- **Storage:** Supabase bucket versioning / restore.
- **DNS cutover:** keep WordPress live on a subdomain until the new site is verified; if a serious issue
  appears post-cutover, point DNS back to WordPress (full WP backup taken beforehand).

## Final QA — status
- **Automated tests:** calc 21, submissions 14, quotation 9, AI 26, Design 8A 28, Design flow 16,
  8C 27 — **all passing**. Lint clean; production build OK (23 routes + sitemap/robots).
- **Live checks:** homepage/products/calculator/design-studio/branches/branch-detail/admin/ops = 200;
  AI advisor answered a real query using tools without inventing data; object-storage upload verified
  (private 403); calculator maths verified deterministic (12.76 L / 9.28 L cases).
- **Manual QA to run on the final domain:** cross-browser (Chrome/Safari/Firefox/Edge), EN + SW toggle
  on every page, submit **every form** + confirm the staff email/notification, mobile/tablet/desktop
  layouts, broken-link sweep (crawl the sitemap), Lighthouse (perf/SEO/a11y) on a throttled mobile
  connection, and admin permission checks per role.
