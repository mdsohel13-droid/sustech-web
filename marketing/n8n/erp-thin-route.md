# ERP thin route — `POST /api/leads/from-web`

The one piece that lives **inside the Sustech ERP** (separate repo). n8n forwards
each HMAC-verified website lead here; this route owns the mapping into the ERP's
own contact/opportunity/task models — so ERP business logic stays in the ERP and
the website never touches the database or tRPC internals.

```
Website ─HMAC→ n8n (Verify) ─Bearer→ ERP /api/leads/from-web ─→ contact + opportunity + task
```

## Why a thin REST route (not call tRPC from n8n)
- n8n speaks plain HTTP cleanly; tRPC's batch/superjson envelope is awkward to hand-craft and brittle across versions.
- The route can **reuse your existing tRPC procedures** server-side via `createCaller`, so you don't duplicate logic — you just expose one HTTP door for n8n.
- One small, auditable surface with its own auth key.

## Auth — a dedicated Bearer key (ERP ↔ n8n only)
Separate from the website's `LEAD_FORWARD_SECRET`. Generate one:
```bash
openssl rand -hex 32      # → ERP_WEB_INGEST_KEY
```
Put it in **two** places (must match):
- ERP `.env` → `ERP_WEB_INGEST_KEY=...`
- n8n → the **ERP web-ingest key** credential (Header Auth): name `Authorization`, value `Bearer <key>`

The route rejects anything without the right Bearer. (n8n already verified the website's HMAC before it ever reaches here — defence in depth.)

## Request contract (what n8n sends)
`Content-Type: application/json`, `Authorization: Bearer <ERP_WEB_INGEST_KEY>`
```json
{
  "leadId": 42,
  "name": "Sohel",
  "email": "sohel@acme-rmg.com.bd",
  "phone": "+880 1722 00 21 25",
  "company": "ACME RMG",
  "segment": "rmg",
  "source": "calculator",
  "score": 75,
  "temperature": "hot",
  "sourcePath": "/knowledge/calculators/diesel-vs-bess",
  "utm": { "source": "facebook", "campaign": "2026q3-rmg-bess-diesel-alt" },
  "message": null,
  "ts": "2026-06-13T10:00:00Z"
}
```
Only `email` is guaranteed non-empty. Everything else may be absent — treat as optional.

## Response
- `200 { "ok": true, "contactId": "...", "opportunityId": "..." }` on success.
- `401` if the Bearer is wrong. `400` on a body with no email.
- Be **idempotent**: dedupe by `webLeadId` (fall back to `email`). The same visitor can submit several times — upsert, don't duplicate.

### Idempotency — make it a true upsert (required before real traffic)

A plain `INSERT` creates a new customer on every resubmit. Real visitors re-run
calculators and re-submit forms, so dedupe at the DB level:

```sql
-- 1) one-time: a unique key to conflict on (partial, so null webleadid is allowed)
CREATE UNIQUE INDEX IF NOT EXISTS customers_webleadid_uniq
  ON customers (webleadid) WHERE webleadid IS NOT NULL;
-- (or, if you'd rather dedupe by email:)
-- CREATE UNIQUE INDEX IF NOT EXISTS customers_email_uniq ON customers (lower(email));

-- 2) the route's write becomes an upsert
INSERT INTO customers (webleadid, name, email, phone, company, status, leadscore,
                       campaign, segment, source, notes, sourcepage, updated_at)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, now())
ON CONFLICT (webleadid) WHERE webleadid IS NOT NULL
DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, company=EXCLUDED.company,
              status=EXCLUDED.status, leadscore=EXCLUDED.leadscore,
              campaign=EXCLUDED.campaign, notes=EXCLUDED.notes, updated_at=now();
```
App-level equivalent (if you don't use raw SQL): `findByWebLeadId(leadId) ?? findByEmail(email)` → `update` else `insert`. Either way a repeat
`leadId:999` updates the existing row instead of creating a duplicate.

---

## Reference implementation A — Next.js App Router (t3 / tRPC ERP)

`app/api/leads/from-web/route.ts` in the ERP repo. Reuses your tRPC router so
mapping logic isn't duplicated.

```ts
import { NextRequest, NextResponse } from "next/server";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1) Auth — constant-time compare of the Bearer key.
  const auth = req.headers.get("authorization") ?? "";
  const key = process.env.ERP_WEB_INGEST_KEY ?? "";
  const got = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const okAuth =
    key.length > 0 &&
    got.length === key.length &&
    crypto.timingSafeEqual(Buffer.from(got), Buffer.from(key));
  if (!okAuth) return NextResponse.json({ ok: false }, { status: 401 });

  // 2) Parse + minimal validation.
  const d = await req.json().catch(() => null);
  if (!d?.email) return NextResponse.json({ ok: false }, { status: 400 });

  // 3) Map temperature → your pipeline stage.
  const stage =
    d.temperature === "hot" ? "qualified" : d.temperature === "warm" ? "new" : "lead";

  // 4) Reuse existing ERP procedures via a server-side caller.
  const caller = appRouter.createCaller(await createTRPCContext({ headers: req.headers }));

  // Idempotent upsert by email — adapt to YOUR procedure names.
  const contact = await caller.crm.contacts.upsert({
    email: d.email,
    name: d.name ?? d.company ?? d.email,
    phone: d.phone ?? null,
    company: d.company ?? null,
    tags: ["website", d.segment, d.source].filter(Boolean),
  });

  const opportunity = await caller.crm.opportunities.upsert({
    contactId: contact.id,
    title: `${d.company ?? d.name ?? "Web lead"} — ${d.segment ?? "general"}`,
    stage,
    score: d.score ?? 0,
    source: d.source ?? "website",
    sourcePage: d.sourcePath ?? null,
    campaign: d.utm?.campaign ?? null,
    note: d.message ?? null,
    webLeadId: d.leadId ?? null,
  });

  await caller.crm.tasks.create({
    contactId: contact.id,
    title: `Follow up: ${d.company ?? d.name ?? d.email}`,
    priority: d.temperature === "hot" ? "high" : "normal",
    dueInHours: d.temperature === "hot" ? 4 : 24,
  });

  return NextResponse.json({ ok: true, contactId: contact.id, opportunityId: opportunity.id });
}
```
> Rename `crm.contacts.upsert` / `crm.opportunities.upsert` / `crm.tasks.create`
> to your actual procedures. If you don't have an `upsert`, do
> `findByEmail` → `update` else `create`. `import crypto from "crypto"` if not global.

## Reference implementation B — Express / standalone ERP

```js
import crypto from "crypto";
app.post("/api/leads/from-web", express.json(), async (req, res) => {
  const key = process.env.ERP_WEB_INGEST_KEY || "";
  const got = (req.get("authorization") || "").replace(/^Bearer /, "");
  if (!key || got.length !== key.length ||
      !crypto.timingSafeEqual(Buffer.from(got), Buffer.from(key))) {
    return res.status(401).json({ ok: false });
  }
  const d = req.body;
  if (!d?.email) return res.status(400).json({ ok: false });
  const stage = d.temperature === "hot" ? "qualified" : d.temperature === "warm" ? "new" : "lead";
  // ... your ORM upsert (contact) → opportunity → task, idempotent by email ...
  return res.json({ ok: true });
});
```

## Network note
n8n's HTTP node calls this URL, so `http://localhost:3010` only works if **n8n
runs on the same host as the ERP**. If they're on different machines, use the
ERP's **private/internal** address (never expose the ERP publicly) and set it as
`ERP_LEAD_INGEST_URL` in n8n's variables.

## Test (after the route exists)
```bash
KEY='your-ERP_WEB_INGEST_KEY'
curl -s -X POST http://localhost:3010/api/leads/from-web \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"email":"t@example.com","name":"Test","company":"ACME","segment":"rmg","source":"calculator","score":75,"temperature":"hot"}'
# → {"ok":true,...}  and a contact + opportunity + task in the ERP.
# Wrong/empty key → 401.
```
