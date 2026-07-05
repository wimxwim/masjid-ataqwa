export const AKAD_LABEL: Record<string, string> = {
  zakat_fitrah: "Zakat Fitrah",
  zakat_mal: "Zakat Maal",
  infaq: "Infaq / Sedekah",
  sedekah: "Infaq / Sedekah",
  wakaf: "Wakaf",
  fidyah: "Fidyah",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  contacted: "Telah Dikontak",
  paid: "Lunas",
  failed: "Gagal",
  refunded: "Dikembalikan",
  approved: "Disetujui",
  rejected: "Ditolak",
  disbursed: "Telah Disalurkan",
  active: "Aktif",
  inactive: "Tidak Aktif",
};

export const MUZZAKI_TYPE_LABEL: Record<string, string> = {
  perseorangan: "Perseorangan",
  perusahaan: "Perusahaan",
  lembaga: "Lembaga",
  other: "Lainnya",
};

export const ZAKAT_TYPE_LABEL: Record<string, string> = {
  zakat_fitrah: "Zakat Fitrah",
  zakat_maal: "Zakat Maal",
};

export const ZISWAF_TYPE_LABEL: Record<string, string> = {
  zakat: "Zakat",
  infaq: "Infaq",
  sedekah: "Sedekah",
  wakaf: "Wakaf",
  qardhul_hasan: "Qardhul Hasan",
  beasiswa: "Beasiswa",
  bantuan_sembako: "Bantuan Sembako",
  bantuan_kesehatan: "Bantuan Kesehatan",
  other: "Lainnya",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  qris: "QRIS",
  transfer: "Transfer BSI",
  tunai: "Tunai",
  kitabisa: "Kitabisa",
};

export function label(val: string | null | undefined, map: Record<string, string>): string {
  if (!val) return "—";
  return map[val] ?? val;
}
