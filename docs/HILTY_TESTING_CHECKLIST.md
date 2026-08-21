# Hilty Testing Checklist

_Run the relevant sections before every release. Expand per portion.
Record exact results in the end-of-portion report._

## Environment / build
- [ ] Project builds with no errors.
- [ ] No secrets or API keys committed (grep for keys; `.env` ignored).
- [ ] `.env.example` present and complete; real `.env` never committed.

## Cross-device / responsive (mobile-first)
- [ ] Renders correctly at 360px, 390px, 768px, 1280px widths.
- [ ] Tap targets ≥ 44px; no horizontal scroll on mobile.
- [ ] Tested on at least one real Android phone.

## Bilingual (EN / SW)
- [ ] Language switch works on every page.
- [ ] No missing/untranslated strings; no hard-coded text.
- [ ] Units display as m² and litres in both languages.

## Content integrity
- [ ] No fabricated products, prices, stock, projects, testimonials, warranties or branches.
- [ ] Contact details match confirmed values (info@hilty.co.tz / +255 757 327 708 until changed).
- [ ] Branch/outlet data comes from the editable source, not hard-coded.

## Customer journeys (as each is built)
- [ ] Browse products.
- [ ] Determine correct paint system.
- [ ] Paint quantity calculator (m² → litres) gives sane numbers.
- [ ] Request formal quotation.
- [ ] Upload BOQ / project documents (file-type & size validation, safe storage).
- [ ] Book a site visit.
- [ ] Find nearest outlet.
- [ ] AI Paint Advisor answers within guardrails (no exact-colour promise, no defect diagnosis).
- [ ] WhatsApp human-help handoff opens correct number/prefilled message.
- [ ] Painter/contractor registration.

## Admin / CMS
- [ ] Business content (branches, products, services, contacts) editable without code.
- [ ] Access control on admin.

## Security & privacy
- [ ] AI keys server-side only, never in frontend bundle.
- [ ] Uploads validated & scanned; no arbitrary file execution.
- [ ] No personal data in URLs/query strings.
- [ ] Forms protected against spam/abuse.

## Performance / SEO / a11y
- [ ] Lighthouse (mobile) performance, SEO, accessibility checked.
- [ ] Images optimised; only owned/authorised assets used.
- [ ] Meta titles/descriptions per page; sitemap; correct canonical.

## AI Design Studio (PLANNED — test when built; spec HILTY_DESIGN_STUDIO.md)
- [ ] Surface detection returns editable masks; **user can confirm/correct** before visualisation.
- [ ] Safe fallback when detection/visualisation providers fail (manual masks / flat swatches).
- [ ] Variants are clearly labelled **indicative** and **watermarked**; no exact-colour promise.
- [ ] Colours map only to **verified** catalogue products; price/stock rules honoured.
- [ ] Quantities come from the **deterministic calculator**, labelled estimates.
- [ ] Save/resume a project across every step.
- [ ] Convert to quotation / site-visit / branch / WhatsApp with the design reference.
- [ ] Uploaded photos: consent captured, private storage, retention + deletion on request.
- [ ] No structural/damp/hazard diagnosis from photos; recommends professional inspection.
- [ ] Server-side keys only; PII-free logs; rate/upload limits; malware scan on uploads.
- [ ] Hilty Operations integration pushes leads/quotations/projects correctly.

## Release safety
- [ ] Tested on staging first.
- [ ] Production backup taken (DB + files) before cutover.
- [ ] Rollback procedure written and verified.
