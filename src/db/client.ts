import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL tidak diset — periksa .env atau environment variables");
}

// FIX SERVERLESS 2026: Batasi pool agar tidak exhaust koneksi IPv6 Supabase
// max: 1 mencegah 1 worker memborong banyak TCP koneksi
// idle_timeout: 3 menutup koneksi agar worker tidak freeze saat suspended (Error 1101)
const client = postgres(connectionString, { 
  prepare: false, 
  max: 1,
  idle_timeout: 3,
  connect_timeout: 10
});
export const db = drizzle(client, { schema });
