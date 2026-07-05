import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifySignature } from "@/app/api/midtrans/webhook/route";

function computeSignature(body: Record<string, string>, serverKey: string): string {
  const orderId = body.order_id ?? "";
  const statusCode = body.status_code ?? "";
  const grossAmount = body.gross_amount ?? "";
  return crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
}

const SERVER_KEY = "test-key";

describe("verifySignature", () => {
  const validBodyObj: Record<string, string> = {
    order_id: "donation-abc-123",
    status_code: "200",
    gross_amount: "50000.00",
    transaction_status: "settlement",
  };

  function toRaw(obj: Record<string, string>): string {
    return JSON.stringify(obj);
  }

  it("accepts correct signature", () => {
    const sig = computeSignature(validBodyObj, SERVER_KEY);
    const raw = toRaw(validBodyObj);
    expect(verifySignature(raw, sig, SERVER_KEY)).toBe(true);
  });

  it("rejects wrong signature", () => {
    const raw = toRaw(validBodyObj);
    expect(verifySignature(raw, "fake-signature", SERVER_KEY)).toBe(false);
  });

  it("rejects empty signature", () => {
    const raw = toRaw(validBodyObj);
    expect(verifySignature(raw, "", SERVER_KEY)).toBe(false);
  });

  it("rejects signature from different server key", () => {
    const sig = computeSignature(validBodyObj, "different-key");
    const raw = toRaw(validBodyObj);
    expect(verifySignature(raw, sig, SERVER_KEY)).toBe(false);
  });

  it("rejects when body fields are tampered", () => {
    const tamperedBody = { ...validBodyObj, gross_amount: "99999.00" };
    const sig = computeSignature(validBodyObj, SERVER_KEY);
    const raw = toRaw(tamperedBody);
    expect(verifySignature(raw, sig, SERVER_KEY)).toBe(false);
  });

  it("handles empty rawBody gracefully", () => {
    expect(verifySignature("{}", "anything", SERVER_KEY)).toBe(false);
  });

  it("uses timingSafeEqual (does not throw on Buffer mismatch)", () => {
    const raw = toRaw(validBodyObj);
    expect(verifySignature(raw, "short", SERVER_KEY)).toBe(false);
  });
});
