import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { signApproval, verifyApproval } from "@/lib/approval-token";

const ENV = process.env.APPROVAL_TOKEN_SECRET;
beforeEach(() => {
  process.env.APPROVAL_TOKEN_SECRET = "test-approval-secret-xyz";
});
afterEach(() => {
  process.env.APPROVAL_TOKEN_SECRET = ENV;
});

const base = {
  docId: 42,
  collection: "articles" as const,
  versionId: "v-abc",
  action: "approve" as const,
};

describe("approval-token", () => {
  it("signs and verifies a valid token round-trip", () => {
    const signed = signApproval(base);
    expect(signed).not.toBeNull();
    const claims = verifyApproval(signed!.token);
    expect(claims).not.toBeNull();
    expect(claims!.docId).toBe(42);
    expect(claims!.collection).toBe("articles");
    expect(claims!.versionId).toBe("v-abc");
    expect(claims!.jti).toBe(signed!.jti);
  });

  it("rejects a tampered signature", () => {
    const { token } = signApproval(base)!;
    expect(verifyApproval(token + "x")).toBeNull();
    const [h, b] = token.split(".");
    expect(verifyApproval(`${h}.${b}.deadbeef`)).toBeNull();
  });

  it("rejects a tampered payload (version pin holds)", () => {
    const { token } = signApproval(base)!;
    const [h, , s] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...base, versionId: "v-OTHER", jti: "x", exp: 9_999_999_999 }),
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(verifyApproval(`${h}.${forged}.${s}`)).toBeNull();
  });

  it("rejects an expired token", () => {
    const signed = signApproval({ ...base, ttlHours: -1 })!; // already expired
    expect(verifyApproval(signed.token)).toBeNull();
  });

  it("each token gets a unique jti", () => {
    expect(signApproval(base)!.jti).not.toBe(signApproval(base)!.jti);
  });

  it("returns null when no secret is configured", () => {
    process.env.APPROVAL_TOKEN_SECRET = "";
    expect(signApproval(base)).toBeNull();
    expect(verifyApproval("a.b.c")).toBeNull();
  });

  it("a token signed with a different secret does not verify", () => {
    const { token } = signApproval(base)!;
    process.env.APPROVAL_TOKEN_SECRET = "a-different-secret";
    expect(verifyApproval(token)).toBeNull();
  });
});
