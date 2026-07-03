import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { cache } from "react";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL tidak diset — periksa .env atau environment variables");
}

// FIX SERVERLESS: Vercel / Node.js
// Menggunakan cache() dari React agar instance DB dibuat 1x per request lifecycle.
// max: 1 mencegah Vercel Serverless Function membuka terlalu banyak koneksi paralel per-instance.
const getDb = cache(() => {
  const client = postgres(connectionString, { 
    prepare: false, 
    max: 1, 
    idle_timeout: 3, 
    connect_timeout: 10
  });
  return drizzle(client, { schema });
});

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(target, prop: keyof ReturnType<typeof getDb>) {
    return getDb()[prop];
  }
});
