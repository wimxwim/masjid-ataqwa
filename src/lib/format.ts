"use client";

const nominalFmt = new Intl.NumberFormat("id-ID");

export function formatNominal(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return nominalFmt.format(Number(digits));
}
