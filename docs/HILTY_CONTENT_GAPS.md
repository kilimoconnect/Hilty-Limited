# Hilty Content Gaps

_Information the owner must confirm. Nothing here should be published as fact until confirmed.
Do not fabricate to fill a gap — leave it flagged._

_Last updated: 2026-08-12._

## 1. Branch / outlet locations — DISCREPANCY (high priority) — CONFIRMED FROM SITE

Sources disagree. Branch data must be **editable** and confirmed before publishing.

| Source | Outlets listed |
|---|---|
| Owner brief (current understanding) | **Bunju, Goba, Kibaha** |
| Existing website (verified 2026-08-12, Contacts page) | **"Bunju B, Mapinga and Kibaha Maili Moja. P.o.box 6026, Dar es salaam – Tanzania"** |

**Question:** Which is correct — **Goba** (brief) or **Mapinga** (live site)? For each outlet we
need: exact address, GPS/pin, opening hours, phone, and whether it is a shop, depot, or both.
Confirmed hours on site: Mon–Fri 08:30–18:00, Sat 08:30–17:30, Sun closed.

## 1b. Colour data brand — Benjamin Moore, not Plascon (verified 2026-08-12)

The live catalogue's colour names/codes are **Benjamin Moore** identifiers (e.g. "Guilford
Green HC-116", "October Mist 1495", CSP-/AF-/CC- codes) — **not Plascon**, the stated anchor
brand. This is a brand-accuracy issue **and** a possible IP concern. **Do not carry these over
without confirming the licence/source.** Need the real Plascon (and other stocked) colour data.

## 1c. Colour-count & warranty claims (verified 2026-08-12)
- Homepage says "over **2,000**" colours; Services says "**2200+** shades" → pick one true figure.
- Services advertises a "**Platinum plan**" with a "**1-year service warranty**" and "product
  warranty" — exact terms, coverage and eligibility unknown. Need official wording (or remove).
- Homepage uses "**Hilty Paints**" / "Hilty Paint Colors Collection" wording that implies Hilty
  *manufactures* paint — must be reworded to retailer/supplier positioning unless confirmed.

## 2. Contact details — PRESERVE until owner confirms otherwise

- Email: **info@hilty.co.tz**
- Phone: **+255 757 327 708**
- WhatsApp number for "human help" journey: **not confirmed** (same as above? different line?).

## 3. Products & pricing

- Real product list (Plascon lines + accessories: brushes, rollers, thinner, wall putty, etc.).
- Prices, stock and units — **required before any payment/cart features**. Currently unknown.
- Which product images/technical sheets are **owned or authorised** for use (no scraping).

## 4. Services & projects

- Confirmed list of services (painting, waterproofing, interior design, quotations, supply).
- Real past projects / testimonials — only if genuine and permission granted. **Do not invent.**

## 5. Legal / brand

- Confirmation Hilty is retailer/supplier/service co. (not manufacturer) — assumed, please confirm.
- Any authorised-dealer wording for Plascon that Hilty is permitted to use.
- Warranty/guarantee claims — only if officially offered.

## 6. Languages

- Confirm English + Kiswahili are both required at launch. Who provides Kiswahili copy/translation?
- **Kiswahili is now live on the homepage (first-pass translation in `web/src/i18n/dictionaries.ts`)
  and needs review by a native speaker before launch.**

## 6b. Brand assets (Portion 3)

- **Official approved Hilty logo file** is needed — the header/footer currently use a placeholder
  wordmark (`web/src/components/ui/Logo.tsx`).
- **Exact brand hex colours** — the site uses a professional blue palette (deliberately distinct
  from the Hilti construction brand) defined in `web/src/app/globals.css`; swap in the real values.

## 6c. Service & project content (Portion 5)

- The 6 service pages (residential, commercial, interior, exterior, surface prep, site
  inspection) are seeded with **draft, factual** scope/process content — **no guarantees or
  warranties stated**. Owner to confirm/adjust wording. Add Kiswahili versions of the DB content.
- **Projects gallery is empty by design** — add only **genuine** completed projects via the admin
  (before/after images must be owned/authorised; testimonials only where authorised).

## 6d. Uploads / security (Portion 5) — production TODO

- BOQ/document uploads are validated by **type + size + executable-signature checks** and stored
  **privately** (staff-only read). **A real malware/antivirus scan (e.g. ClamAV or a cloud
  scanner) must be added in production** before files are treated as safe. Flagged in code.

## 6e. Paint calculator (Portion 6) — verified coverage required

- The calculator only produces a litre estimate when a product has **verified coverage**
  (`verification.status = verified` + `coveragePerLitre`). Until the owner supplies **verified
  Plascon coverage figures + pack sizes**, the calculator shows the area and "coverage not yet
  verified — we will confirm the quantity" instead of inventing litres. Provide verified coverage
  data for the products customers will calculate with.

## 7. AI Paint Advisor

- Which provider (OpenAI / Gemini / other) and who holds the API account/billing.
- Confirm guardrails: no exact-colour promises, no serious wall-defect diagnosis.
- **Portion 7 built the backend** (OpenAI primary + Gemini backup). To go live it needs
  **`OPENAI_API_KEY` / `GEMINI_API_KEY`** (+ optional model overrides) set as **server-side**
  env vars — never `NEXT_PUBLIC_`. Without keys the service returns the safe deterministic
  response (calculator / quotation / WhatsApp). See `.env.example`.
- The in-memory **rate limiter is per-instance**; for multi-instance/serverless production, back
  it with a shared store (Redis/Upstash) — flagged in `web/src/lib/ai/ratelimit.ts`.

## 8. Access & accounts (not content, but blocking)

- Hosting/staging credentials, DB export, existing repo (if any).
- GitHub access to `kilimoconnect/Hilty-Limited` for pushing.
