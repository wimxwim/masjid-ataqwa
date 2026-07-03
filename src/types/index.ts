export interface Product {
  id: string;
  name: string;
  category: "coffee" | "bakery" | "retail";
  price: number;
  image: string;
  description: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Donation {
  id: string;
  tanggal: string;
  donatur: string;
  program: string;
  jumlah: number;
  status: "Berhasil" | "Diproses" | "Tertunda";
}

/** Mustahik dari database — langsung mapping ke `mustahiks` table. */
export interface MustahikDb {
  id: string;
  mosque_id: string;
  name: string;
  phone: string | null;
  nik_encrypted: string | null;
  nik_hash: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  desil_level: "1" | "2" | "3" | "4" | null;
  ring_number: number | null;
  monthly_income: number | null;
  dependents: number | null;
  usaha_type: string | null;
  health_insurance_id: string | null;
  is_active: boolean | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  // from 0007_mustahik_upgrade
  asnaf_id: string | null;
  sub_asnaf: string | null;
  had_kifayah_score: number | null;
  nomor_induk_mustahik: string | null;
  program_type: "zakat" | "infaq" | "qardhul_hasan" | "beasiswa" | "pemberdayaan" | null;
}

/** Mustahik (old — UI mock, dipertahankan untuk kompatibilitas DashboardPage & GisPage). */
export interface Mustahik {
  id: string;
  nama: string;
  alamat: string;
  telepon: string;
  desil: 1 | 2 | 3 | 4;
  ring: "Ring 1 (<=70m)" | "Ring 2 (<=140m)" | "Ring 3 (<=300m)" | "Ring 4 (>300m)";
  kategoriBantuan: "Bank Infaq" | "Zakat Maal" | "Beasiswa" | "Wakaf Domba";
  latitude: number;
  longitude: number;
  status: "Aktif" | "Baru" | "Tersalurkan";
}

/** Input untuk create/update mustahik. */
export interface MustahikInput {
  name: string;
  phone?: string;
  address: string;
  lat?: number;
  lng?: number;
  desil_level?: "1" | "2" | "3" | "4";
  ring_number?: number;
  monthly_income?: number;
  dependents?: number;
  usaha_type?: string;
  notes?: string;
  asnaf_id?: string;
  sub_asnaf?: string;
  had_kifayah_score?: number;
  nomor_induk_mustahik?: string;
  program_type?: "zakat" | "infaq" | "qardhul_hasan" | "beasiswa" | "pemberdayaan";
}

export interface LedgerEntry {
  id: string;
  tanggal: string;
  keterangan: string;
  tipe: "Pemasukan" | "Pengeluaran";
  kategori: string;
  jumlah: number;
  fund_type?: string;
  akad_type?: string;
}

export interface HeroStats {
  totalTerkumpul: number;
  totalMustahikKK: number;
  terbantuBulanIni: number;
  danaTersalurkan: number;
  affilasiAktif: number;
  produkTerjual: number;
  unitUsaha: number;
  profitKembaliUmat: number;
  penerimaManfaatJiwa: number;
  pendidikanAnak: number;
  umkmBina: number;
  totalSaldoKas: number;
  kenaikanSaldoPersen: number;
  totalPemasukan: number;
  totalPengeluaran: number;
}

export interface ProgramProgress {
  id: string;
  name: string;
  slug: string;
  icon: string;
  current: number;
  target: number;
  unit: string;
  penerima: number;
}

export interface Testimonial {
  id: string;
  nama: string;
  usia: number;
  title: string;
  story: string;
  ring: string;
  durasiBulan: number;
  image: string;
}

export interface ActivityEvent {
  id: string;
  type: "donation" | "zakat" | "bumm";
  nama: string;
  alamat: string;
  detail: string;
  jumlah: number;
  waktu: string;
}

export interface DonaturTetap {
  id: string;
  nama: string;
  telepon: string;
  alamat: string;
  komitmenBulanan: number;
  aliranDana: "Dana Operasional Masjid" | "Dana Program" | "Dana Unit Pemuda";
  programSpesifik?: string;
  frekuensi: "Bulanan" | "Pekan harian" | "Setiap Jumat";
  status: "Aktif" | "Tertunda" | "Baru";
  riwayatPenerimaan: { tanggal: string; jumlah: number; status: "Sukses" | "Tertunda" }[];
}

export interface Jamaah {
  id: string;
  nama: string;
  telepon: string;
  alamat: string;
  rtRw: string;
  peran: "Warga" | "Pengurus" | "REMISYA" | "Muzakki";
}

export interface JadwalImam {
  id: string;
  tanggal: string;
  hari: string;
  imamSubuh: string;
  imamMaghribIsya: string;
  khatibJumat: string;
}

export interface JadwalKajian {
  id: string;
  tanggal: string;
  ustadz: string;
  tema: string;
  waktu: string;
  peserta: "Umum" | "Remaja" | "Muslimah";
}

export interface Inventaris {
  id: string;
  namaBarang: string;
  jumlah: number;
  satuan: string;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat";
  asal: "Wakaf" | "Pembelian Kas";
}
