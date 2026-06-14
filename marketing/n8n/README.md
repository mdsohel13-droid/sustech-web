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

### Negative test — REQUIRED before go-live (proves the gate rejects forgeries)

A passing happy-path test does **not** prove HMAC verification is still running —
if the Verify step was dropped or short-circuited while refactoring, a forged
request would succeed too. The webhook is public; the signature is the only thing
stopping anyone from injecting fake leads into the ERP. So verify the gate
*rejects*:

```bash
URL='https://n8n.sustechltd.com/webhook/lead-to-erp'
BODY='{"name":"FORGED","email":"attacker@evil.test","temperature":"hot"}'

# (a) no signature at all  → must NOT create a customer
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$URL" \
  -H "Content-Type: application/json" -d "$BODY"

# (b) wrong signature      → must NOT create a customer
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$URL" \
  -H "Content-Type: application/json" -H "X-Signature: deadbeef" -d "$BODY"
```
Both must fail the workflow (non-2xx / execution error) and leave **no** new row
in the ERP `customers` table. If either creates a customer, the HMAC gate is open
— restore the Verify HMAC step (raw-body `timingSafeEqual`) before going live.

> When the Verify and Forward steps are merged into one Code node, the verified
> object's shape depends on position: a node right after the webhook reads the
> payload at `item.json.body` (or `$json.body`) and the signature at
> `item.json.headers['x-signature']`; verify the raw body **before** mapping
> fields. Don't let the refactor skip the signature check.

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

## Troubleshooting — env vars & secrets

- **n8n needs exactly ONE env var: `LEAD_FORWARD_SECRET`** (read by the Verify
  HMAC Code node via `$env`). The ERP Bearer key does **not** need to be an env
  var — store the literal `Bearer <ERP_WEB_INGEST_KEY>` inside the n8n **Header
  Auth credential**. Only make it an env var if the credential value is the
  expression `={{ $env.ERP_WEB_INGEST_KEY }}`. Simplest: put the literal in the
  credential and skip the env var entirely.
- **After editing a systemd unit you MUST `daemon-reload` before `restart`.**
  `systemctl restart` alone reuses the cached unit, so newly-added
  `Environment=` lines are silently ignored — the classic "file is correct but
  the process doesn't have the var" symptom.
  ```bash
  sudo systemctl daemon-reload && sudo systemctl restart n8n
  systemctl show n8n -p Environment                       # what systemd will inject
  PID=$(systemctl show -p MainPID --value n8n)
  tr '\0' '\n' < /proc/$PID/environ | grep -E 'LEAD_FORWARD_SECRET'   # live process
  ```
- **`Environment=` values containing spaces must be quoted**, or systemd splits
  on the space and drops the tail: `Environment="ERP_WEB_INGEST_KEY=Bearer abc"`
  (not `Environment=ERP_WEB_INGEST_KEY=Bearer abc`). A hex secret has no space
  so `Environment=LEAD_FORWARD_SECRET=83f0…` is fine unquoted.
- **Fastest unblock if env loading is stubborn:** open the Verify HMAC node in
  the n8n UI and replace `PASTE_LEAD_FORWARD_SECRET_HERE` with the literal
  secret. No restart needed; revisit the env approach later.

### ERP call returns 401 — Authorization header not sent

If the HTTP node fires but the ERP replies 401 and only an `accept` header
reached it (no `Authorization`), the Header-Auth credential isn't being applied.
Two causes, both common with **API-created** workflows/credentials:

1. **Credential fields are wrong.** An n8n *Header Auth* (`httpHeaderAuth`)
   credential has exactly two fields — **`name`** and **`value`** (the API keys),
   shown in the UI as **Name** and **Value**. For Bearer auth they must be
   `Name = Authorization`, `Value = Bearer <ERP_WEB_INGEST_KEY>`. If it was
   created via API with `headerName`/`headerValue` (wrong keys) the credential is
   effectively empty → no header sent. The API does not return credential
   secrets, so **verify in the UI**, not via API.
2. **Stale node↔credential binding.** Importing a workflow JSON that references a
   credential by id can leave the node showing the credential without actually
   binding it. Open the HTTP node → Authentication → re-select *Generic
   Credential Type → Header Auth → (the credential)* → Save → re-execute.

**Most robust unblock** (removes the credential abstraction for a single static
header): in the HTTP node turn off credential auth and add the header manually
under **Send Headers** → `Name = Authorization`, `Value = Bearer <token>` (or
`={{ $env.ERP_WEB_INGEST_KEY }}` if you keep the env var). A static Bearer
doesn't need the credential store.

### ERP returns 400 "name is required" — body sent as an array `[{…}]`

The HTTP Request node serialises the item(s) as an array, so the ERP sees
`[{…}]` not `{…}`. If fiddling with the node's body modes won't produce a bare
object, **replace the HTTP node with a Code node** that makes the call directly —
deterministic, and it sidesteps both the array-wrap and the `fetch is not
defined` sandbox error:

```js
// Code node, "Run Once for Each Item". $json = the verified lead object.
// NOTE: the ERP is plain HTTP on localhost → require('http'), NOT 'https'.
const http = require("http");
const payload = JSON.stringify($json);

const res = await new Promise((resolve, reject) => {
  const r = http.request(
    {
      hostname: "127.0.0.1",
      port: 3010,
      path: "/api/leads/from-web",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        Authorization: "Bearer <ERP_WEB_INGEST_KEY>",
      },
    },
    (resp) => {
      let d = "";
      resp.on("data", (c) => (d += c));
      resp.on("end", () => resolve({ status: resp.statusCode, body: d }));
    },
  );
  r.on("error", reject);
  r.write(payload);
  r.end();
});

if (res.status >= 300) throw new Error(`ERP ${res.status}: ${res.body}`);
return [{ json: { erpStatus: res.status, erp: JSON.parse(res.body) } }];
```

`require()` of a built-in is blocked in the Code node unless allow-listed. Since
the Verify HMAC node already uses `require('crypto')`, set both:
```bash
NODE_FUNCTION_ALLOW_BUILTIN=crypto,http     # n8n process env, then restart
```
Common near-miss: using `require('https')` against the plain-HTTP `:3010`
endpoint — it errors at the socket and the execution shows a workflow-level
"error" with no node error. Use `http`.
