# Hilty Rebuild Plan

_Last updated: 2026-08-12 (Portion 0 — Discovery & Setup)_

## 1. Purpose

Incrementally improve Hilty Limited's web presence so it becomes a serious multi-outlet
**paint-solutions** platform — not just an online brochure — supporting the ten primary
customer journeys (browse products → paint system → quantity calculator → quotation →
BOQ upload → site visit → nearest outlet → AI Paint Advisor → WhatsApp human help →
painter/contractor registration).

## 2. Positioning

- **Name:** Hilty Paint & Coatings Centre
- **Promise:** "Genuine paint. Professional guidance. Reliable project delivery."
- **Role:** Retailer, project supplier and painting-services company. **Not** a manufacturer;
  does **not** own Plascon products/colours/IP.

## 3. Current state (discovered 2026-08-12)

- Production site https://hilty.co.tz/ is **WordPress**.
  - Page builder / theme: **not yet confirmed** (needs inspection with real access).
  - Visible features: colour showcase ("2,000+ colours", "Color Capsule of the Year 2025"),
    colour-visualiser tool, waterproofing & interior-design services, site-visit booking,
    a contact form, Instagram/Facebook (@hilty).
- **Codebase, database and hosting/staging access are NOT yet available** to this project.
- New empty repo: `kilimoconnect/Hilty-Limited`. New local folder: `Hilty Limited Website`.
- Local dev machine has **git + python stub only** — no Node/npm, PHP, Composer, WP-CLI,
  Docker or `gh`. Toolchain must be installed once the stack is chosen.

## 4. DECISION — delivery approach ✅ CHOSEN: **B. Fresh modern build** (2026-08-12)

Owner approved **Option B**: a fresh modern build in this repo that will eventually
replace the WordPress site. This is an approved **migration** per the rules.

Options considered:

| Option | Description | Status |
|---|---|---|
| A. Continue existing WordPress | Child theme + `hilty-custom` plugin on the live WP site. | Not chosen. |
| **B. Fresh modern build** | New app (proposed: **Next.js + headless/DB-backed CMS**) that replaces WP after cutover. | **CHOSEN.** |
| C. Hybrid | Keep WP; add new tools on a subdomain. | Not chosen. |

### What Option B requires (owner action)
1. **Install Node.js LTS** on the dev machine — currently missing, and nothing can be
   scaffolded without it. (Also gives `npm`/`npx`.)
2. **Content migration plan** from WP → new app (products, pages, media that are owned/authorised).
3. **DNS cutover plan** for when the new site is ready — production stays live until then.
4. **GitHub push** confirmation + auth (Personal Access Token, since `gh` is not installed).

### Proposed technical stack (to confirm in Portion 1)
- **Framework:** Next.js (App Router) + TypeScript — SSR/SEO, API routes for server-side AI.
- **Styling:** Tailwind CSS, mobile-first.
- **i18n:** next-intl or similar — EN + SW.
- **Content/CMS:** DB-backed (e.g. Postgres + Prisma) with a Hilty admin UI, OR a headless CMS
  (e.g. Payload/Sanity). To be decided in Portion 1.
- **AI advisor:** server-side only (API routes); keys in env, never in the client bundle.

## 5. Provisional phased portions (order/scope subject to approval)

> These are a proposal only. Each portion ends with a report and waits for approval.

- **Portion 0 — Discovery & Setup** *(this portion)*: repo, continuity docs, environment
  audit, stack decision surfaced.
- **Portion 1 — Access & foundation**: obtain codebase/staging (Option A) or scaffold app +
  install toolchain (Option B); design system; bilingual (EN/SW) skeleton; editable content model.
- **Portion 2 — Outlets & contact**: editable branch/outlet data (resolve Bunju/Goba/Kibaha
  vs Bunju/Mapinga/Kibaha), nearest-outlet finder, preserved contact details.
- **Portion 3 — Products & paint systems**: product catalogue (Plascon + accessories),
  guided "correct paint system" selector.
- **Portion 4 — Calculators & quotation**: paint quantity calculator (m²/litres), quotation
  request, BOQ/document upload, reservation — replacing the unfinished cart journey.
- **Portion 5 — Site visits & registration**: site-visit booking, painter/contractor registration.
- **Portion 6 — AI Paint Advisor**: server-side AI (keys never in frontend), with strict
  guardrails (no exact-colour promises, no serious-defect diagnosis), WhatsApp human handoff.
- **Portion 7 — Admin & CMS**: manage all business content from an admin interface.
- **Portion 8 — Hardening & launch**: performance, SEO, accessibility, staging→production
  cutover with rollback.

## 6. Guardrails carried through every portion

- Mobile-first; EN + Kiswahili; units m² and litres.
- No fabricated products/prices/stock/projects/testimonials/warranties/branches.
- No online payment until real prices, stock and fulfilment are confirmed.
- No AI keys in frontend; no secrets in repo; server-side AI only.
- Preserve production until replacements are tested; backup before any deletion.

## 7. Immediate blocking questions

See end-of-portion report and [HILTY_CONTENT_GAPS.md](HILTY_CONTENT_GAPS.md).
