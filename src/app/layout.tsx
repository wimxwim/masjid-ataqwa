import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nonce = await headers().then(h => h.get("x-nonce") ?? "");

  return (
      <html
        lang="id"
        className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          {nonce && <script nonce={nonce} dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
          }} />}
        </head>
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
