import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Full Rupiah: Rp 20.715.000 */
export function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}
