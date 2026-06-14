import { describe, expect, it } from "vitest";
import { renderReportHtml, summarizePending, type ReportMetrics } from "@/lib/daily-report";

const NOW = 1_900_000_000_000;
const hoursAgo = (h: number) => NOW - h * 3_600_000;

describe("summarizePending", () => {
  it("flags red when any draft is pending > 18h", () => {
    const s = summarizePending(
      [
        { id: "1", title: "a", collection: "articles", pendingSinceMs: hoursAgo(20) },
        { id: "2", title: "b", collection: "articles", pendingSinceMs: hoursAgo(3) },
      ],
      NOW,
    );
    expect(s.count).toBe(2);
    expect(s.oldestHours).toBe(20);
    expect(s.redFlag).toBe(true);
    expect(s.awaitingDelivery).toBe(0);
  });
  it("does not flag when all are under 18h", () => {
    const s = summarizePending(
      [{ id: "1", title: "a", collection: "articles", pendingSinceMs: hoursAgo(5) }],
      NOW,
    );
    expect(s.redFlag).toBe(false);
    expect(s.oldestHours).toBe(5);
  });
  it("counts drafts awaiting email delivery (clock not started)", () => {
    const s = summarizePending(
      [
        { id: "1", title: "a", collection: "articles", pendingSinceMs: null },
        { id: "2", title: "b", collection: "articles", pendingSinceMs: null },
      ],
      NOW,
    );
    expect(s.awaitingDelivery).toBe(2);
    expect(s.oldestHours).toBeNull();
    expect(s.redFlag).toBe(false);
  });
  it("empty queue is clean", () => {
    expect(summarizePending([], NOW)).toEqual({
      count: 0,
      oldestHours: null,
      redFlag: false,
      awaitingDelivery: 0,
    });
  });
});

describe("renderReportHtml", () => {
  const metrics: ReportMetrics = {
    date: "2026-06-13",
    leads: {
      total: 3,
      hot: 1,
      bySegment: { rmg: 2, bank: 1 },
      bySource: { calculator: 2, rfq: 1 },
    },
    pending: { count: 1, oldestHours: 20, redFlag: true, awaitingDelivery: 0 },
    pipeline: {
      lastN8nRunAt: "2026-06-13T04:00:00Z",
      lastFallbackAt: null,
      lastHeartbeatAt: null,
      sourcesChanged: 2,
      autoPublishedToday: 0,
    },
    killSwitches: { sourceWatch: true, autoPublishEnv: false, killSwitch: false },
  };
  it("renders escaped, self-contained HTML with the key figures", () => {
    const html = renderReportHtml(metrics);
    expect(html).toContain("daily report");
    expect(html).toContain("2026-06-13");
    expect(html).toContain("rmg: <strong>2</strong>");
    expect(html).toContain("#b00020"); // red flag styling for the 20h-old pending draft
    expect(html).toContain("/review");
  });
  it("escapes HTML in dynamic values", () => {
    const evil = { ...metrics, leads: { ...metrics.leads, bySource: { "<script>": 1 } } };
    expect(renderReportHtml(evil)).not.toContain("<script>");
    expect(renderReportHtml(evil)).toContain("&lt;script&gt;");
  });
});
