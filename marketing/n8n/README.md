# n8n — Lead → ERP consumer

Ready-to-import workflow that turns the website's `LEAD_FORWARD_URL` posts into
ERP/CRM records. **ERP credentials live only here, never on the website** — this
is the boundary CLAUDE.md §9 requires.

## Import (2 minutes)

1. n8n → **Workflows → Import from File** → `lead-to-erp.workflow.json`.
2. Open the **Webhook** node, copy its **Production URL**
   (e.g. `https://n8n.sustechltd.com/webhook/lead-to-erp`).
3. Set the shared secret so the workflow can verify signatures. Either:
   - n8n **Settings → Variables** → add `LEAD_FORWARD_SECRET` = the same random
     value you'll put on the web server, **or**
   - open the **Verify HMAC** node and replace `PASTE_LEAD_FORWARD_SECRET_HERE`.
4. Open **ERP upsert** → point the URL at your ERP endpoint (or set env
   `ERP_LEAD_UPSERT_URL`) and attach your ERP API-key credential
   (Header Auth). This is the only node tied to your specific ERP.
5. Open **Map → ERP shape** → rename `contact`/`opportunity`/`task` fields to
   match your ERP's API. Nothing else needs editing.
6. **Activate** the workflow.

## Then on the web server

```bash
LEAD_FORWARD_URL=https://n8n.sustechltd.com/webhook/lead-to-erp
LEAD_FORWARD_SECRET=<the same value you set in step 3>   # openssl rand -hex 32
```
`pnpm build && pm2 restart`. Done — every new lead now lands in the ERP.

## Flow

```
Website (HMAC sign) ──POST──▶ Webhook ─▶ Verify HMAC ─▶ Map → ERP ─▶ ERP upsert ─▶ 200 OK
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

## Notes
- The Verify node reads the **raw body** before parsing — never re-stringify the
  JSON to check the signature (key order would differ and it would never match).
- `timingSafeEqual` is used so signature comparison is constant-time.
- `neverError: true` on the ERP call means a transient ERP hiccup still returns
  200 to the website (the lead is already saved in `/admin → Leads`); add a
  retry / error-trigger branch if you want hard delivery guarantees.
