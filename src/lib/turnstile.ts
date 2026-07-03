/** Server-side verification token Turnstile Cloudflare. */
export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[TURNSTILE] TURNSTILE_SECRET_KEY tidak diisi — skip verifikasi");
    return true;
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
    console.error("[TURNSTILE] Verifikasi error:", err);
    return false;
  }
}
