import { afterEach, describe, expect, it, vi } from "vitest";
import { indexNowEnabled, submitIndexNow } from "@/lib/indexnow";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("indexnow", () => {
  it("is a no-op without a key (no fetch)", async () => {
    vi.stubEnv("INDEXNOW_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SERVER_URL", "https://www.sustechltd.com");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(indexNowEnabled()).toBe(false);
    expect(await submitIndexNow(["/news/a"])).toEqual({ submitted: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not ping for a non-https (dev/beta) origin", () => {
    vi.stubEnv("INDEXNOW_KEY", "abc123");
    vi.stubEnv("NEXT_PUBLIC_SERVER_URL", "http://localhost:4123");
    expect(indexNowEnabled()).toBe(false);
  });

  it("submits absolute, de-duped URLs with host + keyLocation when configured", async () => {
    vi.stubEnv("INDEXNOW_KEY", "abc123");
    vi.stubEnv("NEXT_PUBLIC_SERVER_URL", "https://www.sustechltd.com");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const res = await submitIndexNow(["/news/a", "/news/a", "relative-ignored", "/projects/b"]);
    expect(res).toEqual({ submitted: 2 });

    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error("fetch was not called");
    const body = JSON.parse((call[1] as { body: string }).body);
    expect(body.host).toBe("www.sustechltd.com");
    expect(body.key).toBe("abc123");
    expect(body.keyLocation).toBe("https://www.sustechltd.com/api/indexnow/key");
    expect(body.urlList).toEqual([
      "https://www.sustechltd.com/news/a",
      "https://www.sustechltd.com/projects/b",
    ]);
  });

  it("never throws when fetch rejects", async () => {
    vi.stubEnv("INDEXNOW_KEY", "abc123");
    vi.stubEnv("NEXT_PUBLIC_SERVER_URL", "https://www.sustechltd.com");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await submitIndexNow(["/news/a"])).toEqual({ submitted: 0 });
  });
});
