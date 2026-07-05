import type { Metadata } from "next";

const SITE_URL = "https://masjid-ataqwa-ten.vercel.app";
const APP_NAME = "Masjid At-Taqwa Ulujami";
export const DEFAULT_DESCRIPTION =
  "Dari masjid kita tuntaskan kemiskinan. Program pemberdayaan mustahik: Kampung Quran, Bank Infaq, Wakaf Domba, dan Beasiswa Anak Asuh.";

export function buildMetadata(overrides: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
}): Metadata {
  const title = overrides.title ?? APP_NAME;
  const description = overrides.description ?? DEFAULT_DESCRIPTION;
  const url = overrides.path ? `${SITE_URL}${overrides.path}` : SITE_URL;
  const ogImage = overrides.ogImage ?? `${SITE_URL}/og-default.jpg`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
      locale: "id_ID",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify({ "@context": "https://schema.org", ...data });
}

export const MOSQUE_JSON_LD = {
  "@type": "Mosque",
  name: "Masjid Jami' At-Taqwa Ulujami",
  alternateName: "Masjid At-Taqwa",
  description: DEFAULT_DESCRIPTION,
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jl. Masjid At-Taqwa No. 1, RT 01/RW 05, Ulujami, Pesanggrahan",
    addressLocality: "Jakarta Selatan",
    addressRegion: "DKI Jakarta",
    postalCode: "12250",
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -6.2335,
    longitude: 106.7604,
  },
  telephone: ["+62217359876", "+6281299887766"],
  email: "info@masjidattaqwa-ulujami.or.id",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "08:00",
    closes: "17:00",
  },
};

export { SITE_URL, APP_NAME };
