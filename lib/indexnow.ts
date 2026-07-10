/**
 * IndexNow — instant search-engine re-crawl notification (Bing, Yandex, Seznam,
 * Naver; Google ignores it but honours the faster sitemap freshness it implies).
 * Part of the evergreen engine's Tier-0 (reversible, non-claim, fully automatic):
 * whenever published content changes we tell the engines to re-fetch that URL,
 * which also accelerates replacing any stale index entries.
 *
 * Safe by construction — a NO-OP unless BOTH are true:
 *   • INDEXNOW_KEY is set, and
 *   • NEXT_PUBLIC_SERVER_URL is a real https origin (so dev/beta never ping).
 * Never throws; a failed ping must never block a publish.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";

function site(): { origin: string; host: string } | null {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null; // only the real public site pings
    return { origin: `https://${u.host}`, host: u.host };
  } catch {
    return null;
  }
}

export function indexNowEnabled(): boolean {
  return Boolean(process.env.INDEXNOW_KEY) && site() !== null;
}

/** The plain-text key IndexNow verifies (served at {keyLocation}). */
export function indexNowKey(): string | null {
  return process.env.INDEXNOW_KEY || null;
}

export function indexNowKeyLocation(): string | null {
  const s = site();
  const key = indexNowKey();
  return s && key ? `${s.origin}/api/indexnow/key` : null;
}

/**
 * Submit one or more site-relative paths (e.g. "/news/foo") for re-crawl.
 * De-duped and capped; absolute-ised against the public origin. Best-effort.
 */
export async function submitIndexNow(paths: string[]): Promise<{ submitted: number }> {
  const s = site();
  const key = indexNowKey();
  if (!s || !key) return { submitted: 0 };

  const urlList = Array.from(new Set(paths.filter((p) => p.startsWith("/"))))
    .slice(0, 10000)
    .map((p) => `${s.origin}${p}`);
  if (urlList.length === 0) return { submitted: 0 };

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: s.host,
        key,
        keyLocation: `${s.origin}/api/indexnow/key`,
        urlList,
      }),
    });
    return { submitted: urlList.length };
  } catch {
    return { submitted: 0 };
  }
}
