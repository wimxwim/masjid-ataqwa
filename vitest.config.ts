import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      NIK_ENCRYPTION_KEY: "test-key-32-bytes-1234567890abcd!",
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-key",
      TURNSTILE_SECRET_KEY: "test-key",
      MIDTRANS_SERVER_KEY: "test-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
