import { createLogger } from "@/lib/logger";

const log = createLogger("turnstile");

/** Server-side verification token Turnstile Cloudflare. */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    log.error("TURNSTILE_SECRET_KEY tidak diisi — captcha verification SKIPPED (insecure)");
    throw new Error("Captcha verification unavailable — contact administrator");
  }

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
      },
    );
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    log.redacted("Verifikasi error", { error: String(err) });
    return false;
  }
}
