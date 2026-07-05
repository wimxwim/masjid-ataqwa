/** Hash NIK dengan SHA-256 (client-side) — untuk dedup tanpa kirim NIK mentah. */
export async function hashNik(nik: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(nik.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Ekstrak NIK dari hasil OCR KTP — cari 16 digit berurutan. */
export function extractNikFromOcr(text: string): string | null {
  const match = text.replace(/\s/g, "").match(/\d{16}/);
  return match?.[0] ?? null;
}

/** Ekstrak nama dari hasil OCR KTP — cari baris setelah "Nama" / "NAME". */
export function extractNameFromOcr(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const namaIdx = lines.findIndex(
    (l) => /^nama$/i.test(l) || /^nama\s/i.test(l)
  );
  if (namaIdx >= 0 && namaIdx + 1 < lines.length) {
    const nextLine = lines[namaIdx + 1];
    if (nextLine) {
      const name = nextLine.replace(/[^A-Za-z\s.]/g, "").trim();
      if (name.length > 2) return name;
    }
  }
  return null;
}

/** Ekstrak alamat dari hasil OCR KTP — cari baris setelah "Alamat" / "Address". */
export function extractAddressFromOcr(text: string): string | null {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const alamatIdx = lines.findIndex(
    (l) => /^alamat$/i.test(l) || /^alamat\s/i.test(l)
  );
  if (alamatIdx >= 0 && alamatIdx + 1 < lines.length) {
    return lines[alamatIdx + 1] ?? null;
  }
  return null;
}
