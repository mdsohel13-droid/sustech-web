# Old → New 301 redirect map (domain cutover)

When `www.sustechltd.com` is repointed from the old Laravel site to the new
Next.js site (VPS 93.127.160.183), these 301s preserve the old site's SEO equity
and stop indexed old URLs from 404ing. Add them to the **VPS nginx server block**
for `www.sustechltd.com` / `sustechltd.com`, **above** the `location /` proxy to
the Next.js app.

> ✅ **Slugs VERIFIED against the live beta sitemap, and all targets OWNER-APPROVED
> (2026-06-15).** Every `/services/*` target exists on the new site. The three that
> had no exact new equivalent (sourcing → `/services`, PLC automation → electrical-epc,
> panel-board → electrical-epc) are approved as-is. Map is final.
>
> **Coverage:** this map covers every publicly-linked old URL (the old site has no
> sitemap — all `/sitemap*` 404). If the old DB holds **unlinked** pages, export
> that list (handoff task B2) and extend the map; otherwise it's complete.

## Mapping (discovered by crawling the live old site)

| Old URL | Old page | → New URL |
|---|---|---|
| `/` | Home | `/` (no redirect) |
| `/about/page` | About | `/about` |
| `/contact/page` | Contact | `/contact` |
| `/service/page` | Services list | `/services` |
| `/login` | Customer login | `/` (no public login yet) |
| `/show/products/cart` | Cart | `/request-quote` (RFQ = new conversion) |
| `/all/products` | Products list | `/services` |
| `/subcategory/products/*` | Product categories | `/services` (no retail on new site) |
| `/single/service/page/1` | Lightning Protection System (LPS) | `/services/lps-earthing` |
| `/single/service/page/2` | Industrial Electrical, Fire & Structural Safety | `/services/fire-safety` |
| `/single/service/page/4` | Substation design & installation | `/services/substation-hv` |
| `/single/service/page/5` | Electrical Testing & Inspection | `/services/inspection-testing` |
| `/single/service/page/7` | Training | `/services/training-safety` |
| `/single/service/page/8` | Solar system design & installation | `/services/solar-renewable` |
| `/single/service/page/9` | Product sourcing, production & supply | `/services` (check) |
| `/single/service/page/10` | Industrial Automation (PLC) | `/services/electrical-epc` (check) |
| `/single/service/page/11` | Installation & Commissioning (Electrical & Automation) | `/services/electrical-epc` |
| `/single/service/page/12` | Electrical panel board design & installation | `/services/electrical-epc` (check) |
| `/single/service/page/17` | Industrial lighting solution | `/services/lighting-distribution` |

## nginx config

```nginx
# --- Old Laravel site → new Next.js 301s (place ABOVE `location /`) ---

# Individual services → mapped new service pages
location = /single/service/page/1  { return 301 https://www.sustechltd.com/services/lps-earthing; }
location = /single/service/page/2  { return 301 https://www.sustechltd.com/services/fire-safety; }
location = /single/service/page/4  { return 301 https://www.sustechltd.com/services/substation-hv; }
location = /single/service/page/5  { return 301 https://www.sustechltd.com/services/inspection-testing; }
location = /single/service/page/7  { return 301 https://www.sustechltd.com/services/training-safety; }
location = /single/service/page/8  { return 301 https://www.sustechltd.com/services/solar-renewable; }
location = /single/service/page/9  { return 301 https://www.sustechltd.com/services; }
location = /single/service/page/10 { return 301 https://www.sustechltd.com/services/electrical-epc; }
location = /single/service/page/11 { return 301 https://www.sustechltd.com/services/electrical-epc; }
location = /single/service/page/12 { return 301 https://www.sustechltd.com/services/electrical-epc; }
location = /single/service/page/17 { return 301 https://www.sustechltd.com/services/lighting-distribution; }

# Top-level pages
location = /about/page   { return 301 https://www.sustechltd.com/about; }
location = /contact/page { return 301 https://www.sustechltd.com/contact; }
location = /service/page { return 301 https://www.sustechltd.com/services; }
location = /login        { return 301 https://www.sustechltd.com/; }

# Retail (no cart/products on the new C&I site) → services / RFQ
location = /show/products/cart { return 301 https://www.sustechltd.com/request-quote; }
location = /all/products       { return 301 https://www.sustechltd.com/services; }
location ^~ /subcategory/products/ { return 301 https://www.sustechltd.com/services; }
```

## Notes
- **No blanket catch-all → home.** Only known old URLs are redirected; truly
  unknown paths fall through to the new site's normal 404. A bulk redirect-all-to-
  home is an SEO anti-pattern (soft-404) — avoid it.
- After cutover, in **Google Search Console** use the (old) URL Inspection on a few
  old URLs to confirm the 301 resolves to the right new page.
- Keep the redirects permanently (don't remove after a few weeks) — backlinks to
  old URLs persist for years.
- If the old site had a sitemap of more URLs than the homepage exposed, pull the
  full list (old DB or server logs) and extend this map before go-live.
