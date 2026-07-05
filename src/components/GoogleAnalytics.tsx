"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import Script from "next/script";

export interface GoogleAnalyticsProps {
  gaId: string;
  nonce?: string;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function gaPageView(gaId: string, pathname: string, search: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", gaId, {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title,
    page_search: search,
  });
}

function TrackPageView({ gaId, nonce }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    gaPageView(gaId, pathname, search ? `?${search}` : "");
  }, [gaId, pathname, searchParams]);

  return null;
}

export function GoogleAnalytics({ gaId, nonce }: GoogleAnalyticsProps) {
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
        nonce={nonce}
      />
      <Script
        id="google-analytics-init"
        strategy="lazyOnload"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          `,
        }}
      />
      <Suspense fallback={null}>
        <TrackPageView gaId={gaId} nonce={nonce} />
      </Suspense>
    </>
  );
}
