# Hilty AI Design Studio — Architecture & Data Model (SPEC ONLY)

_Status: **PLANNED — not implemented.** This document is an architecture/database amendment added
2026-08-13. No Design Studio code exists yet; build only after explicit approval, portion by portion._

> **What it is:** a **paint-led visual design and customer-conversion tool** — NOT a general-purpose
> architecture/CAD application. It helps homeowners, painters, contractors and developers visualise a
> project and convert that design into a verified colour + paint plan, recommended Hilty products,
> deterministic paint quantities, and a quotation / site-visit / branch-or-WhatsApp handoff.

## 1. Commercial objective

Convert a visual idea into revenue for Hilty by producing, from one flow:
1. A **verified colour & paint plan**.
2. **Recommended Hilty products** (from the verified catalogue only).
3. **Deterministic paint-quantity calculations** (via the existing calculator — never AI maths).
4. A **quotation request**.
5. A **site-visit request**.
6. A **branch or WhatsApp handoff**.
7. (Later) purchase through Hilty — subject to the existing rule: **no online payment until real
   prices, stock and fulfilment are confirmed**; until then "purchase" = reservation / quotation /
   human confirmation.

## 2. Primary user journey

Upload photo **or** pick a sample space → **detect paintable surfaces** → user **confirms/corrects
surface masks** → choose **design preferences** → receive **colour-scheme options** → generate
**visual variants** → **compare** → **select** a design → **map colours → verified products** →
enter **actual measurements** → **calculate materials** (deterministic) → **save project** →
**request quotation or site visit** → **purchase / handoff through Hilty**.

Every step is resumable from a saved `design-projects` record.

## 3. Supported project types (`design_project_type`)

`living_room`, `bedroom`, `kitchen`, `bathroom`, `office`, `shop`, `restaurant`,
`school_institutional`, `exterior_facade`, `roof`, `boundary_wall`, `gate_metal`, `wood_surface`,
`multi_room_home`, `commercial_building`.

Each type carries defaults for likely paintable surfaces and suitable product categories/paint
systems (e.g. roof → roof paint; gate_metal → metal coatings + primer).

## 4. System architecture

- **Server-side only** for all AI/image work; **no provider keys in the browser** (same rule as the
  AI Paint Advisor).
- **Provider-independent image services** (mirror the advisor's provider pattern in `web/src/lib/ai/`):
  - `SurfaceDetectionProvider` — segments an uploaded photo into candidate paintable surfaces
    (returns masks + surface-type guesses). Primary + backup providers, timeout/retry/failover,
    safe fallback = "mark surfaces manually".
  - `VisualizationProvider` — renders colour variants onto confirmed masks. Primary + backup,
    same failover discipline. Safe fallback = show flat colour swatches + product photos instead of
    a rendered room.
  - A common `ImageProviderResult` + JSON-validated metadata, structured logging without PII/secrets.
- **Deterministic boundary:** area/quantity maths ALWAYS go through the existing calculator
  (`web/src/lib/calc.ts`); the model never computes quantities.
- **Human-in-the-loop:** users must confirm/correct auto-detected masks before visualisation.

### Proposed module layout (when built)
```
web/src/lib/design/
  types.ts            # DesignProject, Surface, Scheme, Variant, provider interfaces
  surfaceDetection.ts # provider-independent segmentation service (failover)
  visualization.ts    # provider-independent render service (failover)
  schemes.ts          # colour-scheme generation from preferences + verified palette
  mapping.ts          # scheme colours -> verified catalogue products
  measure.ts          # bridges confirmed surfaces + measurements -> lib/calc
  convert.ts          # design -> quotation-request / site-visit / lead (reuses existing libs)
web/src/app/(frontend)/design-studio/…   # UI (LATER; not in this amendment)
```

## 5. Data model (proposed collections — NOT yet created)

> Implemented later with Payload configs = version-controlled schema, same conventions as existing
> collections (audit, consent, retention, verification, RBAC, private uploads).

- **design-projects**
  - `reference` (auto, DSN-…), `type` (design_project_type), `status`
    (`draft` | `surfaces_confirmed` | `scheme_selected` | `visualised` | `mapped` | `measured` |
    `saved` | `converted`), `title`.
  - `customer` (name/phone/email — personal data), `sessionId`, `locale`.
  - `sourceImages` (array → **private** `documents`/media, customer uploads) OR `sampleSpace`
    (→ sample-spaces).
  - `surfaces` (array → embedded Surface: type, mask reference, estimatedArea, assignedColour,
    assignedProduct → products, userConfirmed boolean).
  - `preferences` (style/mood tags, must-keep colours, constraints).
  - `schemeOptions` (→ colour-schemes) and `selectedScheme`.
  - `variants` (→ design-variants) and `selectedVariant`.
  - `measurements` (rooms/surfaces in metres — feeds calculator), `calculation` (json, deterministic
    result, estimate-only), `recommendedProducts` (→ products).
  - `linkedQuotation` (→ quotation-requests), `linkedSiteVisit` (→ site-visit-requests),
    `linkedLead` (→ leads), `preferredBranch` (→ branches).
  - `consent`, `retention`, audit (createdBy/updatedBy), `verification` (colour/product plan verified
    by staff before it is treated as final).
- **design-surfaces** — if not embedded: `project` (→ design-projects), `surfaceType`
  (`wall`|`ceiling`|`roof`|`wood`|`metal`|`boundary_wall`|`gate`|`facade`|`trim`), `mask`
  (polygon/mask data or → documents), `estimatedAreaM2`, `assignedColour`, `assignedProduct`
  (→ products), `userConfirmed`.
- **colour-schemes** — `name`, `palette` (array of {label, hexApprox, mappedProduct → products,
  finish}), `mood`/`style` tags, `source` (curated | generated), `active`. **Approximate colour only.**
- **design-variants** — `project` (→ design-projects), `scheme` (→ colour-schemes), `image`
  (→ media, **watermarked "indicative visualisation"**), `notes`, `generatedBy` (provider/model,
  no secrets), audit.
- **sample-spaces** — pre-set, **owned/authorised** demo photos for users without their own image:
  `name`, `type`, `image` (→ media), `active`. (No scraped/copyrighted imagery.)
- **design-preferences** (taxonomy, optional) — editable style/mood tags used by scheme generation.

## 6. Integrations (all existing systems)

- **AI Paint Advisor** (`web/src/lib/ai/`): the advisor can open/continue a design project and read
  its state; the studio can call the advisor for guidance and the `handoff_to_human` tool. New
  advisor tools to add later: `create_design_project`, `get_design_project`.
- **Catalogue** (`products`): colour→product mapping uses **verified** products only; respects
  price ("Request current price") and stock ("Contact branch") rules.
- **Paint calculator** (`lib/calc.ts`): the ONLY source of quantities; results labelled estimates
  requiring site verification.
- **Quotation system** (`quotation-requests`): `convert.ts` turns a saved design into a quotation
  request, attaching the calculation, recommended products, and the selected variant image.
- **Branches** (`branches`): nearest-branch / branch handoff, WhatsApp with the design reference.
- **Hilty Operations application** *(external, integration to confirm)*: push design leads,
  quotations and projects to the internal ops app. **Interface/credentials TBC** — see CONTENT_GAPS.

## 7. Guardrails (carried + Studio-specific)

- **Never promise exact colour appearance** from a screen or generated image; every variant is an
  **indicative visualisation** and must recommend confirming with **physical Plascon samples**.
- Do **not** imply Hilty owns Plascon (or any) colour names, products or IP.
- Recommend **only verified catalogue products**; never invent products/prices/stock/coverage/warranties.
- **No structural / damp / mould / hazard diagnosis** from a photo; recommend a professional site
  inspection.
- **All quantities via the deterministic calculator**, never AI.
- **User must confirm/correct** auto-detected surface masks before visualisation.
- Uploaded photos and generated variants are **customer personal data**: explicit **consent**,
  **retention** limits, private storage, and deletion on request. No writes (lead/quote) without consent.
- Server-side keys only; PII-free, secret-free logging; rate limiting and input/upload limits
  (reuse the advisor's `ratelimit.ts` + uploads security, incl. the production malware-scan TODO).
- No online payment until real prices/stock/fulfilment are confirmed.

## 8. Proposed build roadmap (documentation only — each is a future portion)

- **DS-1 — Foundation & data model:** design-projects + supporting collections; RBAC/consent/retention;
  provider-interface stubs with safe fallbacks; no external AI calls yet.
- **DS-2 — Surface detection:** upload/sample-space intake; segmentation provider + **manual
  mask correction**; area estimation.
- **DS-3 — Colour schemes:** preference capture; scheme generation from a verified/approximate palette.
- **DS-4 — Visualisation & comparison:** variant rendering (watermarked), side-by-side compare, select.
- **DS-5 — Product mapping & measurement:** colours → verified products; measurements → `lib/calc`.
- **DS-6 — Save & convert:** save/resume; convert to quotation / site-visit / branch / WhatsApp handoff.
- **DS-7 — Advisor & Operations integration:** advisor tools; push to Hilty Operations app.
- **DS-8 — Hardening & launch:** performance, accessibility, cost controls, abuse protection, cutover.

## 9. Open decisions

Tracked in [HILTY_CONTENT_GAPS.md](HILTY_CONTENT_GAPS.md) §8 (Design Studio) — image providers &
billing, colour-accuracy disclaimers wording, sample-space asset rights, and the Hilty Operations
application integration contract.
