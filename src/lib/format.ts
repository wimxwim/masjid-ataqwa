"use client";

export function formatNominal(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

export function stripFormatting(value: string): string {
  return value.replace(/\./g, "");
}
