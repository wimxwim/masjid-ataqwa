import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.NIK_ENCRYPTION_KEY;
  if (!raw) throw new Error("NIK_ENCRYPTION_KEY tidak diisi di .env");
  return crypto.scryptSync(raw, "nik-salt", 32);
}

/** Encrypt NIK dengan AES-256-GCM. Return base64( iv + ciphertext + tag ). */
export function encryptNik(nik: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(nik, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64");
}

/** Decrypt NIK dari format base64( iv + ciphertext + tag ). */
export function decryptNik(encoded: string): string {
  const key = getKey();
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(buf.length - TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH, buf.length - TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(ciphertext) + decipher.final("utf8");
}

/** SHA-256 hash NIK untuk dedup. */
export function hashNikServer(nik: string): string {
  return crypto.createHash("sha256").update(nik.trim()).digest("hex");
}
