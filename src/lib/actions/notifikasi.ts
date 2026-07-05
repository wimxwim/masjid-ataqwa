"use server";

import { sendWA } from "@/lib/fonnte";

const MOSQUE_CONTACT = "Hubungi kami: 0812-xxxx-xxxx";

/**
 * Notify donatur via WA after successful donation.
 * Called from Midtrans webhook handler or server action after payment confirmed.
 */
export async function notifyDonasi(
  donaturName: string,
  phone: string,
  nominal: number,
  program: string,
) {
  // Skip if no phone or invalid format
  if (!phone || !phone.startsWith("62")) {
    console.info("WA skipped — invalid phone format:", phone);
    return { status: false, detail: "Invalid phone format" };
  }

  const message = `Assalamualaikum wr wb, Kak ${donaturName} 🙏

Syukur Alhamdulillah, donasi Anda sebesar Rp ${nominal.toLocaleString("id-ID")} untuk program "${program}" telah kami terima.

Semoga Allah SWT menerima amal kebaikan dan melimpahkan keberkahan. Aamiin.

📲 Simpan bukti ini untuk kebutuhan pencatatan Anda.

— Masjid Jami' At-Taqwa Ulujami
📞 ${MOSQUE_CONTACT}`;

  return sendWA({ target: phone, message });
}

/**
 * Notify mustahik via WA after bantuan tersalurkan.
 */
export async function notifyBantuan(
  nama: string,
  phone: string,
  jenis: string,
  nominal: number,
) {
  if (!phone || !phone.startsWith("62")) {
    console.info("WA skipped — invalid phone format:", phone);
    return { status: false, detail: "Invalid phone format" };
  }

  const message = `Assalamualaikum wr wb, Kak ${nama} 🙏

Kami sampaikan bahwa bantuan ${jenis} sebesar Rp ${nominal.toLocaleString("id-ID")} telah tersalurkan kepada Bapak/Ibu.

Semoga bermanfaat dan menjadi keberkahan. Aamiin.

— Masjid Jami' At-Taqwa Ulujami
📞 ${MOSQUE_CONTACT}`;

  return sendWA({ target: phone, message });
}
