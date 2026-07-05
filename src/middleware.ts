export const runtime = "experimental-edge";

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function buildCsp(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
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
  const response = await updateSession(request);

  const requestId = request.headers.get("x-request-id") || globalThis.crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  const nonce = crypto.randomUUID();
  response.headers.set("Content-Security-Policy", buildCsp(nonce));

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
