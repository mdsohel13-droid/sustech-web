import { describe, expect, it } from "vitest";
import {
  canAutoPublish,
  parseAllowedCategories,
  type AutoPublishContext,
} from "@/lib/auto-publish-policy";
import { diffClaims } from "@/lib/claim-diff";
import { contentHash, detectChange, isDue, normalizeContent } from "@/lib/source-watcher";

// A context that passes EVERY gate; each test flips exactly one thing.
const NOW = 1_900_000_000_000;
function ok(): AutoPublishContext {
  return {
    envEnabled: true,
    dbEnabled: true,
    killSwitch: false,
    pendingSinceMs: NOW - 25 * 3600 * 1000, // 25h ago
    nowMs: NOW,
    afterHours: 24,
    category: "knowledge-explainer",
    allowedCategories: ["industry-news-roundup", "knowledge-explainer", "glossary"],
    riskFlags: [],
    claimsIdentical: true,
    staleSource: false,
    todayCount: 0,
    dailyCap: 5,
  };
}

describe("canAutoPublish — the all-must-hold gate", () => {
  it("allows only when every condition holds", () => {
    expect(canAutoPublish(ok())).toEqual({ allow: true, reasons: [] });
  });

  it.each([
    ["env off", { envEnabled: false }],
    ["db toggle off", { dbEnabled: false }],
    ["kill switch", { killSwitch: true }],
    ["no delivery clock", { pendingSinceMs: null }],
    ["too soon", { pendingSinceMs: NOW - 23 * 3600 * 1000 }],
    ["category not whitelisted", { category: "market-insight" }],
    ["company-update never", { category: "company-update" }],
    ["risk flags", { riskFlags: ["tariff"] }],
    ["numeric change", { claimsIdentical: false }],
    ["stale source", { staleSource: true }],
    ["daily cap", { todayCount: 5 }],
  ])("denies when %s", (_label, patch) => {
    const d = canAutoPublish({ ...ok(), ...(patch as Partial<AutoPublishContext>) });
    expect(d.allow).toBe(false);
    expect(d.reasons.length).toBeGreaterThan(0);
  });

  it("collects ALL failing reasons, not just the first", () => {
    const d = canAutoPublish({ ...ok(), envEnabled: false, claimsIdentical: false, todayCount: 9 });
    expect(d.reasons.length).toBe(3);
  });

  it("parseAllowedCategories trims and drops blanks", () => {
    expect(parseAllowedCategories(" a, b ,, c ")).toEqual(["a", "b", "c"]);
    expect(parseAllowedCategories(undefined)).toEqual([]);
  });
});

describe("diffClaims — numeric ledger byte-identity", () => {
  it("identical ledgers pass (order-independent)", () => {
    const c1 = { value: "75", unit: "%", sourceType: "registry-source", citationIndex: 1 };
    const c2 = { value: "9", unit: "BDT" };
    expect(diffClaims([c1], [{ ...c1 }]).identical).toBe(true);
    expect(diffClaims([c1, c2], [c2, c1]).identical).toBe(true); // order-independent
  });
  it("any value/unit/source/index change vetoes", () => {
    const c = { value: "75", unit: "%", sourceType: "registry-source", citationIndex: 1 };
    expect(diffClaims([c], [{ ...c, value: "70" }]).identical).toBe(false);
    expect(diffClaims([c], [{ ...c, unit: "percent" }]).identical).toBe(false);
    expect(diffClaims([c], [{ ...c, citationIndex: 2 }]).identical).toBe(false);
    expect(diffClaims([c], []).identical).toBe(false);
    expect(diffClaims([c], [c, { value: "1" }]).identical).toBe(false);
  });
  it("prose-only fields (claimText/hedge) do NOT veto", () => {
    const a = [{ value: "75", unit: "%", claimText: "old", hedge: "up-to" }];
    const b = [{ value: "75", unit: "%", claimText: "new wording", hedge: "approx" }];
    expect(diffClaims(a, b).identical).toBe(true);
  });
  it("empty vs empty is identical", () => {
    expect(diffClaims([], null).identical).toBe(true);
  });
});

describe("source-watcher core", () => {
  it("normalizes away tags, whitespace and volatile dates/times", () => {
    const a = normalizeContent("<p>Tariff is 12 BDT</p> updated 2026-06-13 10:30am");
    const b = normalizeContent("<div>Tariff is 12 BDT</div> updated 2026-06-14 09:00pm");
    expect(a).toBe(b); // only the date/time differed → same normalized text
  });
  it("real content changes are detected", () => {
    const r = detectChange("Tariff is 13 BDT", contentHash("Tariff is 12 BDT"));
    expect(r.changed).toBe(true);
    expect(r.excerpt.length).toBeLessThanOrEqual(300);
  });
  it("unchanged content is not flagged", () => {
    const h = contentHash("Tariff is 12 BDT as of today");
    expect(detectChange("Tariff is 12 BDT as of today", h).changed).toBe(false);
  });
  it("isDue respects checkFrequency", () => {
    const now = NOW;
    const day = 24 * 3600 * 1000;
    expect(isDue("daily", new Date(now - 2 * day).toISOString(), now)).toBe(true);
    expect(isDue("weekly", new Date(now - 2 * day).toISOString(), now)).toBe(false);
    expect(isDue("monthly", new Date(now - 40 * day).toISOString(), now)).toBe(true);
    expect(isDue("daily", null, now)).toBe(true); // never checked
  });
});
