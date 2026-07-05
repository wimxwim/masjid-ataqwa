export const dynamic = "force-dynamic";

import { getDefaultMosque, getPublicTestimonials } from "@/lib/actions/public";
import BankInfaqClient from "@/components/BankInfaqClient";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Bank Infaq Qardhul Hasan",
  description: "Pinjaman tanpa bunga untuk pemberdayaan ekonomi umat. Program Bank Infaq Qardhul Hasan Masjid Jami' At-Taqwa Ulujami.",
  path: "/bank-infaq",
});

export default async function BankInfaqRoute() {
  const mosque = await getDefaultMosque();
  if (!mosque) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <p>Masjid belum dikonfigurasi. Silakan hubungi administrator.</p>
      </div>
    );
  }

  const testimonials = await getPublicTestimonials(mosque.id);

  return (
    <BankInfaqClient
      mosqueName={mosque.name}
      testimonials={testimonials}
    />
  );
}
