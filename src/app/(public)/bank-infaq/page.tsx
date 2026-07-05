export const dynamic = "force-dynamic";

import { getDefaultMosque, getPublicTestimonials } from "@/lib/actions/public";
import BankInfaqClient from "@/components/BankInfaqClient";

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
