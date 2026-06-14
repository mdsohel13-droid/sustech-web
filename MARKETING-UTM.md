# Marketing UTM convention

One consistent UTM scheme so every lead's first-touch attribution (captured in
`leads.utmSource/Medium/Campaign`, read first-touch from the `st_utm` cookie) is
clean and reportable. Use it on **every** paid, social, email and QR link.

## Parameters

| Param | Value | Examples |
|---|---|---|
| `utm_source` | the platform | `facebook` · `linkedin` · `google` · `email` · `qr` · `whatsapp` |
| `utm_medium` | the channel type | `cpc` (paid search) · `paid_social` · `social` (organic) · `newsletter` · `print` (catalog/QR) |
| `utm_campaign` | **`<yyyy>q<n>-<segment>-<topic>`** | `2026q3-rmg-bess-diesel-alt` · `2026q3-bank-atm-ups` · `2026q3-investor-bd-energy` |
| `utm_content` | the specific creative/variant (optional) | `carousel-a` · `hero-launch` · `founder-quote` |
| `utm_term` | keyword (paid search only) | `solar+epc+bangladesh` |

**Segments** (match `pages.segment` / `leads.segment`): `investor` · `rmg` ·
`real-estate` · `commercial` · `bank`.

## Examples

```
# Day-1 Facebook launch post
https://www.sustechltd.com/?utm_source=facebook&utm_medium=social&utm_campaign=2026q3-all-launch&utm_content=hero-launch

# Diesel-vs-BESS calculator, RMG paid social
https://www.sustechltd.com/knowledge/calculators/diesel-vs-bess?utm_source=facebook&utm_medium=paid_social&utm_campaign=2026q3-rmg-bess-diesel-alt&utm_content=carousel-a

# Catalog QR (print)
https://www.sustechltd.com/solutions/banks-financial?utm_source=qr&utm_medium=print&utm_campaign=2026q3-bank-atm-ups
```

## Rules
- **Always lowercase**, hyphen-separated; no spaces.
- One `utm_campaign` per campaign across all platforms (so the report groups them).
- Never put PII in a URL.
- The site reads the **first-touch** UTM (30-day `st_utm` cookie) into the lead —
  so the campaign that first brought someone gets the credit even if they convert
  later from a direct visit.
- These values surface in the daily report's "leads by source/segment" block and
  in PostHog.
