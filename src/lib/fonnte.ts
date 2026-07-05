const FONNTE_API = "https://api.fonnte.com/send";

interface FonnteResponse {
  status: boolean;
  detail?: string;
  data?: { id: string };
}

/**
 * Send WhatsApp message via Fonnte API.
 * @param target - Phone number in international format (e.g. 62812xxxxxx)
 * @param message - Text message to send
 * @param schedule - 0 = send immediately, >0 = schedule in seconds
 */
export async function sendWA(params: {
  target: string;
  message: string;
  schedule?: number;
}): Promise<FonnteResponse> {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.warn("FONNTE_TOKEN tidak di-set — WA notification disabled");
    return { status: false, detail: "FONNTE_TOKEN tidak di-set" };
  }

  try {
    const res = await fetch(FONNTE_API, {
      method: "POST",
      headers: { Authorization: token },
      body: new URLSearchParams({
        target: params.target,
        message: params.message,
        schedule: String(params.schedule ?? 0),
      }),
    });

    if (!res.ok) {
      console.error("Fonnte API error:", res.status, res.statusText);
      return { status: false, detail: `HTTP ${res.status}` };
    }

    return res.json();
  } catch (err) {
    console.error("Fonnte network error:", err);
    return { status: false, detail: err instanceof Error ? err.message : "Network error" };
  }
}
