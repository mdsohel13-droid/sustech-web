import { describe, expectTypeOf, it } from "vitest";
import type { Article, Lead, NewsItem, Source } from "@/payload-types";

/**
 * Schema contract (master plan §3.0). These are TYPE-level assertions checked
 * by `pnpm typecheck` (tsc runs over tests/). They fail the build if any field
 * path the Lead Engine hooks/libs/routes depend on is renamed or retyped — the
 * "single source of truth, asserted against payload-types" guard.
 */
describe("schema contract — Lead Engine field paths", () => {
  it("Lead has the fields the upsert/scoring/suppression code reads", () => {
    expectTypeOf<Lead>().toHaveProperty("email");
    expectTypeOf<Lead>().toHaveProperty("phone");
    expectTypeOf<Lead>().toHaveProperty("segment");
    expectTypeOf<Lead>().toHaveProperty("source");
    expectTypeOf<Lead>().toHaveProperty("score");
    expectTypeOf<Lead>().toHaveProperty("status");
    expectTypeOf<Lead>().toHaveProperty("marketingOptIn");
    expectTypeOf<Lead>().toHaveProperty("optInConfirmedAt");
    expectTypeOf<Lead>().toHaveProperty("doNotContact");
    expectTypeOf<Lead>().toHaveProperty("touches");
    expectTypeOf<Lead["source"]>().toEqualTypeOf<
      "rfq" | "chat" | "calculator" | "gated-asset" | "outbound" | "manual"
    >();
  });

  it("Source has the registry + watch fields the pipeline reads", () => {
    expectTypeOf<Source>().toHaveProperty("name");
    expectTypeOf<Source>().toHaveProperty("url");
    expectTypeOf<Source>().toHaveProperty("checkUrl");
    expectTypeOf<Source>().toHaveProperty("tier");
    expectTypeOf<Source>().toHaveProperty("checkFrequency");
    expectTypeOf<Source>().toHaveProperty("lastContentHash");
    expectTypeOf<Source>().toHaveProperty("consecutiveFailures");
    expectTypeOf<Source>().toHaveProperty("active");
    expectTypeOf<Source["tier"]>().toEqualTypeOf<
      "tier1-gov" | "tier1-multilateral" | "tier2-analyst" | "tier3-press"
    >();
  });

  it("Article + NewsItem carry citations + claims + category", () => {
    expectTypeOf<Article>().toHaveProperty("citations");
    expectTypeOf<Article>().toHaveProperty("claims");
    expectTypeOf<Article>().toHaveProperty("category");
    expectTypeOf<NewsItem>().toHaveProperty("citations");
    expectTypeOf<NewsItem>().toHaveProperty("claims");
  });

  it("citations entries link a source and back a claim", () => {
    type Citation = NonNullable<Article["citations"]>[number];
    expectTypeOf<Citation>().toHaveProperty("source");
    expectTypeOf<Citation>().toHaveProperty("quotedClaim");
    expectTypeOf<Citation>().toHaveProperty("url");
    expectTypeOf<Citation>().toHaveProperty("accessedDate");
  });

  // One runtime assertion so the suite isn't empty at run time.
  it("runs", () => {
    expectTypeOf<Lead>().not.toBeAny();
  });
});
