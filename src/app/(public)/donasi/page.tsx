import DonasiSekarang from "@/components/DonasiSekarang";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Donasi Sekarang — Masjid Jami' At-Taqwa Ulujami",
  description: "Salurkan zakat, infaq, dan sedekah untuk program pemberdayaan masjid. Satu langkah mudah untuk kebaikan yang luas.",
  path: "/donasi",
});

export default function DonasiPage() {
  return <DonasiSekarang />;
}
