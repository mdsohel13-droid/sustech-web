import { describe, expect, it } from "vitest";
import { renderLeadEmailHtml, type OwnerLeadDetails } from "@/lib/leads/notify";

const base: OwnerLeadDetails = {
  leadId: 42,
  name: "Sohel",
  email: "sohel@acme-rmg.com.bd",
  phone: "+880 1722 00 21 25",
  company: "ACME RMG",
  segment: "rmg",
  source: "calculator",
  score: 75,
  temperature: "hot",
  sourcePath: "/knowledge/calculators/diesel-vs-bess",
};

describe("renderLeadEmailHtml", () => {
  it("includes the contact details with clickable mailto/tel", () => {
    const html = renderLeadEmailHtml(base, "https://www.sustechltd.com");
    expect(html).toContain("HOT LEAD");
    expect(html).toContain("ACME RMG");
    expect(html).toContain("mailto:sohel@acme-rmg.com.bd");
    expect(html).toContain("tel:+8801722002125"); // spaces stripped
    expect(html).toContain("/admin/collections/leads/42");
    expect(html).toContain("75 (hot)");
  });
  it('shows "New lead" for non-hot and omits empty fields', () => {
    const html = renderLeadEmailHtml(
      { email: "x@y.com", score: 20, temperature: "cold" },
      "https://www.sustechltd.com",
    );
    expect(html).toContain("New lead");
    expect(html).not.toContain("HOT");
    expect(html).not.toContain("Company");
    expect(html).not.toContain("Phone");
  });
  it("escapes HTML in user-supplied fields", () => {
    const html = renderLeadEmailHtml(
      { name: "<script>alert(1)</script>", email: "a@b.com" },
      "https://www.sustechltd.com",
    );
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });
});
