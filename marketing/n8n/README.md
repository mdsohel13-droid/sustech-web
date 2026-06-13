# n8n — Lead → ERP consumer

Ready-to-import workflow that turns the website's `LEAD_FORWARD_URL` posts into
ERP/CRM records. It **verifies the website's HMAC signature**, then forwards the
verified lead to one thin route inside the ERP — `POST /api/leads/from-web` —
which owns the mapping into contact/opportunity/task. **ERP credentials live only
inside the ERP**; n8n holds just a Bearer key; the website holds neither. This is
the boundary CLAUDE.md §9 requires.

> The thin ERP route (paste-ready reference + contract) is in
> [`erp-thin-route.md`](erp-thin-route.md). Build that first, then wire n8n below.

## Three secrets in play (don't mix them up)
| Secret | Between | Set in |
|---|---|---|
| `LEAD_FORWARD_SECRET` | Website ↔ n8n (HMAC) | web `.env` **and** n8n Variables (must match) |
| `ERP_WEB_INGEST_KEY` | n8n ↔ ERP (Bearer) | ERP `.env` **and** n8n credential (must match) |
| (ERP's own DB/tRPC creds) | inside ERP only | ERP `.env` — **never** leaves the ERP |

## Import (2 minutes)

1. n8n → **Workflows → Import from File** → `lead-to-erp.workflow.json`.
2. Open the **Webhook** node, copy its **Production URL**
   (e.g. `https://n8n.sustechltd.com/webhook/lead-to-erp`).
3. Set the HMAC secret so Verify HMAC can check signatures. The node reads
   `$env.LEAD_FORWARD_SECRET` — that's an **OS/process env var, not an n8n
   "Variable"** (`$vars`). So either:
   - add `LEAD_FORWARD_SECRET=<value>` to the **n8n container's environment**
     (docker-compose `environment:` for the n8n service, same place as
     `ERP_WEB_INGEST_KEY`) and restart n8n, **or**
   - open the **Verify HMAC** node and replace `PASTE_LEAD_FORWARD_SECRET_HERE`
     with the literal value.

   ⚠️ Setting it under **Settings → Variables will NOT work** — `$env` doesn't
   read `$vars`.
4. Open **ERP /from-web** → set the URL to the ERP route (or set n8n variable
   `ERP_LEAD_INGEST_URL`), and attach a **Header Auth** credential:
   name `Authorization`, value `Bearer <ERP_WEB_INGEST_KEY>`. This is the only
   node tied to your ERP — no field mapping here; the ERP route does that.
5. **Activate** the workflow.

## Then on the web server

```bash
LEAD_FORWARD_URL=https://n8n.sustechltd.com/webhook/lead-to-erp
LEAD_FORWARD_SECRET=<the same value you set in step 3>   # openssl rand -hex 32
```
`pnpm build && pm2 restart`. Done — every new lead now lands in the ERP.

## Flow

```
Website (HMAC sign) ─POST→ Webhook ─▶ Verify HMAC ─Bearer→ ERP /api/leads/from-web ─→ contact+opp+task
                                         │ 401 if signature invalid (rejects forgery/replay)
```

## Test it

Send a signed test post from a shell (replace SECRET + URL):
```bash
SECRET='your-secret'
URL='https://n8n.sustechltd.com/webhook/lead-to-erp'
BODY='{"leadId":1,"name":"Test","email":"t@example.com","company":"ACME","segment":"rmg","source":"calculator","score":75,"temperature":"hot","ts":"2026-06-13T10:00:00Z"}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')
curl -s -X POST "$URL" -H "Content-Type: application/json" -H "X-Signature: $SIG" -d "$BODY"
# → {"ok":true}  and a record in the ERP. A wrong secret → execution fails at Verify HMAC.
```
To test the ERP route by itself (before wiring n8n), see the `curl` at the bottom
of [`erp-thin-route.md`](erp-thin-route.md).

## Notes
- The Verify node reads the **raw body** before parsing — never re-stringify the
  JSON to check the signature (key order would differ and it would never match).
- `timingSafeEqual` is used so signature comparison is constant-time.
- `neverError: true` on the ERP call means a transient ERP hiccup still returns
  200 to the website (the lead is already saved in `/admin → Leads`); add a
  retry / error-trigger branch if you want hard delivery guarantees.
- **Idempotency lives in the ERP route**, not n8n — it upserts by email so repeat
  submissions don't create duplicate contacts.
- **The ERP route must accept the website's full field set** (see the contract in
  [`erp-thin-route.md`](erp-thin-route.md)): `name, email, phone, company,
  segment, source, score, temperature, sourcePath, message, leadId, utm, ts`. In
  particular the website sends **`message`** (not `notes`) and the enrichment
  fields **`score`/`temperature`/`segment`/`utm.campaign`/`leadId`** — drop those
  and the ERP can't prioritise hot leads or attribute the campaign.
