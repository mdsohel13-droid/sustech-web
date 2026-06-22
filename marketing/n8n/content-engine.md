# Evergreen AI Content Engine — activation

Daily pipeline that keeps the site fresh: an AI writes cited, GEO-optimised
articles into the **News** collection as **drafts**, the owner approves, and the
sitemap/llms.txt refresh instantly (already wired). The backbone (auth, gates,
approval, guarded auto-publish, daily report) already ships in the app — this
folder adds the only two missing pieces: the **generation prompt** and the
**n8n orchestration**.

Files: `content-engine.prompt.md` (Claude prompt) · `content-engine.workflow.json`
(importable n8n) · this doc.

## Flow
```
04:00 Dhaka ─ n8n cron
  → GET /api/hermes/content-brief         (topics, gaps, categories, recent titles, services, sectors)
  → pick N topics (CONTENT_TOPICS_PER_DAY, default 2)
  → Claude (Messages API, cached system prompt) → strict JSON article
  → POST /api/hermes/ingest  →  News DRAFT  (citation gate + content-lint run on save)
  → owner reviews in /admin → one-click Approve → publish → /sitemap.xml + /llms.txt revalidate
  (08:00 daily report email summarises drafts + pending approvals)
```
This also fills the currently-empty **News** collection — that collection is the
engine's output target by design (admin/AI-driven, never hardcoded).

## Activate (n8n on the VPS)
1. Import `content-engine.workflow.json`.
2. n8n env / variables:
   - `SITE_URL=https://www.sustechltd.com`
   - `ANTHROPIC_API_KEY=...`
   - `HERMES_AGENT_SECRET=...` (same value as the web `.env`)
   - `CONTENT_SYSTEM_PROMPT=` ← paste the **SYSTEM** block from `content-engine.prompt.md`
   - `CONTENT_MODEL=claude-opus-4-8` (or `claude-sonnet-4-6` for cheaper routine runs)
   - `CONTENT_TOPICS_PER_DAY=2`
   - `NODE_FUNCTION_ALLOW_BUILTIN` already includes what the Code nodes need (none beyond JS).
3. On the web `.env`: keep **`AUTO_PUBLISH_ENABLED=false`** (shadow). Ensure
   `HERMES_AGENT_SECRET`, `APPROVAL_TOKEN_SECRET`, `OWNER_NOTIFY_EMAIL` are set.
4. **Activate** the workflow. First run → drafts appear in `/admin → News`.

## Rollout (safety-gated — do NOT skip)
| Phase | What | Gate |
|---|---|---|
| **1. Shadow (~2 weeks)** | Engine drafts daily; owner reviews quality. Nothing publishes. | `AUTO_PUBLISH_ENABLED=false` |
| **2. Owner-approved** | One-click approve the good ones each morning. | manual |
| **3. Guarded auto** | Low-risk categories auto-publish after 24h if no response. | set `AUTO_PUBLISH_ENABLED=true` + `HERMES_AUTO_PUBLISH_CATEGORIES=industry-news,ai-tech,market-insight`, daily cap 5 |

## Safety (enforced by the app, not just the prompt)
- **Citations required + real numbers only** — `citation-required` + content-lint gates block invented stats; the prompt mandates an authoritative `sourceUrl`.
- **`company-update` / `product-update` can NEVER auto-publish** (HUMAN_REQUIRED) — the AI is told never to write them.
- **Ingest is rate-limited** (30 drafts/24h) and **DRAFT-only**.
- **Prompt-injection hardened** — the system prompt treats fetched content as data; never leaks rules, never quotes prices/specs/clients.

## Tuning / cost
- `claude-opus-4-8` for flagship explainers; `claude-sonnet-4-6` for roundups/refreshes.
- System prompt is sent as a `cache_control: ephemeral` block → cached across the day's runs (cheaper).
- Raise `CONTENT_TOPICS_PER_DAY` once review throughput is comfortable.

## Verify after first run
```
/admin → News → new DRAFT(s) with citations + FAQ
08:00 → owner digest email lists them
(after approve+publish) curl /sitemap.xml | grep -c "/news/"   # grows
```
