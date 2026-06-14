# Lead notifications — email + ERP follow-up

Every captured lead (RFQ, calculator "email me this report", gated asset) now
fires an **owner notification** with the full contact details, in addition to
being saved in `/admin → Leads`. Two independent, optional sinks — set either or
both. Both are non-blocking (a slow/missing sink never affects the visitor).

## 1. Instant email to your inbox (simplest — works today)

Set on the web server `.env.production`:
```bash
RESEND_API_KEY=re_...                                  # your Resend key
LEAD_ALERT_EMAIL=sohel@sustechltd.com                  # where alerts go
LEAD_ALERT_FROM=Sustech Leads <leads@sustechltd.com>   # verified Resend domain
```
Then `pnpm build && pm2 restart`. You'll get an email per new lead with name,
clickable email/phone, company, segment, source, score (🔥 hot/warm/cold), the
page they came from, the campaign (UTM), any message, and an "Open in admin"
button. (Resend's domain must be verified — same key the daily-report cron uses.)

## 2. Push to the ERP / CRM (Hermes-mediated)

The web tier **never calls the ERP directly** (CLAUDE.md §9 — it holds no ERP
credentials). Instead it HMAC-signs the full lead and POSTs it to an endpoint
**Hermes owns**, which has ERP access:
```bash
LEAD_FORWARD_URL=https://n8n.sustechltd.com/webhook/lead-to-erp
LEAD_FORWARD_SECRET=<rand>     # openssl rand -hex 32
```

**Payload** (`POST`, header `X-Signature: HMAC-SHA256(body, LEAD_FORWARD_SECRET)`):
```json
{
  "leadId": 42, "name": "Sohel", "email": "...", "phone": "...", "company": "ACME RMG",
  "segment": "rmg", "source": "calculator", "score": 75, "temperature": "hot",
  "sourcePath": "/knowledge/calculators/diesel-vs-bess",
  "utm": { "source": "facebook", "campaign": "2026q3-rmg-bess-diesel-alt" },
  "ts": "2026-06-13T..."
}
```
The Hermes/n8n consumer verifies the signature, then upserts the lead into the
ERP/CRM (create contact + opportunity, assign follow-up task). Sample verify
(Node): `crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex') === header`.

## 3. The other channels already in place
- **Daily 08:00 digest** → `OWNER_NOTIFY_EMAIL` (scripts/ops/daily-report.sh) — counts + pending approvals.
- **GrowthOS dedupe event** → `LEADENGINE_EVENTS_URL` (email **hash** only, privacy-minimized) so the outbound engine stops chasing a self-converter.
- **`/admin → Leads`** — every lead, scored, pipeline status, always the system of record.
- **`GET /api/pipeline/report-data`** (PIPELINE_SECRET) — server-aggregated metrics for any custom dashboard.

## Which to use?
- Just want an email? → **#1** (2 env vars + a Resend key).
- Want leads in your ERP for pipeline/follow-up tracking? → **#2** (Hermes wires the consumer).
- Both is fine — they're independent.
