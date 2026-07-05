let snapPromise: Promise<void> | null = null;

function getSnapUrl() {
  return "https://app.sandbox.midtrans.com/snap/snap.js";
}

function getClientKey() {
  return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
}

export function loadSnapScript(): Promise<void> {
  if (snapPromise) return snapPromise;

  snapPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (typeof window.snap !== "undefined") {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = getSnapUrl();
    script.setAttribute("data-client-key", getClientKey());
    script.onload = () => resolve();
    script.onerror = () => {
      snapPromise = null;
      reject(new Error("Gagal memuat gerbang pembayaran"));
    };
    document.head.appendChild(script);
  });

  return snapPromise;
}

export function snapPay(
  token: string,
  callbacks: {
    onSuccess: () => void;
    onPending: () => void;
    onError: () => void;
    onClose: () => void;
  },
) {
  if (typeof window.snap === "undefined") {
    callbacks.onError();
    return;
  }

  window.snap.pay(token, {
    onSuccess: callbacks.onSuccess,
    onPending: callbacks.onPending,
    onError: callbacks.onError,
    onClose: callbacks.onClose,
  });
}
