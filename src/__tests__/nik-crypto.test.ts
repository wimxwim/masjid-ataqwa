import { describe, it, expect } from "vitest";
import { encryptNik, decryptNik, hashNikServer } from "@/lib/nik-crypto";

describe("nik-crypto", () => {
  describe("encryptNik / decryptNik", () => {
    it("roundtrip: decrypt(encrypt(nik)) === nik", () => {
      const nik = "3174051234567890";
      const encrypted = encryptNik(nik);
      const decrypted = decryptNik(encrypted);
      expect(decrypted).toBe(nik);
    });

    it("produces different ciphertext each call (random IV)", () => {
      const nik = "3174051234567890";
      const a = encryptNik(nik);
      const b = encryptNik(nik);
      expect(a).not.toBe(b);
    });

    it("roundtrip with different NIK lengths (16-20 digits)", () => {
      const niks = ["1234567890123456", "12345678901234567890"];
      for (const nik of niks) {
        const encrypted = encryptNik(nik);
        const decrypted = decryptNik(encrypted);
        expect(decrypted).toBe(nik);
      }
    });

    it("throws on tampered ciphertext", () => {
      const nik = "3174051234567890";
      const encrypted = encryptNik(nik);
      const tampered = encrypted.slice(0, -4) + "AAAA";
      expect(() => decryptNik(tampered)).toThrow();
    });
  });

  describe("hashNikServer", () => {
    it("returns a 64-char hex string", () => {
      const hash = hashNikServer("3174051234567890");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("returns same hash for same NIK", () => {
      const a = hashNikServer("3174051234567890");
      const b = hashNikServer("3174051234567890");
      expect(a).toBe(b);
    });

    it("trims whitespace before hashing", () => {
      const a = hashNikServer("3174051234567890");
      const b = hashNikServer("  3174051234567890  ");
      expect(a).toBe(b);
    });
  });
});
