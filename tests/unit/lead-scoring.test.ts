import { describe, expect, it } from "vitest";
import { corporateEmailDomain, isHot, scoreLead } from "@/lib/leads/scoring";
import { mergeLead, sanitizeTouch } from "@/lib/leads/merge";
import type { Lead } from "@/payload-types";

describe("corporateEmailDomain", () => {
  it("returns the domain for corporate addresses", () => {
    expect(corporateEmailDomain("gm@bracbank.com")).toBe("bracbank.com");
  });
  it("rejects free-mail providers and junk", () => {
    expect(corporateEmailDomain("someone@gmail.com")).toBeNull();
    expect(corporateEmailDomain("not-an-email")).toBeNull();
    expect(corporateEmailDomain("")).toBeNull();
    expect(corporateEmailDomain(undefined)).toBeNull();
  });
});

describe("scoreLead", () => {
  it("scores an industrial RFQ with corporate email + phone as hot", () => {
    const score = scoreLead({
      source: "rfq",
      segment: "rmg",
      email: "engineer@pacificjeans.com",
      phone: "+8801712345678",
      company: "Pacific Jeans",
      messageLength: 200,
    });
    expect(score).toBeGreaterThanOrEqual(60);
    expect(isHot(score)).toBe(true);
  });

  it("scores an anonymous home enquiry as cold", () => {
    const score = scoreLead({ source: "chat", segment: "home", email: "x@gmail.com" });
    expect(score).toBeLessThan(60);
  });

  it("repeat engagement raises the score (capped)", () => {
    const base = scoreLead({ source: "calculator", segment: "bank", email: "a@ebl.com.bd" });
    const repeat = scoreLead({
      source: "calculator",
      segment: "bank",
      email: "a@ebl.com.bd",
      touchCount: 4,
    });
    expect(repeat).toBeGreaterThan(base);
    expect(repeat - base).toBeLessThanOrEqual(15);
  });

  it("never leaves the 0–100 range", () => {
    expect(
      scoreLead({
        source: "rfq",
        segment: "rmg",
        email: "a@b.com",
        phone: "+880171234567",
        company: "X",
        touchCount: 99,
        messageLength: 9999,
      }),
    ).toBeLessThanOrEqual(100);
    expect(scoreLead({ source: "manual" })).toBeGreaterThanOrEqual(0);
  });
});

describe("sanitizeTouch", () => {
  it("lowercases email, clamps lengths, drops unknown segments", () => {
    const t = sanitizeTouch({
      source: "rfq",
      email: "  BIG@Company.COM ",
      name: "x".repeat(500),
      segment: "DROP TABLE",
    });
    expect(t.email).toBe("big@company.com");
    expect(t.name).toHaveLength(120);
    expect(t.segment).toBeUndefined();
  });
});

describe("mergeLead", () => {
  const now = new Date("2026-06-13T04:00:00Z");

  it("creates a new lead with first-touch attribution", () => {
    const data = mergeLead(
      null,
      sanitizeTouch({
        source: "calculator",
        email: "md@factory.com",
        segment: "rmg",
        utm: { source: "facebook", campaign: "bess-launch" },
      }),
      now,
    );
    expect(data.source).toBe("calculator");
    expect(data.utmSource).toBe("facebook");
    expect(data.touches).toHaveLength(1);
    expect(data.score).toBeGreaterThan(0);
  });

  it("never blanks existing fields and keeps first-touch source", () => {
    const existing = {
      id: 1,
      name: "Mr. Rahman",
      company: "Rahman Textiles",
      email: "r@rahmantex.com",
      source: "rfq",
      segment: "rmg",
      utmSource: "google",
      touches: [{ at: "2026-06-01T00:00:00.000Z", channel: "rfq" }],
      marketingOptIn: true,
    } as unknown as Lead;
    const data = mergeLead(
      existing,
      sanitizeTouch({ source: "chat", utm: { source: "facebook" }, marketingOptIn: false }),
      now,
    );
    expect(data.name).toBe("Mr. Rahman");
    expect(data.source).toBe("rfq"); // first touch wins
    expect(data.utmSource).toBe("google");
    expect(data.marketingOptIn).toBe(true); // consent never downgraded by a touch
    expect(data.touches).toHaveLength(2);
  });

  it("reopens a lost lead that re-engages", () => {
    const existing = { id: 2, email: "a@b.com", source: "rfq", status: "lost" } as unknown as Lead;
    const data = mergeLead(existing, sanitizeTouch({ source: "rfq", email: "a@b.com" }), now);
    expect(data.status).toBe("new");
  });

  it("bounds the touch timeline at 50", () => {
    const existing = {
      id: 3,
      email: "a@b.com",
      source: "rfq",
      touches: Array.from({ length: 60 }, (_, i) => ({
        at: `2026-01-01T00:00:${String(i % 60).padStart(2, "0")}.000Z`,
        channel: "chat",
      })),
    } as unknown as Lead;
    const data = mergeLead(existing, sanitizeTouch({ source: "chat", email: "a@b.com" }), now);
    expect(data.touches).toHaveLength(50);
  });
});
