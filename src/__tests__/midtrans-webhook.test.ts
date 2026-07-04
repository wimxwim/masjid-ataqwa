import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { verifySignature } from "@/app/api/midtrans/webhook/route";

function computeSignature(body: Record<string, unknown>, serverKey: string): string {
  const orderId = String(body.order_id ?? "");
  const statusCode = String(body.status_code ?? "");
  const grossAmount = String(body.gross_amount ?? "");
  return crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
}

const SERVER_KEY = "test-key";

describe("verifySignature", () => {
  const validBody = {
    order_id: "donation-abc-123",
    status_code: "200",
    gross_amount: "50000.00",
    transaction_status: "settlement",
  };

  it("accepts correct signature", () => {
    const sig = computeSignature(validBody, SERVER_KEY);
    expect(verifySignature(validBody, sig, SERVER_KEY)).toBe(true);
  });

  it("rejects wrong signature", () => {
    expect(verifySignature(validBody, "fake-signature", SERVER_KEY)).toBe(false);
  });

  it("rejects empty signature", () => {
    expect(verifySignature(validBody, "", SERVER_KEY)).toBe(false);
  });

  it("rejects signature from different server key", () => {
    const sig = computeSignature(validBody, "different-key");
    expect(verifySignature(validBody, sig, SERVER_KEY)).toBe(false);
  });

  it("rejects when body fields are tampered", () => {
    const body = { ...validBody, gross_amount: "99999.00" };
    const sig = computeSignature(validBody, SERVER_KEY);
    expect(verifySignature(body, sig, SERVER_KEY)).toBe(false);
  });

  it("handles missing fields gracefully", () => {
    expect(verifySignature({}, "anything", SERVER_KEY)).toBe(false);
  });

  it("uses timingSafeEqual (does not throw on Buffer mismatch)", () => {
    expect(verifySignature(validBody, "short", SERVER_KEY)).toBe(false);
  });
});
