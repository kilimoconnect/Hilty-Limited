# Hilty Site Audit (Portion 1)

_Audit of the existing production site at https://hilty.co.tz/_
_Method: **read-only, public-URL inspection only** (no login, no editing, no form submissions)._
_Date: 2026-08-12._

> **⚠️ ACCESS NOTICE (Task 2):** This audit was performed **from the public website only**.
> I do **not** have source code, database, media library, hosting config, environment
> variables or a staging environment. Everything below about the backend is **inferred from
> public signals** (HTTP responses, asset URLs, REST API, sitemaps) and must be verified once
> real access is granted. Per the master rules, **no live-site changes were made and none will
> be made without staging + rollback.** See §8 for exactly what access is required.

---

## 1. Access status

| Asset | Have access? | Notes |
|---|---|---|
| Source code (theme/plugins) | ❌ No | Inferred from public asset URLs only. |
| Database | ❌ No | Structure inferred from WooCommerce/WP defaults. |
| Uploaded media | ❌ Public only | Visible files load, but no media-library access. |
| Hosting configuration | ❌ No | Unknown host/panel. |
| Environment variables | ❌ No | None visible (correct). |
| Staging environment | ❌ No | None known to exist. |
| Public URL | ✅ Yes | Basis of this entire audit. |

**Conclusion:** Per Task 2, backend work **stops here** until access is provided.

---

## 2. Stack / CMS (inferred)

| Layer | Finding | Evidence |
|---|---|---|
| CMS | **WordPress** | `/wp-json/`, `/wp-content/`, sitemaps. |
| Theme | **Enfold v7.1** (Kriesi) + **Avia Layout Builder** | `/wp-content/themes/enfold/...` assets. |
| Child theme | **None detected** ⚠️ | All assets load from `enfold/`, not `enfold-child/`. Customisations may be edited directly in the parent theme → **lost on theme update**. Must verify with code access. |
| E-commerce | **WooCommerce 9.7.3** | `wc/v3`, `wc/store` namespaces; cart/shop/checkout/my-account pages. |
| Paint product config | **CodeCanyon "Paint Product Addon for WooCommerce" v7.0.4** | `/plugins/codecanyon-EIZqUw9w-paint-product-addon-for-woocommerce/`. |
| Chat | **WhatsApp Chat by QuadLayers v7.5.3** | widget "How can we assist you?"; `quadlayers/wp-whatsapp-chat`. |
| Email | **Go SMTP** | `gosmtp-smtp` namespace. |
| Other | **Jetpack** | `jetpack/v4`. |
| SEO | **Yoast SEO** (likely) | `post-sitemap1.xml` / `page-sitemap1.xml` naming pattern. |
| Analytics | **Not confirmed** | No GA4/gtag/GTM/Pixel seen in loaded scripts; Jetpack Stats possible. Verify with access. |

### Dependencies / plugins (public signals)
WooCommerce, WooCommerce Blocks/Brands, Paint Product Addon, WhatsApp Chat (QuadLayers),
Jetpack, Go SMTP, (likely) Yoast SEO. **Full plugin list & versions require admin access.**

---

## 3. Database structure (inferred, unverified)
Standard WordPress + WooCommerce schema expected: `wp_posts`/`wp_postmeta` (pages, products,
and ~hundreds of individual **colour** entries), `wp_options`, `wp_users`/`wp_usermeta`,
WooCommerce order tables (HPOS or legacy `shop_order` — unknown), plus the Paint Addon's own
tables/meta. **Must be confirmed from a real DB export.** No customer data was accessed.

---

## 4. Route & content inventory

### Pages (from `page-sitemap1.xml`)
| Route | Purpose | Notes |
|---|---|---|
| `/` | Home | Hero "ABOUT HILTY PAINTS", colour families, Color Capsule 2025, visualiser, site-visit form. |
| `/services/` | Services | Lists services; "Platinum plan" + "1-year warranty"; "2200+ shades". |
| `/paints-colors/` | Colour catalogue | WooCommerce product listing; products at **Sh 0**. |
| `/contacts/` | Contact | Address (Bunju B, Mapinga, Kibaha), phone, email, hours, form w/ math CAPTCHA. |
| `/shop/` | WooCommerce shop | Automated fetch returned an **unexpected/odd response** — verify manually. |
| `/cart/` | WooCommerce cart | Part of the incomplete purchase journey. |
| `/checkout/` | WooCommerce checkout | No confirmed real prices/fulfilment. |
| `/my-account/` | WooCommerce account | Customer auth/login. |
| `/order/` | Order (custom?) | Purpose to confirm. |

### Posts (from `post-sitemap1.xml`)
Hundreds of **individual colour pages** (e.g. `guilford-green-hc-116`, `sage-2143-10`,
`october-mist-1495`). **Naming/codes (HC-, AF-, CSP-, CC-, NNNN-NN) are Benjamin Moore
colour identifiers**, not Plascon — see Problem P-11.

### Other
- `robots.txt`: blocks `/wp-admin/` and WooCommerce log/upload dirs; allows `admin-ajax.php`.
- Sitemap index: `post-sitemap1`, `page-sitemap1`, `category-sitemap1`, `post_tag-sitemap1`.
- **Hidden/draft/indexed pages:** cannot be enumerated without admin access (only published,
  indexed URLs are visible publicly).

---

## 5. Problems log

Legend — **Sev:** 🔴 high / 🟠 medium / 🟡 low. **Type:** content / accuracy / legal / tech / UX / a11y / perf.

| ID | Sev | Type | Problem | Evidence |
|---|---|---|---|---|
| P-01 | 🟠 | content | **"Color Capsule of the Year 2025"** is time-bound and will date the site. | Homepage. |
| P-02 | 🟠 | accuracy | **Colour-count conflict: "over 2,000" (home) vs "2200+ shades" (services).** | Home vs Services. |
| P-03 | 🔴 | legal/brand | **"ABOUT HILTY PAINTS" / "at Hilty Paints" / "Hilty Paint Colors Collection"** implies Hilty *manufactures* paint. Brief says Hilty is a retailer/supplier/service co., not a manufacturer. | Homepage copy. |
| P-04 | 🟠 | legal | **"Platinum plan" + "1-year service warranty" + "product warranty"** — terms/coverage unclear; no warranty page. | Services page. |
| P-05 | 🔴 | accuracy | **Branch inconsistency:** site says **Bunju B, Mapinga, Kibaha**; owner brief says **Bunju, Goba, Kibaha**. (Goba vs Mapinga.) | Contacts page vs brief. |
| P-06 | 🔴 | tech/UX | **Incomplete purchase journey:** products priced **"Sh 0"**; full WooCommerce cart/checkout live but no confirmed real prices/stock/fulfilment. Risk of Sh 0 orders. | Paints & Colors / shop. |
| P-07 | 🟠 | tech | **`/shop/` returned an unexpected response** to automated fetch (looked like a dir index, not a storefront). Could be a caching/config issue. | Automated fetch. |
| P-08 | 🟠 | a11y/UX | Contact form uses a **math CAPTCHA ("1 + 3 = ?")** — weak spam control and an accessibility barrier. | Contacts page. |
| P-09 | 🟠 | perf | **Very heavy front end:** ~50+ render-blocking Enfold/Avia CSS/JS files + WooCommerce + fancybox on the homepage. Likely slow on mobile/3G (most users are on phones). | Network log. |
| P-10 | 🔴 | legal | **Missing policy pages:** no Privacy Policy, Returns/Refund, Warranty terms, or Complaints/dispute page found in sitemap. | Sitemaps. |
| P-11 | 🔴 | legal/accuracy | **Benjamin Moore colour names/codes** (HC-/AF-/CSP-/CC-) used throughout, while Plascon is the stated anchor brand. Brand-accuracy **and** possible IP concern. | Post sitemap. |
| P-12 | 🟠 | content | **No contact details in footer**; only "© Copyright - Hilty Company Limited". Phone/email/branches only on Contacts page. | All pages. |
| P-13 | 🟡 | UX | Two site-visit/quote forms exist (home + contacts) — destination/storage unknown; **cannot test submission without permission** (won't submit on live site). | Home/Contacts. |
| P-14 | 🟡 | content | Social links point to `instagram.com/hilty` and `facebook.com/hilty` — generic handles; confirm these are Hilty's real accounts. | Footer. |

> Items requiring backend access to confirm/measure: broken-link sweep, exact Lighthouse
> scores, form submission handling, "verification screens", analytics, hidden/draft pages.

---

## 6. Confirmed public contact data (preserve until owner changes)
- **Address:** "Bunju B, Mapinga and Kibaha Maili Moja. P.o.box 6026, Dar es salaam – Tanzania"
- **Email:** info@hilty.co.tz
- **Phone / WhatsApp:** +255 757 327 708
- **Hours:** Mon–Fri 08:30–18:00; Sat 08:30–17:30; Sun closed.
- **Social:** instagram.com/hilty, facebook.com/hilty (verify ownership).

---

## 7. Backup & rollback plan (cannot execute yet — no access)
**Required before ANY change to production:**
1. **Full file backup** of `wp-content/` (themes, plugins, uploads) via host/SFTP or a backup
   plugin (e.g. UpdraftPlus) → stored off-server.
2. **Full database dump** (mysqldump / phpMyAdmin export), including WooCommerce orders/customers.
3. Store both in a private, access-controlled location (NOT this repo; `backups/` is gitignored).
4. **Staging environment** = a clone of production on a subdomain (e.g. `staging.hilty.co.tz`)
   or host staging feature. All work happens there first.
5. **Rollback = restore** the file + DB backup to production; keep the previous backup until the
   new release is verified. Document each backup's date + checksum.

**Current rollback for THIS project:** everything is a new, separate repo/folder — nothing on
production has been touched. Rollback of Portion 1 = discard local commits / delete the folder.

---

## 8. What access is required to proceed (BLOCKING)
To do real foundation work I need the owner to provide, securely:
1. **Codebase** — a copy/export of `wp-content/themes/` (esp. any Enfold child theme) and
   `wp-content/plugins/` custom code, OR SFTP/Git access.
2. **Database export** — sanitised if needed; confirms schema, products, colours, orders.
3. **Media** — access to `wp-content/uploads/` (which assets are owned/authorised).
4. **Hosting** — host name + control-panel/SFTP access, and whether a staging feature exists.
5. **Admin login** — a WordPress admin (or read-capable) account to see plugins, roles,
   Yoast/analytics config, forms, and draft/hidden pages.
6. **Analytics** — GA4/Jetpack/Search Console access if it exists.

Until then, Portion 1 remains at the **public-audit** level and cannot run builds/lint/tests
(there is nothing to run locally) or create a staging environment.

---

## 9. Build / lint / test status (Task 8)
- **Not possible in this portion.** There is **no local codebase** to build, lint or test —
  the existing site is a live WordPress install we don't yet have, and the new app is not yet
  scaffolded. This task re-activates once either (a) code access is granted, or (b) Portion 2
  scaffolds the new Next.js app (which will ship with lint/test tooling from day one).
