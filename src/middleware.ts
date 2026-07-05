import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com https://challenges.cloudflare.com`,
    `style-src 'self' 'unsafe-inline' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.aladhan.com https://challenges.cloudflare.com https://*.tile.openstreetmap.org",
    "frame-src 'self' https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  let response: NextResponse;

  if (isProtected) {
    response = await updateSession(request);
  } else {
    response = NextResponse.next();
  }

  const nonce = generateNonce();
  const requestId = request.headers.get("x-request-id") || globalThis.crypto.randomUUID();

  response.headers.set("x-request-id", requestId);
  response.headers.set("x-nonce", nonce);
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/api/:path*",
    "/",
    "/donasi/:path*",
    "/laporan/:path*",
    "/bank-infaq/:path*",
    "/payment/:path*",
    "/kebijakan-privasi",
    "/syarat-ketentuan",
  ],
};
