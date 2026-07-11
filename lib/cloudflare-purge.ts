/**
 * Cloudflare edge-cache purge. The CDN caches our HTML (s-maxage), so after Next
 * revalidates a page on publish we must ALSO purge Cloudflare's edge or the change
 * won't be visible to visitors until the cache TTL expires. Runs right after the
 * revalidate hook, next to the IndexNow ping.
 *
 * Safe by construction — a NO-OP unless BOTH CLOUDFLARE_ZONE_ID and
 * CLOUDFLARE_API_TOKEN are set AND NEXT_PUBLIC_SERVER_URL is a real https origin.
 * Never throws; a failed purge must never block a publish.
 */

function site(): { origin: string } | null {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    return { origin: `https://${u.host}` };
  } catch {
    return null;
  }
}

export function cloudflarePurgeEnabled(): boolean {
  return (
    Boolean(process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) && site() !== null
  );
}

/**
 * Purge the given site-relative paths from Cloudflare's edge cache. Both the bare
 * and trailing-slash forms are purged so we hit whichever variant is cached.
 * Cloudflare accepts up to 30 URLs per purge-by-URL call on all plans.
 */
export async function purgeCloudflare(paths: string[]): Promise<{ purged: number }> {
  const zone = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const s = site();
  if (!zone || !token || !s) return { purged: 0 };

  const files = Array.from(
    new Set(
      paths
        .filter((p) => p.startsWith("/"))
        .flatMap((p) => {
          const url = `${s.origin}${p}`;
          return p === "/" ? [s.origin, `${s.origin}/`] : [url, url.replace(/\/$/, "")];
        }),
    ),
  ).slice(0, 30);
  if (files.length === 0) return { purged: 0 };

  try {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ files }),
    });
    return { purged: files.length };
  } catch {
    return { purged: 0 };
  }
}

/**
 * Purge the whole zone — used when a global (nav / site settings) changes, since
 * that affects the header/footer of every page. Rare event. Best-effort.
 */
export async function purgeCloudflareEverything(): Promise<{ purged: boolean }> {
  const zone = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!zone || !token || !site()) return { purged: false };
  try {
    await fetch(`https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ purge_everything: true }),
    });
    return { purged: true };
  } catch {
    return { purged: false };
  }
}
