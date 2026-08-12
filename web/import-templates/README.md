# CSV import templates

Templates for bulk-importing **verified** data into the Hilty catalogue. Import is performed by
staff; nothing here is auto-published.

## Running the product import
```
npm run import:products -- ./import-templates/sample-products.csv
```
- Upserts by product **name** (creates missing brands; category_key must already exist).
- `sample-products.csv` contains clearly-labelled **SAMPLE (test) data** for local QA only —
  do not use it in production. Replace with real, verified product data.

## Rules
- **Do not invent data.** Only import real, verified products and branches.
- `price`, `price_verified`, `show_price_publicly` — prices stay **private** unless verified
  AND `show_price_publicly=true`. Leave `price` blank if not confirmed.
- Per-branch **stock**, product **images**, and **TDS files** are added in the admin, not via CSV
  (stock defaults to "Contact branch for availability").
- `verification_status` should normally start as `unverified` (products) or `pending_review`
  (branches with disputed info), and only become `verified` after a staff check.

## products-template.csv columns
| Column | Notes |
|---|---|
| name | Required. |
| brand | Brand name (must exist in Brands, e.g. "Plascon"). |
| category_key | One of: interior_paint, exterior_paint, roof_paint, primer_undercoat, wood_metal_coatings, wall_preparation, thinners_solvents, brushes_rollers_tools, waterproofing_protective. |
| use_types | Pipe-separated: interior\|exterior\|roof\|wood\|metal. |
| finish | matt, silk, satin, semi_gloss, gloss, textured, other. |
| surface_compatibility | Semicolon-separated list. |
| colour_availability | Free text. Do not imply Hilty owns colour names/IP. |
| coverage_per_litre | Number (m² per litre). |
| recommended_coats | Number. |
| recommended_primer / recommended_topcoat | Free text. |
| drying_touch_dry / drying_recoat | Free text (e.g. "1 hour"). |
| pack_sizes_litres | Semicolon-separated litres, e.g. "1;4;20". |
| tds_url | Authorised link to manufacturer TDS (optional). |
| featured / active / quotation_eligible | true/false. |
| price / currency / price_verified / show_price_publicly | Pricing (kept private by default). |
| verification_status | unverified / pending_review / verified. |

## branches-template.csv columns
| Column | Notes |
|---|---|
| name | Required. |
| region / district / full_address | Location. |
| lat / lng | Map coordinates (optional). |
| map_link | Google Maps link (optional). |
| phone / whatsapp / email | Contact. |
| hours_monday … hours_sunday | "HH:MM-HH:MM" or "closed". |
| active | true/false. |
| verification_status | unverified / pending_review / verified. |

> An import script that consumes these files can be added in a later portion; the columns above
> map 1:1 to the Payload collection fields.
