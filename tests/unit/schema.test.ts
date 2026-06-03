import { describe, expect, it } from "vitest";
import { homeJsonLd, localBusinessSchema } from "@/lib/schema";

describe("homeJsonLd", () => {
  it("includes Organization, LocalBusiness and WebSite nodes", () => {
    const graph = homeJsonLd()["@graph"] as Array<Record<string, unknown>>;
    const types = graph.map((node) => node["@type"]);
    expect(types).toEqual(["Organization", "LocalBusiness", "WebSite"]);
  });

  it("omits unconfirmed contact fields instead of inventing them", () => {
    const lb = localBusinessSchema();
    // Contact details are null until confirmed via Hermes/MD — they must not appear.
    expect(lb).not.toHaveProperty("telephone");
    expect(lb).not.toHaveProperty("email");
    expect(lb).not.toHaveProperty("address");
    expect(lb.name).toBe("Sustech Technology Ltd");
  });
});
