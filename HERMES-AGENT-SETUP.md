# Hermes AI Content Agent — Setup & Operations Guide

> **Who this is for:** The developer or Super Admin setting up the Hermes AI content agent for automated daily GEO/AEO content updates.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1 — SOURCE GATHERING  (daily cron, 5:00 AM BST)       │
│                                                             │
│  • RSS feeds: SREDA, BPDB, The Daily Star (energy desk)    │
│  • News APIs: NewsAPI.org (solar, EPC, Bangladesh)         │
│  • Sustech activity: new projects, certifications          │
│  • AI/tech news: TechCrunch, MIT Tech Review (relevant)    │
└──────────────────┬──────────────────────────────────────────┘
                   │  raw data
┌──────────────────▼──────────────────────────────────────────┐
│  TIER 2 — HERMES AI PROCESSING  (n8n workflow / Python)     │
│                                                             │
│  1. GET /api/hermes/content-brief  → see gaps + topics     │
│  2. Claude API → write GEO-optimized article               │
│  3. POST /api/hermes/ingest  → create draft in CMS         │
│  4. Notify team (Slack / email) → "3 drafts ready"         │
└──────────────────┬──────────────────────────────────────────┘
                   │  draft created
┌──────────────────▼──────────────────────────────────────────┐
│  TIER 3 — CMS + WEBSITE                                     │
│                                                             │
│  • Payload CMS: draft appears in News & Updates collection │
│  • Team reviews (30 sec), clicks Publish                   │
│  • OR: auto-publish if category is in allow-list           │
│  • Next.js ISR revalidates /news immediately on publish    │
│  • llms.txt + sitemap.xml update automatically (hourly)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1 — Environment variables

Add to your server `.env` (on the Virtarix VPS):

```bash
# Hermes authentication — generate a strong random secret
HERMES_AGENT_SECRET=<generate with: openssl rand -hex 32>

# Categories that Hermes may auto-publish without human review.
# Only include low-risk categories (no Sustech-specific claims).
# Leave blank to require human approval for ALL content (recommended to start).
HERMES_AUTO_PUBLISH_CATEGORIES=industry-news,ai-tech,market-insight
```

**Never** include `company-update` or `product-update` in auto-publish — those need human verification before going live.

Restart the server after setting env vars:
```bash
pm2 restart sustech-web
```

---

## Step 2 — Test the API endpoints

### Verify authentication
```bash
curl -s https://beta.sustechltd.com/api/hermes/content-brief \
  -H "Authorization: Bearer YOUR_HERMES_AGENT_SECRET" | python -m json.tool
```

You should get a JSON response with `suggestedTopics`, `contentGaps`, and `geoInstructions`.

### Post a test draft
```bash
curl -s -X POST https://beta.sustechltd.com/api/hermes/ingest \
  -H "Authorization: Bearer YOUR_HERMES_AGENT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test: Bangladesh Solar Sector Update",
    "category": "industry-news",
    "summary": "This is a test article created by the Hermes agent setup process.",
    "body": "This test article verifies that the Hermes content ingest API is working correctly. It will appear as a draft in the CMS News & Updates collection and should be deleted after testing.",
    "source": "Hermes Agent Test",
    "tags": ["test", "setup"],
    "faq": [
      {"question": "Is this a test?", "answer": "Yes, this is a test article created during setup."}
    ]
  }'
```

Expected response:
```json
{
  "id": 1,
  "slug": "test-bangladesh-solar-sector-update",
  "status": "draft",
  "adminUrl": "https://beta.sustechltd.com/admin/collections/news-items/1",
  "message": "Draft created. An admin or editor must publish it."
}
```

---

## Step 3 — Set up the Hermes agent (n8n workflow)

The recommended approach is an **n8n workflow** running on the same VPS. n8n is free, self-hosted, and has native Claude + HTTP connectors.

### Install n8n on Virtarix VPS

```bash
npm install -g n8n
pm2 start n8n --name n8n -- start
pm2 save
```

Access at: `http://your-vps-ip:5678`

### Import the Hermes workflow

Create a new n8n workflow with these nodes:

```
[Cron: 5:00 AM daily]
       ↓
[HTTP: GET /api/hermes/content-brief]
       ↓
[Claude API: Generate 3 articles from content brief]
       ↓
[Loop: for each article]
       ↓
[HTTP: POST /api/hermes/ingest]
       ↓
[Slack/Email: "3 new drafts ready for review"]
```

### Claude API prompt for Hermes

Use this system prompt in the Claude API call:

```
{{geoInstructions from content-brief}}

Today you must write 3 news articles for the Sustech Technology Ltd website.

ARTICLES TO WRITE TODAY:
- 1 article from category: industry-news or market-insight
  (cover a real Bangladesh energy/EPC market development)
- 1 article from category: ai-tech
  (cover an AI or technology trend relevant to solar/EPC/smart buildings)
- 1 article filling this content gap: {{contentGaps[0]}}

For each article, output a JSON object matching this schema:
{
  "title": "...",
  "category": "industry-news|ai-tech|market-insight|product-update|company-update",
  "summary": "Direct answer in 1-2 sentences (this is the AI citation snippet)",
  "body": "Full article text, 400-600 words",
  "source": "Source name if curated (or omit for original)",
  "sourceUrl": "Source URL if curated (or omit)",
  "tags": ["tag1", "tag2"],
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "model": "claude-3-5-sonnet-20241022"
}

Output a JSON array of 3 article objects. Nothing else.
```

---

## Step 4 — Alternative: Python cron script

If you prefer a simple Python script over n8n:

```python
#!/usr/bin/env python3
"""
hermes_daily.py — Daily content agent for Sustech website
Run daily via cron: 0 5 * * * /usr/bin/python3 /opt/hermes/hermes_daily.py
"""

import os, json, requests
from datetime import datetime
import anthropic

SITE_URL = os.environ["NEXT_PUBLIC_SERVER_URL"]
HERMES_SECRET = os.environ["HERMES_AGENT_SECRET"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]

HEADERS = {
    "Authorization": f"Bearer {HERMES_SECRET}",
    "Content-Type": "application/json",
}

def get_content_brief():
    r = requests.get(f"{SITE_URL}/api/hermes/content-brief", headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.json()

def generate_articles(brief: dict) -> list:
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    prompt = f"""
{brief['geoInstructions']}

Write 3 news articles for Sustech Technology Ltd. 
Content gaps to fill: {', '.join(brief['contentGaps'][:3])}
Existing topics to AVOID duplicating: {', '.join(brief['existingTopics'][:10])}
Suggested topics: {', '.join(brief['suggestedTopics'][:5])}

Output a JSON array of 3 article objects. Each object:
{{
  "title": "...",
  "category": "industry-news|ai-tech|market-insight",
  "summary": "Direct answer in 1-2 sentences",
  "body": "400-600 words",
  "source": "source name if curated",
  "sourceUrl": "source URL if curated",
  "tags": ["tag1", "tag2"],
  "faq": [{{"question": "...", "answer": "..."}}],
  "model": "claude-opus-4-5"
}}
"""
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )
    text = message.content[0].text
    # Extract JSON from the response
    start = text.find("[")
    end = text.rfind("]") + 1
    return json.loads(text[start:end])

def post_article(article: dict) -> dict:
    r = requests.post(
        f"{SITE_URL}/api/hermes/ingest",
        headers=HEADERS,
        json=article,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()

def main():
    print(f"[{datetime.now().isoformat()}] Hermes daily content run starting...")
    brief = get_content_brief()
    print(f"Content gaps: {brief['contentGaps']}")
    
    articles = generate_articles(brief)
    results = []
    for article in articles:
        result = post_article(article)
        results.append(result)
        print(f"Created: {result['status']} — {article['title'][:60]}")
        print(f"  Admin URL: {result['adminUrl']}")
    
    print(f"Done. {len(results)} articles created.")
    # TODO: send Slack/email notification here with results

if __name__ == "__main__":
    main()
```

**Install + schedule:**
```bash
pip install anthropic requests
chmod +x /opt/hermes/hermes_daily.py

# Add to crontab (runs at 5:00 AM Bangladesh time = UTC+6, so 11 PM UTC):
# crontab -e
# 0 23 * * * NEXT_PUBLIC_SERVER_URL=https://www.sustechltd.com HERMES_AGENT_SECRET=xxx ANTHROPIC_API_KEY=xxx /usr/bin/python3 /opt/hermes/hermes_daily.py >> /var/log/hermes.log 2>&1
```

---

## Step 5 — Team review workflow

After Hermes runs (daily at ~5 AM):

1. **Notification arrives** (Slack/email) — "3 new drafts ready in News & Updates"
2. **Log into CMS** → News & Updates → filter by Draft
3. **Review each draft** (30–60 seconds each):
   - Is the summary accurate and specific?
   - Are the FAQ answers correct?
   - Does the source link work?
   - Does it represent Sustech's voice?
4. **Make any edits needed**
5. **Click Publish**

Total time: ~5 minutes per day for the whole team.

---

## Content categories and auto-publish policy

| Category | Risk level | Auto-publish allowed? | Why |
|----------|-----------|----------------------|-----|
| `industry-news` | Low | ✅ Yes (opt-in) | External facts, cites source, no Sustech claims |
| `ai-tech` | Low | ✅ Yes (opt-in) | External tech coverage, no Sustech claims |
| `market-insight` | Low | ✅ Yes (opt-in) | Market analysis from public sources |
| `company-update` | HIGH | ❌ Never | Contains Sustech-specific facts — must be verified |
| `product-update` | HIGH | ❌ Never | Contains product specs — must be verified |

Set `HERMES_AUTO_PUBLISH_CATEGORIES=industry-news,ai-tech,market-insight` on the server to enable auto-publish for low-risk categories.

---

## Monitoring

### Check agent logs
```bash
cat /var/log/hermes.log
```

### Check how many drafts are pending
Log into CMS → News & Updates → filter by Status: Draft

### Check llms.txt is updating
```bash
curl -s https://www.sustechltd.com/llms.txt | grep "^## Recent News"
```

### Check sitemap includes news
```bash
curl -s https://www.sustechltd.com/sitemap.xml | grep "/news/"
```

### Rate limit status
The ingest API allows 30 requests per 24-hour rolling window. If Hermes is misconfigured and hits the limit, requests return `429 Too Many Requests` with a `Retry-After` header.

---

## GEO/AEO impact (what this achieves)

Each article Hermes publishes:

1. **Appears in `/llms.txt`** within 1 hour → AI engines index the summary directly
2. **Gets NewsArticle schema** → Google/Bing extract the headline and summary as a rich result
3. **FAQPage schema** → AI engines like Perplexity and ChatGPT pull FAQ answers as direct citations
4. **Updates sitemap.xml** → search crawlers discover it immediately
5. **Server-rendered HTML** → fully readable by all crawlers without JavaScript

Publishing 3 articles per day = ~90 new indexed pages per month = significant long-tail keyword coverage + fresh content signal for Google.

---

## Security notes

- The `HERMES_AGENT_SECRET` must be at least 32 characters. Rotate it if compromised.
- The API enforces a 30-request/24-hour rate limit to prevent abuse.
- Hermes can never publish `company-update` or `product-update` categories — hardcoded safety.
- All input is validated before touching the database.
- Hermes drafts include a full audit trail (`agentMeta`) visible in the CMS.
