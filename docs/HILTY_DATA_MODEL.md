# Hilty Data Model (Portion 2)

_The structured content + database foundation for the fresh build._
_Stack: **Next.js + Payload CMS 3** (admin UI, RBAC, version-controlled schema) on **SQLite**
(local dev; Postgres-ready for production). Collection configs in `web/src/collections/` **are**
the version-controlled schema; SQL migrations live in `web/src/migrations/`._

_Last updated: 2026-08-12._

## Cross-cutting field groups (applied to relevant collections)

- **Audit** (all): `createdAt`, `updatedAt` (auto) + `createdBy`, `updatedBy` (relationship →
  users, set by hooks) — "responsible staff member".
- **Verification** (content with technical/claimed info): `verification.status`
  (`unverified` | `pending_review` | `verified`, default `unverified`), `verification.verifiedBy`,
  `verification.verifiedAt`, `verification.notes`. Shown prominently in the admin sidebar.
- **Consent** (personal-data collections): `consent.given` (checkbox), `consent.purpose`,
  `consent.source`, `consent.timestamp`, `consent.channel`.
- **Retention** (personal-data collections): `retention.retainUntil` (date),
  `retention.legalBasis`, `retention.notes` — supports data-minimisation & deletion policy.

## Roles (RBAC) — `users.roles`
`admin` (full) · `manager` (all content) · `content_editor` (products/services/projects, drafts)
· `sales` (leads, quotations, site-visits) · `branch_staff` (own branch, stock status, complaints)
· `viewer` (read-only). Access functions enforce these per-collection and per-operation.

## Collections

### Supporting
- **users** — auth + `roles`, `branch` (relationship, for branch_staff), audit.
- **brands** — `name`, `slug`, `logo`, `isAuthorisedDealerBrand` (checkbox), `notes`. (Plascon =
  anchor; Hilty is a retailer/supplier, **not** the manufacturer.)
- **media** — public uploads (product/service/project images). Public read.
- **documents** — **private** uploads (BOQ files, quote PDFs). Staff-only read.

### 1. products
brand (→brands) · name · slug · category (→product-categories) · useTypes (interior/exterior/
roof/wood/metal, multi) · surfaceCompatibility (array) · finish · colourAvailability (text) ·
description (rich) · applicationInstructions (rich) · recommendedPrimer · recommendedTopcoat ·
coveragePerLitre (m²/L) · recommendedCoats · dryingTime (touchDry/recoat) · packSizes (array of
litres+sku) · tdsFile (→media) / tdsUrl (authorised link) · image (→media) · featured · active ·
quotationEligible · **verification** (technical info) · **pricing** (price, currency=TZS,
`priceVerified`, `showPricePublicly` default **false**) · **stock** (per-branch array: branch,
status = in_stock|low|out_of_stock|**contact_branch** default, showPublicly default false) · audit.
_No products seeded (not fabricated)._

### 2. product-categories
name · slug · key (the 9: interior_paint, exterior_paint, roof_paint, primer_undercoat,
wood_metal_coatings, wall_preparation, thinners_solvents, brushes_rollers_tools,
waterproofing_protective) · description · image · displayOrder · active. _Seeded (taxonomy)._

### 3. branches
name · region · district · fullAddress · coordinates (lat/lng) · mapLink · phone · whatsapp ·
email · operatingHours (array day/open/close/closed) · servicesAvailable (→services) · active ·
**verification** · audit. _Seeded from site data, marked `pending_review` (Goba vs Mapinga)._

### 4. services
name · slug · summary · description (rich) · image · sectors (residential/commercial) ·
features (array) · warranty (hasWarranty, planName, terms, **verification**) · active ·
displayOrder · **verification** · audit. _Seeded from site; Platinum/warranty marked unverified._

### 5. projects (completed projects)
title · slug · description (rich) · location · sector · servicesUsed (→services) · productsUsed
(→products) · images (array →media) · completionDate · client (name, consent) · testimonial ·
featured · active · **verification** · audit. _No projects seeded (not fabricated)._

### 6. painters (painters & contractors)
fullName · type (painter/contractor/company) · phone · whatsapp · email · region · districts
(array) · skills (array) · yearsExperience · portfolio (array →media) · idNumber (sensitive) ·
status (pending/approved/suspended/rejected) · **consent** · **retention** · **verification** ·
audit. _No seed._

### 7. leads
name · phone · email · source (website_form/whatsapp/ai_advisor/site_visit/quotation/import/other)
· interest · message · status (new/contacted/qualified/converted/lost) · assignedTo (→users) ·
branch (→branches) · related (quotation/site-visit) · **consent** · **retention** · audit. _No seed._

### 8. quotation-requests
reference (auto) · customerName · phone · email · projectType · sector · description · area (m²)
· surfaces (array) · boqFiles (array →documents, **private**) · productsInterested (→products) ·
preferredBranch (→branches) · status (received/in_review/quoted/accepted/declined/expired) ·
quotedAmount (internal) · quoteFile (→documents) · assignedTo (→users) · **consent** ·
**retention** · audit. _No seed._

### 9. site-visit-requests
name · phone · email · location · coordinates · preferredDate · preferredTime · propertyType ·
notes · branch (→branches) · assignedTo (→users) · status (requested/scheduled/completed/
cancelled) · scheduledFor · **consent** · **retention** · audit. _No seed._

### 10. complaints (complaints & product batch reports)
reference (auto) · type (complaint/product_batch_report/warranty_claim) · customerName · phone ·
email · branch (→branches) · product (→products) · batchNumber · purchaseDate · description (rich)
· severity · status (open/investigating/resolved/closed) · resolutionNotes · assignedTo (→users) ·
**consent** · **retention** · audit. _No seed._

### 11a. ai-sessions
sessionId · channel (web/whatsapp) · locale (en/sw) · startedAt · endedAt · messages (array:
role, content, timestamp) · linkedLead (→leads) · **consent** · **retention** · audit. _No seed._

### 12. enquiries (professional customers) — added Portion 5
reference (auto, ENQ) · type (contractor_account / developer / project_pricing / bulk_supply /
general) · name · company · role · phone · email · registrationNumber (TIN) · projectDescription
· estimatedArea (m²) · productsInterested (→products) · quantities · **documents** (array →
documents, private BOQ uploads) · preferredBranch (→branches) · status · assignedTo (→users) ·
**consent** · **retention** · audit. Public create; staff read. _No seed._

> **quotation-requests** extended (Portion 6) with `interiorExterior`, `budget`, and
> `calculation` (json — the complete deterministic calculator result saved with the request).
> A linked `leads` record (source=quotation) is created on submission.

> **services** extended (Portion 5) with `heroIntro`, `scope[]`, `process[]`, `customerProvides[]`,
> `hiltyConfirms[]` — drives the 6 service pages (admin-editable). Seeded with 6 canonical services.
> **projects** extended (Portion 5) with `projectType`, `scope`, `beforeImage`, `afterImage`.

### 11b. ai-lead-summaries
session (→ai-sessions) · summary · detectedIntent · recommendedProducts (→products) ·
recommendedSystem · customerContact (name/phone, consent) · confidence · reviewedBy (→users) ·
status · **retention** · audit. _No seed._

## Hilty AI Design Studio collections — ✅ IMPLEMENTED (Portion 8A, 2026-08-13)

_The 7 Design Studio collections below are now built (Payload configs in `web/src/collections/`):
**design-projects, design-spaces, design-surfaces, design-preferences, design-palettes,
design-variants, design-product-plan** — matching the Portion 8A field list. `documents.kind`
gained a `design` option for private Design Studio images. The customer UI is NOT built yet.
The proposed shapes below remain the reference for fields._

- **design-projects** — reference (DSN-…) · type (living_room … commercial_building) · status
  (draft→converted) · customer (personal data) · sessionId · locale · sourceImages (private) OR
  sampleSpace (→sample-spaces) · surfaces (embedded/→design-surfaces) · preferences · schemeOptions
  (→colour-schemes) · selectedScheme · variants (→design-variants) · selectedVariant · measurements
  · **calculation (json, deterministic estimate)** · recommendedProducts (→products) · linkedQuotation
  (→quotation-requests) · linkedSiteVisit (→site-visit-requests) · linkedLead (→leads) · preferredBranch
  (→branches) · **consent** · **retention** · **verification** · audit.
- **design-surfaces** — project (→design-projects) · surfaceType (wall/ceiling/roof/wood/metal/
  boundary_wall/gate/facade/trim) · mask · estimatedAreaM2 · assignedColour · assignedProduct
  (→products) · userConfirmed.
- **colour-schemes** — name · palette (label, **approx** hex, mappedProduct →products, finish) ·
  mood/style tags · source (curated|generated) · active. **Approximate colour only.**
- **design-variants** — project (→design-projects) · scheme (→colour-schemes) · image (→media,
  **watermarked "indicative visualisation"**) · notes · generatedBy (provider/model, no secrets) · audit.
- **sample-spaces** — name · type · image (→media, **owned/authorised only**) · active.
- **design-preferences** (optional taxonomy) — editable style/mood tags for scheme generation.

Reuses existing collections: **products** (verified mapping), **quotation-requests**,
**site-visit-requests**, **leads**, **branches**, **documents/media** (private uploads).

## CSV import templates
- `web/import-templates/products-template.csv`
- `web/import-templates/branches-template.csv`
- `web/import-templates/README.md` — column docs; note prices/stock stay **private until verified**.

## Guarantees honoured
- Version-controlled schema (TS configs) + SQL migrations.
- Admin UI + role-based access (Payload).
- No fabricated products/projects seeded; only verified site content migrated, unverified flagged.
- Prices/stock **private by default**; "Contact branch for availability" is the default stock state.
- Consent + retention on all personal-data collections; audit + responsible-staff on all.
