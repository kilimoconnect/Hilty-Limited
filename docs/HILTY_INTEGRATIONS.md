# Hilty Integration Points (future systems)

_Portion 9. Operations Lite is built on the **same website database** (Payload) — not a separate
system. These are the seams for connecting **real** inventory and accounting later. Until then, no
financial or inventory figures are invented; stock is a **manual** status and prices are shown only
when verified._

## 1. Inventory / stock
- **Now:** `branch-stock` collection = manual, indicative status per branch/product
  (`in_stock` | `low` | `out_of_stock` | `contact_branch`); `reservations` = manual human-confirmed holds.
- **Integration point:** replace `branch-stock` reads with a live inventory adapter
  (`lib/integrations/inventory.ts`, to be added) exposing `getStock(branchId, productId)` and
  `reserve(...)`. Keep the collection as a cache/fallback. Do NOT display live quantities until the
  feed is verified accurate.

## 2. Accounting / POS
- **Now:** quotations hold `lineItems`, `discountPct`, `taxRatePct`, `quotedAmount`, `approvalStatus`
  — all internal; public site never shows invented prices ("Request current price").
- **Rule:** **do not replace Hilty's accounting/POS** unless explicitly approved. 
- **Integration point:** an `lib/integrations/accounting.ts` adapter to push approved quotations /
  pull authoritative prices + tax rates. Tax rate must come from the accounting system or be set by
  an administrator per current law — never hard-coded/invented.

## 3. Hilty Operations application (external)
- Converted Design Studio / quotation leads sync via `lib/design/ops.ts` → `HILTY_OPS_WEBHOOK_URL`
  (+ `HILTY_OPS_API_KEY`). Confirm the JSON contract with the ops team.

## 4. Payments
- **Not implemented.** No online payment until real prices, stock and fulfilment are confirmed.
  Reservation + human confirmation is the current path.

## 5. Notifications
- Email via Payload transport (Go SMTP in production). WhatsApp handoff via `wa.me` deep links.
  Future: WhatsApp Business API adapter.

## 6. Analytics
- Website + Design Studio events are stored as **metadata-only** records (`analytics-events`,
  `design-events`). No customer images or chat content. Can be forwarded to an external analytics
  warehouse later via a scheduled export (never PII/chat).
