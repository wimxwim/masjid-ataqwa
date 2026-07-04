import { describe, it, expect } from "vitest";
import {
  createDonationSchema,
  createMustahikSchema,
  createLoanApplicationSchema,
  createTransactionSchema,
  createEmployeeSchema,
  createJamaahSchema,
  createInventarisSchema,
} from "@/lib/validation";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("createDonationSchema", () => {
  it("valid donation passes", () => {
    const result = createDonationSchema.safeParse({
      mosque_id: validUuid,
      amount: 50000,
      akad_type: "zakat_mal",
    });
    expect(result.success).toBe(true);
  });

  it("rejects amount = 0", () => {
    const result = createDonationSchema.safeParse({
      mosque_id: validUuid,
      amount: 0,
      akad_type: "infaq",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = createDonationSchema.safeParse({
      mosque_id: validUuid,
      amount: -1000,
      akad_type: "sedekah",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid akad_type", () => {
    const result = createDonationSchema.safeParse({
      mosque_id: validUuid,
      amount: 50000,
      akad_type: "invalid_type",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty mosque_id", () => {
    const result = createDonationSchema.safeParse({
      mosque_id: "",
      amount: 50000,
      akad_type: "zakat_fitrah",
    });
    expect(result.success).toBe(false);
  });
});

describe("createMustahikSchema", () => {
  it("valid mustahik passes", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "Ahmad Test",
      nik: "1234567890123456",
      had_kifayah_score: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rejects NIK < 16 chars", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "Test",
      nik: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects NIK > 20 chars", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "Test",
      nik: "1".repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it("allows null NIK", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "Test",
      nik: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects had_kifayah_score < 0", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "Test",
      had_kifayah_score: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects had_kifayah_score > 100", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "Test",
      had_kifayah_score: 101,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name > 200 chars", () => {
    const result = createMustahikSchema.safeParse({
      mosque_id: validUuid,
      name: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("createLoanApplicationSchema", () => {
  it("valid application passes", () => {
    const result = createLoanApplicationSchema.safeParse({
      name: "Budi Santoso",
      phone: "08123456789",
      nik: "1234567890123456",
      home_status: "Milik Sendiri",
      business_name: "Warung Sembako",
      business_type: "Kuliner",
      business_age: "3 tahun",
      business_address: "Jl. Contoh No. 1",
      amount: 2000000,
      week_duration: 20,
      turnstileToken: "0.xxxxx",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short phone", () => {
    const result = createLoanApplicationSchema.safeParse({
      name: "Test",
      phone: "123",
      nik: "1234567890123456",
      home_status: "Sewa",
      business_name: "Toko",
      business_type: "Ritel",
      business_age: "1 tahun",
      business_address: "Jl. Test",
      amount: 500000,
      week_duration: 10,
      turnstileToken: "0.xxxxx",
    });
    expect(result.success).toBe(false);
  });

  it("rejects week_duration > 104", () => {
    const result = createLoanApplicationSchema.safeParse({
      name: "Test",
      phone: "08123456789",
      nik: "1234567890123456",
      home_status: "Sewa",
      business_name: "Toko",
      business_type: "Ritel",
      business_age: "1 tahun",
      business_address: "Jl. Test",
      amount: 500000,
      week_duration: 105,
      turnstileToken: "0.xxxxx",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty turnstileToken", () => {
    const result = createLoanApplicationSchema.safeParse({
      name: "Test",
      phone: "08123456789",
      nik: "1234567890123456",
      home_status: "Sewa",
      business_name: "Toko",
      business_type: "Ritel",
      business_age: "1 tahun",
      business_address: "Jl. Test",
      amount: 500000,
      week_duration: 10,
      turnstileToken: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTransactionSchema", () => {
  it("valid pemasukan passes", () => {
    const result = createTransactionSchema.safeParse({
      mosque_id: validUuid,
      type: "Pemasukan",
      category: "Infaq Jumat",
      amount: 150000,
      transaction_date: "2026-07-04",
    });
    expect(result.success).toBe(true);
  });

  it("valid pengeluaran passes", () => {
    const result = createTransactionSchema.safeParse({
      mosque_id: validUuid,
      type: "Pengeluaran",
      category: "Listrik",
      amount: 500000,
      transaction_date: "2026-07-04",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid type", () => {
    const result = createTransactionSchema.safeParse({
      mosque_id: validUuid,
      type: "Pendapatan",
      category: "Test",
      amount: 1000,
      transaction_date: "2026-07-04",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createTransactionSchema.safeParse({
      mosque_id: validUuid,
      type: "Pemasukan",
      category: "Test",
      amount: 1000,
      transaction_date: "04-07-2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects amount = 0", () => {
    const result = createTransactionSchema.safeParse({
      mosque_id: validUuid,
      type: "Pemasukan",
      category: "Test",
      amount: 0,
      transaction_date: "2026-07-04",
    });
    expect(result.success).toBe(false);
  });
});

describe("createEmployeeSchema", () => {
  it("valid employee passes", () => {
    const result = createEmployeeSchema.safeParse({
      mosque_id: validUuid,
      name: "Ali Imran",
      position: "Marbot",
      salary: 1500000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects salary = 0", () => {
    const result = createEmployeeSchema.safeParse({
      mosque_id: validUuid,
      name: "Test",
      salary: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("createJamaahSchema", () => {
  it("valid jamaah passes", () => {
    const result = createJamaahSchema.safeParse({
      mosque_id: validUuid,
      name: "Jamaah Test",
    });
    expect(result.success).toBe(true);
  });
});

describe("createInventarisSchema", () => {
  it("valid inventaris passes", () => {
    const result = createInventarisSchema.safeParse({
      mosque_id: validUuid,
      name: "Mikrofon",
      quantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects quantity = 0", () => {
    const result = createInventarisSchema.safeParse({
      mosque_id: validUuid,
      name: "Kursi",
      quantity: 0,
    });
    expect(result.success).toBe(false);
  });
});
