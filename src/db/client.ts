import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// FIX SERVERLESS 2026: Cloudflare Worker Error 1102 & 1101
// Menggunakan Cloudflare Hyperdrive untuk pooling native C++ (bypass JS CPU limit)
const getDb = cache(() => {
  let connectionString = process.env.DATABASE_URL;

  try {
    const ctx = getCloudflareContext();
    if (ctx?.env?.HYPERDRIVE?.connectionString) {
      connectionString = ctx.env.HYPERDRIVE.connectionString;
    }
  } catch (e) {
    // Abaikan jika tidak di runtime Cloudflare
  }

  if (!connectionString) {
    throw new Error("DATABASE_URL tidak diset — periksa .env atau environment variables");
  }

  const client = postgres(connectionString, { 
    prepare: false, 
    max: 1, 
    idle_timeout: 1, 
    connect_timeout: 5
  });
  return drizzle(client, { schema });
});

// Proxy agar semua import { db } tidak perlu diubah, tapi diam-diam memanggil getDb() yang di-cache
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(target, prop: keyof ReturnType<typeof getDb>) {
    return getDb()[prop];
  }
});
