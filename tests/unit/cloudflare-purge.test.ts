import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cloudflarePurgeEnabled,
  purgeCloudflare,
  purgeCloudflareEverything,
} from "@/lib/cloudflare-purge";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function configure() {
  vi.stubEnv("CLOUDFLARE_ZONE_ID", "zone123");
  vi.stubEnv("CLOUDFLARE_API_TOKEN", "tok456");
  vi.stubEnv("NEXT_PUBLIC_SERVER_URL", "https://www.sustechltd.com");
}

describe("cloudflare-purge", () => {
  it("is a no-op without full config (no fetch)", async () => {
    vi.stubEnv("CLOUDFLARE_ZONE_ID", "");
    vi.stubEnv("CLOUDFLARE_API_TOKEN", "");
    vi.stubEnv("NEXT_PUBLIC_SERVER_URL", "https://www.sustechltd.com");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(cloudflarePurgeEnabled()).toBe(false);
    expect(await purgeCloudflare(["/news/a"])).toEqual({ purged: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("purges absolute URLs (bare + slash variants) to the zone endpoint", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const res = await purgeCloudflare(["/", "/solutions/rmg", "ignored"]);
    expect(res.purged).toBeGreaterThan(0);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://api.cloudflare.com/client/v4/zones/zone123/purge_cache");
    expect((init as { headers: Record<string, string> }).headers.authorization).toBe(
      "Bearer tok456",
    );
    const body = JSON.parse((init as { body: string }).body);
    expect(body.files).toContain("https://www.sustechltd.com/solutions/rmg");
    expect(body.files).toContain("https://www.sustechltd.com/");
    expect(body.files).toContain("https://www.sustechltd.com");
  });

  it("purge-everything sends purge_everything", async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    expect(await purgeCloudflareEverything()).toEqual({ purged: true });
    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as { body: string }).body);
    expect(body.purge_everything).toBe(true);
  });

  it("never throws when fetch rejects", async () => {
    configure();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("net")));
    expect(await purgeCloudflare(["/x"])).toEqual({ purged: 0 });
  });
});
