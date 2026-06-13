import { describe, expect, it } from "vitest";
import {
  emailHash,
  hmacHex,
  makeConfirmToken,
  safeEqualHex,
  sha256Hex,
  verifyConfirmToken,
  verifySignature,
} from "@/lib/leads/security";

describe("hashes", () => {
  it("emailHash normalizes case and whitespace", () => {
    expect(emailHash("  MD@Factory.COM ")).toBe(sha256Hex("md@factory.com"));
  });
  it("safeEqualHex rejects different lengths and empty input", () => {
    expect(safeEqualHex("", "")).toBe(false);
    expect(safeEqualHex("ab", "abcd")).toBe(false);
    expect(safeEqualHex("abcd", "abcd")).toBe(true);
  });
});

describe("verifySignature (ingest HMAC)", () => {
  const secret = "test-secret";
  const body = JSON.stringify({ email: "a@b.com", source: "outbound" });

  it("accepts a correct signature", () => {
    expect(verifySignature(secret, body, hmacHex(secret, body))).toBe(true);
  });
  it("rejects a tampered body", () => {
    expect(verifySignature(secret, body + " ", hmacHex(secret, body))).toBe(false);
  });
  it("rejects the wrong secret and malformed signatures", () => {
    expect(verifySignature("other", body, hmacHex(secret, body))).toBe(false);
    expect(verifySignature(secret, body, "not-hex")).toBe(false);
    expect(verifySignature(secret, body, "")).toBe(false);
  });
});

describe("confirm tokens (double opt-in)", () => {
  const secret = "confirm-secret";

  it("round-trips a valid token", () => {
    const token = makeConfirmToken(secret, "MD@Factory.com");
    expect(verifyConfirmToken(secret, token)).toEqual({ email: "md@factory.com" });
  });
  it("expires after 7 days", () => {
    const token = makeConfirmToken(secret, "a@b.com", Date.now());
    const eightDays = Date.now() + 8 * 24 * 60 * 60 * 1000;
    expect(verifyConfirmToken(secret, token, eightDays)).toBeNull();
  });
  it("rejects tampering and wrong secrets", () => {
    const token = makeConfirmToken(secret, "a@b.com");
    expect(verifyConfirmToken("other-secret", token)).toBeNull();
    expect(verifyConfirmToken(secret, token.slice(0, -4) + "AAAA")).toBeNull();
    expect(verifyConfirmToken(secret, "garbage")).toBeNull();
    expect(verifyConfirmToken(secret, "")).toBeNull();
  });
});
