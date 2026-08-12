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

## 4. OPEN DECISION — delivery approach (BLOCKING)

The single biggest decision, owner to confirm before build work begins:

| Option | Description | Implications |
|---|---|---|
| **A. Continue existing WordPress** | Improve the live WP site via a **child theme + a `hilty-custom` plugin**. Never touch core/vendor/plugin files. | Needs: repo/DB export, hosting + **staging** access, local WP (PHP/MySQL/WP-CLI) toolchain. Fastest reuse of current content. |
| **B. Fresh modern build** | New app in this repo (e.g. Next.js + headless CMS) that eventually replaces the WP site. | Cleaner base for calculators, BOQ upload, AI advisor, bilingual, admin CMS. Needs Node toolchain + content migration + DNS cutover plan. Counts as a **migration** → requires explicit approval per the rules. |
| **C. Hybrid** | Keep WP for existing content; add new interactive tools as a separate app/subdomain. | More moving parts; phased risk. |

**No option will be started until confirmed.** Rules require following the existing stack
unless migration is "technically necessary and approved."

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
