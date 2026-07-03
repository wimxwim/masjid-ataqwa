import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { cache } from "react";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL tidak diset — periksa .env atau environment variables");
}

// FIX SERVERLESS 2026: Cloudflare Worker Error 1102 & 1101
// - JANGAN buat global TCP connection di Edge runtime
// - Gunakan cache() dari React agar koneksi di-isolate per-request
// - idle_timeout: 1 (detik) memaksa postgres mematikan TCP setelah request selesai
const getDb = cache(() => {
  const client = postgres(connectionString, { 
    prepare: false, 
    max: 1, // Batasi 1 worker = 1 koneksi
    idle_timeout: 1, // Matikan segera setelah nganggur 1 detik!
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
