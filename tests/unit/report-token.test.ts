import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { reportPath, signReport, verifyReport } from "@/lib/report-token";

const ENV = process.env.REPORTS_SECRET;
beforeEach(() => {
  process.env.REPORTS_SECRET = "test-reports-secret";
});
afterEach(() => {
  process.env.REPORTS_SECRET = ENV;
});

describe("report-token", () => {
  it("signs and verifies a valid token for a lead id", () => {
    const tok = signReport(7);
    expect(tok).not.toBeNull();
    expect(verifyReport(7, tok)).toBe(true);
  });
  it("rejects a token for a different lead id", () => {
    const tok = signReport(7)!;
    expect(verifyReport(8, tok)).toBe(false);
  });
  it("rejects a tampered token", () => {
    const tok = signReport(7)!;
    expect(verifyReport(7, tok + "x")).toBe(false);
    expect(verifyReport(7, "999999999999.deadbeef")).toBe(false);
  });
  it("rejects an expired token", () => {
    const tok = `${Date.now() - 1000}.whatever`;
    expect(verifyReport(7, tok)).toBe(false);
  });
  it("reportPath builds /reports/<id>/<token>", () => {
    const p = reportPath(7);
    expect(p).toMatch(/^\/reports\/7\//);
  });
  it("returns null / false when unconfigured", () => {
    process.env.REPORTS_SECRET = "";
    expect(signReport(7)).toBeNull();
    expect(reportPath(7)).toBeNull();
    expect(verifyReport(7, "a.b")).toBe(false);
  });
});
