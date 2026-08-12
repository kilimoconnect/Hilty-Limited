# Hilty Build Status

_A living log. Updated at the end of every portion._

---

## Portion 0 — Discovery & Setup — ✅ COMPLETE (2026-08-12)

**Goal:** Stand up the repository and continuity documents; audit the environment;
surface the blocking stack decision. **No application code written** by design.

### Done
- Initialised local git repo (`main` branch) in `Hilty Limited Website`.
- Created `README.md`, `.gitignore`.
- Created the four continuity docs:
  - `docs/HILTY_REBUILD_PLAN.md`
  - `docs/HILTY_BUILD_STATUS.md` (this file)
  - `docs/HILTY_CONTENT_GAPS.md`
  - `docs/HILTY_TESTING_CHECKLIST.md`
- Discovery of production site + local environment (see below).

### Discovery findings
- **hilty.co.tz is WordPress.** Page builder/theme not yet confirmed. Visible: colour
  showcase, colour-visualiser, waterproofing/interior services, site-visit booking,
  contact form, @hilty social links.
- **No access yet** to existing codebase, database, or hosting/staging.
- **Local toolchain:** `git` ✅, Windows-Store `python` stub. **Missing:** Node/npm, PHP,
  Composer, WP-CLI, Docker, `gh` CLI.

### Environment variables introduced
- None.

### Content/database changes
- None.

### Blocking items (owner input required)
1. **Delivery approach A / B / C** — see HILTY_REBUILD_PLAN §4.
2. **Access** — provide codebase, DB export, hosting + staging credentials (Option A) or
   confirm greenfield build (Option B).
3. **GitHub push** — confirm I should connect the local repo to
   `github.com/kilimoconnect/Hilty-Limited` and push (auth method needed — no `gh`/token yet).
4. Content discrepancies — see HILTY_CONTENT_GAPS.md.

### Risks / unresolved
- Cannot honour "inspect existing implementation before changing it" until access is granted.
- No local dev toolchain for either WordPress or a Node build yet.

### Rollback
- Everything is new and uncommitted/local-only. Rollback = delete the
  `Hilty Limited Website` folder. Nothing on production or GitHub has been changed.

---

## Decision log
- **2026-08-12:** Delivery approach = **Option B — Fresh modern build** (approved migration).
  Proposed stack: Next.js + TypeScript + Tailwind + i18n (EN/SW), server-side AI. See REBUILD_PLAN §4.

## Portion 1 — Audit & foundation prep — ✅ AUDIT DONE / build BLOCKED (2026-08-12)

**Owner direction (2026-08-12):** "We are creating a fresh website — no need to view the old
one." → Audit is complete and retained as a **migration reference only**; the old WordPress
site will be **replaced, not continued**.

### Done
- Full **read-only public audit** of hilty.co.tz → `docs/HILTY_SITE_AUDIT.md`.
  - Stack: WordPress + Enfold v7.1 (no child theme detected) + WooCommerce 9.7.3 +
    CodeCanyon Paint Addon + WhatsApp Chat + Jetpack + Go SMTP + (likely) Yoast.
  - Route/content inventory captured; 14 problems logged (P-01…P-14).
  - Confirmed: branch = Mapinga (site) vs Goba (brief); "over 2,000" vs "2200+" colours;
    Platinum/1-yr warranty; "Hilty Paints" manufacturing wording; Benjamin Moore colour data;
    products priced "Sh 0"; missing privacy/warranty/returns pages.
- Updated `HILTY_CONTENT_GAPS.md` with verified facts.
- **No live-site changes made** (per Task 2 — public access only).

### Blocked — cannot start fresh build until:
1. **Node.js LTS installed** (still NOT present as of 2026-08-12). Hard prerequisite for the
   Next.js scaffold, dependency install, dev server, lint/tests. **← current blocker.**
2. Confirm/adjust proposed stack (Next.js + TS + Tailwind + i18n + server-side AI).
3. GitHub push method (PAT — `gh` not installed).

### Rollback
- Nothing on production/GitHub touched. Rollback = discard local commits / delete folder.

### Update 2026-08-12 — toolchain ready
- **Node.js v24.19.0 + npm 11.17.0 installed** (winget `OpenJS.NodeJS.LTS`, exit 0), at
  `C:\Program Files\nodejs\`. Node blocker is **cleared**.
- Still outstanding: GitHub push method (PAT), stack confirmation, Goba-vs-Mapinga answer.

## Portion 2 — Structured content & database foundation — ✅ COMPLETE (2026-08-13)

**Goal:** Native content models + database + admin + RBAC for the fresh build. **No redesigned
frontend** (only a placeholder page).

### Stack chosen
- **Next.js 16.3 + Payload CMS 3.88** (admin UI, RBAC, version-controlled TS schema) on **SQLite**
  (local dev; Postgres-ready for production). App lives in `web/`.

### Delivered
- **16 collections** (11 required models + supporting): `products`, `product-categories`,
  `branches`, `services`, `projects`, `painters`, `leads`, `quotation-requests`,
  `site-visit-requests`, `complaints`, `ai-sessions`, `ai-lead-summaries` + `users`, `brands`,
  `media` (public), `documents` (private BOQ/quotes). See `docs/HILTY_DATA_MODEL.md`.
- **RBAC**: roles admin/manager/content_editor/sales/branch_staff/viewer, with collection- and
  field-level access. Prices & stock are **field-level staff-only**; stock defaults to
  "Contact branch for availability". Personal-data collections allow public create, staff read.
- **Audit** (createdBy/updatedBy + timestamps), **verification** status, **consent** & **retention**
  field groups applied where required.
- **CSV import templates** for products & branches (`web/import-templates/`).
- **Seed** (verified content only): admin user, 9 categories, Plascon brand, 3 branches
  (flagged pending_review re: Goba/Mapinga), 5 services (warranty/wording flagged). No products
  or projects seeded.
- `.env.example` added; real `.env`, `*.db`, uploads all gitignored.

### Tests performed (exact results)
- `npm run generate:types` → types written OK.
- `npm run seed` → admin + 9 categories + Plascon + 3 branches + 5 services created.
- `npm run test:crud` → **ALL CHECKS PASSED** (16/16 collections: create/edit/deactivate/display/cleanup).
- `npm run lint` → **clean** (0 errors).
- `npm run build` → **success** (TypeScript passes; routes /, /admin, /api/* built).
- Runtime smoke: `/` 200, `/admin` 200, `/api/branches` returns data (public read),
  `/api/users` **403** (RBAC blocks anon).

### Env vars introduced
`PAYLOAD_SECRET`, `DATABASE_URI`, `PAYLOAD_ADMIN_EMAIL`, `PAYLOAD_ADMIN_PASSWORD` (seed only).

### Not pushed to GitHub yet
Local commits only. Awaiting GitHub push method (PAT — `gh` not installed).

### Rollback
- All new and local. Rollback = `git reset`/delete `web/`. Nothing on production or GitHub touched.
- Local data resets by deleting `web/hilty.db` and re-running `npm run seed`.

## Portion 3 — Global design system, navigation & homepage — ✅ COMPLETE (2026-08-13)

**Goal:** Brand design system, global nav (header/footer), and the 11-section homepage wired to
CMS data, with required content corrections. Responsive + accessible.

### Delivered
- **Design system**: brand tokens in `web/src/app/globals.css` (blue palette, deliberately
  distinct from Hilti; amber accent; type scale; radius; focus ring; reduced-motion; skip link).
  UI primitives: `Button`, `Container`, `Section`/`SectionHeading`, `Logo` (placeholder wordmark),
  inline `icons`.
- **Global navigation**: `Header` (sticky) with logo, all 9 nav items (Home, Products, Paint
  Calculator, Painting Services, Projects, Painters & Contractors, Branches, About Hilty,
  Request Quotation), **search**, **WhatsApp**, **call**, **language selector (EN/SW)**, and a
  full **mobile menu**. `Footer` with company/shop/contact + non-manufacturer disclaimer.
  Floating WhatsApp button.
- **Bilingual (EN/SW)**: cookie-based locale (`web/src/i18n/`), full homepage/nav translations.
  SW is a first pass — needs native review (see CONTENT_GAPS §6).
- **Homepage** (`web/src/app/(frontend)/page.tsx`): all 11 sections — hero (exact approved copy),
  trust (confirmed claims only), categories (from DB), how-Hilty-helps, featured products
  (empty-state), services intro (from DB), contractor CTA, branch summary (from DB),
  completed projects (real-only, empty-state), AI advisor intro (with guardrail note), final
  WhatsApp/quotation CTA.
- **Nav-target stub pages** (`/products`, `/paint-calculator`, … `/search`, `/ai-advisor`) render
  a "coming soon" placeholder so navigation works without broken links (built in later portions).

### Required corrections applied
- ❌ Removed "Color Capsule of the Year 2025".
- ❌ Removed conflicting colour-count claims ("2,000"/"2,200").
- ❌ No "Hilty Paint Colors" wording; positioned as retailer of genuine Plascon paint.
- ❌ No cart/checkout in the new app.
- ❌ No unverified warranty/Platinum claims on the homepage.
- ✅ Hilty-specific copy throughout; footer disclaimer clarifies Hilty is not a manufacturer.

### Tests performed (exact results)
- `lint` → **clean**. `build` → **success** (16 routes).
- Runtime: `/` 200; homepage renders live branches (Bunju B, Mapinga) & services from DB.
- i18n: `hilty_locale=sw` cookie renders Kiswahili homepage. ✓
- Stub routes render ("coming soon"). ✓
- Content audit (grep): **none** of Color Capsule / "2,200" / "Hilty Paint Colors" / Platinum present. ✓
- Responsive (computed styles): **mobile 375** desktop-nav `none` + hamburger shown + hero 30px;
  **tablet 768** desktop-nav `block` + hamburger `none`; **no horizontal overflow** at any width.
  Mobile menu opens with search + 9 links + WhatsApp + Call + language selector. ✓

### Not yet done / needs owner input
- Official **logo** + exact **brand hex** (placeholders in use — CONTENT_GAPS §6b).
- Kiswahili native review. Pixel screenshots not captured (browser pane not displayed here).

### Rollback
- All new/local. Rollback = `git reset`/checkout `web/src`. Nothing on production/GitHub touched.

## Portion 4 — (not started; awaiting go-ahead)
