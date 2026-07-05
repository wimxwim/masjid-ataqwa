import DonasiSekarang from "@/components/DonasiSekarang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donasi Sekarang — Masjid Jami' At-Taqwa Ulujami",
  description: "Salurkan zakat, infaq, dan sedekah untuk program pemberdayaan masjid. Satu langkah mudah untuk kebaikan yang luas.",
};

export default function DonasiPage() {
  return <DonasiSekarang />;
}
