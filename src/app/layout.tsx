import type { Metadata, Viewport } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppProvider } from "@/stores/app-context";
import { QueryProvider } from "@/lib/providers/query-provider";
import GlobalOverlays from "@/components/GlobalOverlays";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const APP_NAME = "Masjid At-Taqwa Ulujami";
const APP_DESCRIPTION =
  "Dari masjid kita tuntaskan kemiskinan. Program pemberdayaan mustahik: Kampung Quran, Bank Infaq, Wakaf Domba, dan Beasiswa Anak Asuh.";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: APP_NAME },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink font-sans flex flex-col">
        <AppProvider>
          <QueryProvider>
            {children}
            <GlobalOverlays />
          </QueryProvider>
        </AppProvider>
      </body>
    </html>
  );
}
