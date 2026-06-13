import { describe, expect, it } from "vitest";
import { splitCiteMarkers, hasCiteMarker } from "@/lib/content/cite-markers";
import { extractLexicalText, lintRichText, lintText } from "@/lib/content/lint";

describe("content lint — literal company stats", () => {
  it("flags hard-coded headline stats", () => {
    expect(
      lintText("We delivered 103+ projects").some((f) => f.rule === "literal-company-stat"),
    ).toBe(true);
    expect(lintText("Serving 175+ clients across 10 sectors").length).toBeGreaterThanOrEqual(2);
    expect(lintText("8 years of EPC experience")[0]?.rule).toBe("literal-company-stat");
  });
  it("passes clean copy and the interpolation token", () => {
    expect(lintText("We have completed many projects across the country.")).toHaveLength(0);
    expect(lintText("Across {{stat:projects}} projects")).toHaveLength(0);
  });
});

describe("content lint — banned guarantees", () => {
  it("flags guarantees and absolute claims", () => {
    expect(lintText("We guarantee 30% savings").some((f) => f.rule === "banned-guarantee")).toBe(
      true,
    );
    expect(lintText("100% efficiency, guaranteed")).toHaveLength(2);
    expect(lintText("the cheapest price in Dhaka")[0]?.rule).toBe("banned-guarantee");
  });
  it("allows hedged catalog language", () => {
    expect(lintText("Up to 75% savings and 95%+ efficiency")).toHaveLength(0);
  });
});

describe("extractLexicalText", () => {
  it("pulls text out of a Lexical tree", () => {
    const doc = {
      root: {
        children: [
          {
            type: "paragraph",
            children: [
              { type: "text", text: "Solar saves " },
              { type: "text", text: "money" },
            ],
          },
        ],
      },
    };
    expect(extractLexicalText(doc).replace(/\s+/g, " ").trim()).toBe("Solar saves money");
  });
  it("lints through a rich text value", () => {
    const doc = { root: { children: [{ type: "text", text: "we guarantee it" }] } };
    expect(lintRichText(doc).some((f) => f.rule === "banned-guarantee")).toBe(true);
  });
});

describe("splitCiteMarkers", () => {
  it("splits text around [cite:n] markers", () => {
    const segs = splitCiteMarkers("Solar saves 75% [cite:2]. Then [cite:5] more.");
    expect(segs).toEqual([
      { type: "text", value: "Solar saves 75% " },
      { type: "cite", n: 2 },
      { type: "text", value: ". Then " },
      { type: "cite", n: 5 },
      { type: "text", value: " more." },
    ]);
  });
  it("keeps plain text as a single segment", () => {
    expect(splitCiteMarkers("no markers here")).toEqual([
      { type: "text", value: "no markers here" },
    ]);
  });
  it("treats [cite:0] as literal text", () => {
    const segs = splitCiteMarkers("bad [cite:0] marker");
    expect(segs.some((s) => s.type === "cite")).toBe(false);
  });
  it("hasCiteMarker detects valid markers only", () => {
    expect(hasCiteMarker("see [cite:3]")).toBe(true);
    expect(hasCiteMarker("see [cite:0]")).toBe(false);
    expect(hasCiteMarker("nothing")).toBe(false);
  });
});
