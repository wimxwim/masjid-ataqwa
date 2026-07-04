import { db } from "@/db/client";
import { sql } from "drizzle-orm";

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const defaults: RateLimitConfig = {
  windowMs: 60_000,
  max: 60,
};

export async function rateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {},
): Promise<{ success: boolean; remaining: number }> {
  const { windowMs, max } = { ...defaults, ...config };
  const cutoff = new Date(Date.now() - windowMs).toISOString();

  try {
    await db.execute(
      sql`DELETE FROM rate_limits WHERE identifier = ${identifier} AND created_at < ${cutoff}::timestamptz`,
    );

    const [{ count }] = (await db.execute(
      sql`SELECT COUNT(*)::int as count FROM rate_limits WHERE identifier = ${identifier}`,
    )) as unknown as [{ count: number }];

    if (count >= max) {
      return { success: false, remaining: 0 };
    }

    await db.execute(
      sql`INSERT INTO rate_limits (identifier) VALUES (${identifier})`,
    );

    return { success: true, remaining: max - count - 1 };
  } catch {
    return { success: true, remaining: max };
  }
}
