# Hilty Limited Website

Repository for the **Hilty Paint & Coatings Centre** web project.

> *"Genuine paint. Professional guidance. Reliable project delivery."*

**Company:** Hilty Limited (Tanzania)
**Business:** Retail & supply of Plascon paint and painting accessories; professional
residential & commercial painting services; project quotations and paint supply.
Hilty is a **retailer, project supplier and painting-services company — not a paint
manufacturer**, and does not own Plascon products, colour names or intellectual property.

**Existing production site:** https://hilty.co.tz/ (WordPress — do not modify directly).
**GitHub:** https://github.com/kilimoconnect/Hilty-Limited

## Status

This project is in **discovery / setup**. The technical stack and delivery approach are
**not yet decided** — see [docs/HILTY_REBUILD_PLAN.md](docs/HILTY_REBUILD_PLAN.md).

## Continuity documents

| Document | Purpose |
|---|---|
| [docs/HILTY_REBUILD_PLAN.md](docs/HILTY_REBUILD_PLAN.md) | Overall approach, phased portions, open decisions |
| [docs/HILTY_BUILD_STATUS.md](docs/HILTY_BUILD_STATUS.md) | Living log of what has been built, updated every portion |
| [docs/HILTY_CONTENT_GAPS.md](docs/HILTY_CONTENT_GAPS.md) | Information the owner must confirm before it goes live |
| [docs/HILTY_TESTING_CHECKLIST.md](docs/HILTY_TESTING_CHECKLIST.md) | Tests to run before any release |
| [docs/HILTY_DATA_MODEL.md](docs/HILTY_DATA_MODEL.md) | Content models / database schema |
| [docs/HILTY_SITE_AUDIT.md](docs/HILTY_SITE_AUDIT.md) | Read-only audit of the old WordPress site (migration reference) |
| [docs/HILTY_DESIGN_STUDIO.md](docs/HILTY_DESIGN_STUDIO.md) | **PLANNED** — Hilty AI Design Studio architecture & data model (not yet built) |

## Ground rules (summary)

- Work only on the agreed portion; do not start future portions.
- Never edit production directly; use staging + rollback.
- Never delete customer data or content without a backup.
- Do not fabricate products, prices, stock, projects, testimonials, warranties or branches.
- Mobile-first. English + Kiswahili. Units in **square metres** and **litres**.
- No secrets in the repo; no AI API keys in frontend code.
