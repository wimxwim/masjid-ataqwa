import { describe, it, expect } from "vitest";
import { validateImageUrl } from "@/lib/actions/_helpers";
import { extractNikFromOcr, extractNameFromOcr, extractAddressFromOcr } from "@/lib/nik-utils";

describe("validateImageUrl", () => {
  it("passes valid HTTPS URL", () => {
    expect(() => validateImageUrl("https://supabase.co/storage/image.jpg")).not.toThrow();
  });

  it("throws on HTTP URL", () => {
    expect(() => validateImageUrl("http://supabase.co/storage/image.jpg")).toThrow(
      "URL gambar harus HTTPS",
    );
  });

  it("passes null/undefined", () => {
    expect(() => validateImageUrl(null)).not.toThrow();
    expect(() => validateImageUrl(undefined)).not.toThrow();
  });

  it("passes on empty string (returns early)", () => {
    expect(() => validateImageUrl("")).not.toThrow();
  });

  it("throws on invalid URL", () => {
    expect(() => validateImageUrl("not-a-url")).toThrow("URL gambar tidak valid");
  });

  it("throws on javascript: URL", () => {
    expect(() => validateImageUrl("javascript:alert('xss')")).toThrow("URL gambar harus HTTPS");
  });
});

describe("extractNikFromOcr", () => {
  it("extracts 16-digit NIK from text", () => {
    const result = extractNikFromOcr("NIK : 3174051234567890\nNama : Ahmad");
    expect(result).toBe("3174051234567890");
  });

  it("returns null if no 16-digit number", () => {
    const result = extractNikFromOcr("Nama : Ahmad");
    expect(result).toBeNull();
  });

  it("handles whitespace in NIK", () => {
    const result = extractNikFromOcr("NIK 3174 0512 3456 7890");
    expect(result).toBe("3174051234567890");
  });

  it("ignores numbers shorter than 16 digits", () => {
    const result = extractNikFromOcr("Telp: 08123456789");
    expect(result).toBeNull();
  });
});

describe("extractNameFromOcr", () => {
  it("extracts name after 'Nama' label", () => {
    const result = extractNameFromOcr("NIK : 1234\nNama\nAHMAD BIN TEST\nAlamat");
    expect(result).toBe("AHMAD BIN TEST");
  });

  it("handles multi-line KTP format", () => {
    const result = extractNameFromOcr("NIK\n1234\nNama\nAHMAD BIN TEST\nAlamat");
    expect(result).toBe("AHMAD BIN TEST");
  });

  it("returns null if no name label", () => {
    const result = extractNameFromOcr("Some random OCR text");
    expect(result).toBeNull();
  });
});

describe("extractAddressFromOcr", () => {
  it("extracts address after 'Alamat' label", () => {
    const result = extractAddressFromOcr("Nama : Test\nAlamat\nJl. Merpati No. 1\nJakarta");
    expect(result).toBe("Jl. Merpati No. 1");
  });

  it("returns null if no address label", () => {
    const result = extractAddressFromOcr("Some random OCR text");
    expect(result).toBeNull();
  });
});
