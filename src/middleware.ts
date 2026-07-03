export const runtime = "experimental-edge";

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const requestId = request.headers.get("x-request-id") || globalThis.crypto.randomUUID();
  response.headers.set("x-request-id", requestId);

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
