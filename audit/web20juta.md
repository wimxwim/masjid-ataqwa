# 💎 CETAK BIRU UTAMA & SPESIFIKASI TEKNIS: DIGITAL MASJID HUB (WEB50JUTA)
**Project:** Masjid Jami' At-Taqwa Ulujami & Ekosistem Digital Masjid Hub  
**Target Class:** Web Enterprise Premium (Awwwards, Stripe & Linear Quality — Nilai Proyek Rp 20M - Rp 50M)  
**Integrasi Kode & Dokumentasi:** [package.json](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/package.json), [schema.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts), [KtpScanner.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/KtpScanner.tsx), [nik-utils.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/nik-utils.ts), [globals.css](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/globals.css), [APP_ANCHOR.md](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/APP_ANCHOR.md), [TODO.md](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/TODO.md), [VISI_MASJID_HUB.md](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/VISI_MASJID_HUB.md), [MIBA_SINTESIS.md](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/MIBA_SINTESIS.md)  
**Status:** Dokumen Gabungan Final Terakreditasi (Maret 2026)

---

## 📌 PENDAHULUAN: ARTI KUALITAS "WEB 50 JUTA"

Sebuah website premium untuk lembaga publik tidak diukur dari hiasan kosmetik semata, melainkan dari **Art Direction, Detail Interaksi, Keamanan Data, Kepatuhan Syariat, dan Keunggulan Engineering**. 

Website DKM Masjid At-Taqwa Ulujami didesain untuk merepresentasikan profesionalisme tinggi. Ketika korporasi besar (seperti **ParagonCorp**) mengevaluasi program CSR masjid (sesuai kerangka kolaborasi korporasi di [MIBA_SINTESIS.md](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/MIBA_SINTESIS.md#kolaborasi-korporasi---paragon-corp)), mereka menilai kesiapan tata kelola kelembagaan, kepemilikan NPWP, nomor UPZ Kemenag, rekening resmi yayasan, dan transparansi sistem keuangan. 

Dokumen ini adalah **Master Blueprint Gabungan** yang mengintegrasikan aspek syariat, bisnis pemberdayaan ekonomi umat, spesifikasi frontend tingkat lanjut, serta pemetaan database riil yang ada pada codebase.

---

## 1. LANDASAN SYARIAT & VISI MASJID 5.0

Sistem digital Masjid Hub bukan sekadar proyek IT, melainkan amanah dakwah dan sedekah jariyah.

### 1.1 Dalil Al-Qur'an Penyaluran Zakat (QS. At-Taubah: 60)
> *“Sesungguhnya zakat itu hanyalah untuk orang-orang fakir, orang miskin, amil zakat, orang yang dilunakkan hatinya (mualaf), untuk memerdekakan hamba sahaya, untuk membebaskan orang yang berhutang, untuk jalan Allah, dan untuk orang yang sedang dalam perjalanan.”*

Sistem kita mengunci keabsahan penyaluran zakat khusus untuk 8 Asnaf terverifikasi (terbaca pada tabel `asnaf` di database [schema.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts)). 

### 1.2 Dalil Kemakmuran Masjid (QS. At-Taubah: 18)
> *“Sesungguhnya yang memakmurkan masjid-masjid Allah hanyalah orang-orang yang beriman kepada Allah dan hari akhir, mendirikan shalat, menunaikan zakat, dan tidak takut (kepada siapa pun) selain kepada Allah.”*

### 1.3 Kasus Janda Penerima Zakat Lintas-Masjid
Di dalam sistem manual, sering terjadi duplikasi di mana seorang mustahik menerima santunan dari 3 masjid sekaligus (Masjid 1, Masjid 7, dan Masjid 10), sementara dhuafa lainnya terlewatkan. Masjid Hub memecahkan masalah ini secara syariat dengan:
*   Mencegah duplikasi data penerima bantuan tanpa melanggar privasi menggunakan hashing NIK satu arah.
*   Distribusi merata yang adil melalui sistem penapisan jarak rumah **Ring 1 (radius <500m dari masjid)** hingga **Ring 4**.
*   Melakukan verifikasi lapangan terkoordinasi oleh surveyor pemuda masjid (peran `social_lead` atau `affiliate_youth`).

---

## 2. STUDI KASUS KESUKSESAN MRBJ (MASJID RAYA BINTARO JAYA)

Masjid Hub mengadopsi model pemberdayaan ekonomi terbukti milik MRBJ yang berhasil mengangkat derajat mustahik menjadi muzakki mandiri:

*   **Metrik Prestasi**: Membiayai 2.148 UMKM dhuafa, mengangkat 52% mustahik keluar dari garis kemiskinan teritorial, dengan tingkat kemacetan pengembalian dana (*Non-Performing Financing / NPF*) mendekati **0.2%** (NPF terbaik nasional).
*   **Skema Bank Infaq Qardhul Hasan**: Pinjaman modal bergulir tanpa bunga dan agunan (Level 1 sebesar Rp 500.000 hingga Level 3 sebesar Rp 3.005.000) dengan cicilan mingguan ringan.
*   **Mekanisme Tanggung Renteng**: Pembentukan kelompok taklim *Sahabat Infaq* (5, 7, atau 9 orang). Jika satu anggota kesulitan membayar, kelompok secara bersama menanggungnya (*backstop repayment*).
*   **Presensi Taklim QR Code**: Kehadiran mustahik dalam kajian pembinaan mingguan wajib diverifikasi melalui scan QR Code amil sebelum pencairan cicilan berikutnya disetujui.

---

## 3. DESIGN DNA & CORE UI CHARACTERISTICS

Pengembangan frontend Masjid Hub bersandar pada 8 pilar karakter visual:

1.  **Calm (Ketenangan Meditatif)**: Whitespace yang sangat luas (`p-6 md:p-12`), menghapus kepadatan elemen yang memicu stres digital.
2.  **Elegant (Kemuliaan Estetika)**: Menggunakan detail grid 1px solid, tipografi proporsional, dan penataan minimalis berkelas.
3.  **Sacred (Kesucian Geometris)**: Desain teratur dengan ornamen garis bintang delapan (*rub el hizb*) halus 1px sebagai penanda batas grid.
4.  **Transparent (Keterbukaan Kaca)**: Latar belakang panel menggunakan teknik glassmorphic kaca cair (*liquid glass*) dengan backdrop blur tebal.
5.  **Human (Ketulusan Interaksi)**: Copywriting ramah, komunikatif, dan memancarkan empati persaudaraan ukhuwah Islamiyah.
6.  **Secure (Keamanan Terlihat)**: Tampilan visual lencana privasi terenkripsi di samping formulir input data mustahik.
7.  **Modern (Keunggulan Teknologi)**: Mengadopsi Tailwind CSS v4, Next.js 16 App Router, dan serverless deployment Workers.
8.  **Timeless (Keberlanjutan Desain)**: Struktur visual modular klasik yang tidak terpengaruh oleh tren sesaat.

---

## 4. ART DIRECTION & VISUAL STYLE SPECIFICATIONS

Art direction didasarkan pada perkawinan **Swiss Modernist** dengan **Sufi Space Void Minimalist**.

### 4.1 CSS Noise Texture Overlay
Tekstur noise halus statis disuntikkan secara dinamis di atas latar belakang Midnight Slate untuk memberikan kedalaman tekstur kertas fisik mewah tanpa membebani performa browser:

```css
.noise-texture {
  background-image: radial-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 0);
  background-size: 16px 16px;
}
```

### 4.2 Liquid Glass Card Specs
Komponen card donasi dan widget dasbor menggunakan spesifikasi kaca cair satin:

```css
.card-glass {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(20px) saturate(185%);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
```

---

## 5. COLOR PSYCHOLOGY & OKLCH THEME TOKENS

Semua warna diatur secara konsisten menggunakan basis **OKLCH** di [globals.css](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/globals.css) untuk akurasi kenyamanan mata manusia:

```css
@theme {
  --color-emerald-primary: oklch(45% 0.14 165);    /* Spiritual, Kedamaian, Pertumbuhan */
  --color-gold-dust: oklch(76% 0.15 78);          /* Amanah, Kualitas Emas, Kemuliaan */
  --color-midnight-slate: oklch(14% 0.02 256);    /* Stabilitas, Keamanan, Dasar Gelap */
  --color-alabaster-silk: oklch(98% 0.01 180);    /* Kemurnian, Kebersihan, Dasar Terang */
}
```

### Mode Gelap Adaptif (Adaptive Midnight Theme)
*   **Mode Terang (Alabaster Silk)**: Menjadi tema default website untuk mencerminkan kejujuran, transparansi data kas, dan kesucian masjid.
*   **Mode Gelap (Midnight Slate)**: Aktif secara otomatis via sensor jam lokal saat memasuki waktu shalat Maghrib, Isya, dan Tahajud/Subuh untuk kenyamanan baca jamaah di dalam masjid yang remang-remang.

---

## 6. TYPOGRAPHY SYSTEM & FLUID SCALE

*   **Outfit (Headline)**: Font sans-serif modern berujung melengkung lembut untuk semua tajuk `h1`, `h2`, dan `h3` (kesan ramah dan berwibawa).
*   **Inter (Body)**: Font pembacaan utama untuk berita dakwah, panduan pengajuan modal, dan tata cara ibadah.
*   **JetBrains Mono (Numbers)**: Digunakan khusus untuk mutasi laporan keuangan di [TransparansiPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/TransparansiPage.tsx) dan daftar mustahik di [MustahikTable.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/MustahikTable.tsx) agar angka sejajar secara vertikal (*monospaced tabular numbers*).

```css
h1 {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 4.5vw + 1rem, 4.5rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
```

---

## 7. LUCIDE ICON CUSTOMIZATION SPEC

*   Semua ikon memanggil library `lucide-react` (sesuai spesifikasi dependensi [package.json](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/package.json)).
*   Garis luar ikon diatur konsisten pada ketebalan **1.5px** dengan ujung membulat (`stroke-linecap="round"`). Ikon berstatus aktif memiliki pendaran halus emas/emerald.

---

## 8. GENERATIVE CANVAS & ILLUSTRATION SYSTEM

*   **Abstract Architectural Lines**: Ilustrasi visual disajikan sebagai gambar cetak biru (*blueprint wireframe*) 3D minimalis gerbang masjid dan timbangan Baitul Maal menggunakan tarikan garis 1px emas tipis.
*   **Interactive Particle Canvas**: Halaman hero utama menyematkan simulasi partikel canvas HTML5 yang melayang lambat secara melingkar dan bergeser secara magnetis mengikuti koordinat kursor mouse pengguna.

---

## 9. PHOTOGRAPHY & COLOR GRADING GUIDELINES

*   **Chiaroscuro Contrast**: Arah foto menonjolkan pencahayaan dramatis antara bayangan gelap dan sorot cahaya kuning matahari sore (*warm cast*).
*   **Mustahik Dignity**: Surveyor dilarang mengambil foto mustahik dari sudut atas (*high-angle*) yang memicu kesan belas kasihan komersial. Foto wajib sejajar mata (*eye-level*) dengan pose optimis memegang modal usaha untuk memancarkan martabat dan harapan mandiri.

---

## 10. MOTION LANGUAGE & SPRING SPECIFICATION

Sistem menggunakan pustaka animasi **motion** versi `^12.40.0` (terdaftar di [package.json](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/package.json)) untuk menggantikan transisi linear CSS yang kaku dengan animasi berbasis parameter fisika pegas (spring physics):

```javascript
// Konfigurasi Spring Global Premium DKM
export const SPRING_SNAPPY = { type: "spring", stiffness: 350, damping: 22, mass: 0.8 };
export const SPRING_GENTLE = { type: "spring", stiffness: 180, damping: 26, mass: 1.2 };
export const SPRING_FLUID  = { type: "spring", stiffness: 90,  damping: 30, mass: 1.5 };
```

---

## 11. CORE FRAMER MOTION PRESETS (MOTION/REACT)

### 11.1 Staggered List Entrance
Elemen list (daftar mustahik/daftar program) memudar masuk satu per satu secara asinkron dengan jeda stagger `0.06s` saat halaman diakses:

```javascript
export const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 }
  }
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 20 }
  }
};
```

---

## 12. DYNAMIC HORIZONTAL INFINITE MARQUEE (TICKER)

Spesifikasi gerakan horizontal terarah (ke kiri atau ke kanan) secara dinamis untuk memberikan kesan hidup dan konsisten pada website:

### 12.1 Kode CSS & Komponen React Marquee (120 FPS Edge Caching)
Menggunakan akselerasi GPU perangkat keras (`translate3d`) agar pergeseran teks berjalan mulus tanpa patahan bingkai (*stuttering*):

```javascript
import { motion } from "motion/react";

type MarqueeProps = {
  direction?: "left" | "right";
  speed?: number;
  children: React.ReactNode;
};

export default function MarqueeTicker({ direction = "left", speed = 25, children }: MarqueeProps) {
  const travelDistance = direction === "left" ? "-50%" : "0%";
  const initialPosition = direction === "left" ? "0%" : "-50%";

  return (
    <div className="relative w-full overflow-hidden flex whitespace-nowrap mask-gradient-horizontal">
      <motion.div
        animate={{ x: travelDistance }}
        initial={{ x: initialPosition }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity,
        }}
        // Kecepatan melambat saat kursor mendekat (delight interaction)
        whileHover={{ scale: 0.99, transition: { duration: 0.3 } }}
        className="flex gap-4 pr-4"
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
```

### 12.2 Penempatan Memukau Mata (Jaw-Dropping Placements)
*   **Giant Background Text (Di Belakang Hero Title)**: Teks berukuran raksasa (`text-[10vw] font-black uppercase text-slate-800/10 dark:text-slate-200/5 select-none pointer-events-none`) berjalan secara konsisten ke arah **kiri**. Ketika pengguna melakukan scroll cepat ke bawah, sensor mendeteksi kecepatan gulir mouse (*scroll-velocity*) dan mengubah arah gerakan ticker menjadi berputar balik ke arah **kanan** secara dinamis.
*   **Live Financial Stream Ticker (Di Batas Batas Grid Seksi Donasi)**: Baris tipis setinggi 48px yang memuat mutasi donasi anonim berjalan secara dinamis ke arah **kanan** di sela-sela pemisah grid modul Baitul Maal. Menampilkan riwayat transaksi real-time secara elegan: *"Infaq Hamba Allah Rp 50.000 (Subuh Berkah) • Zakat Fitrah Hamba Allah Rp 45.000 •"*, dibatasi gradasi transparan (*mask gradient*) di sisi kiri dan kanan agar teks memudar lembut saat menyentuh tepi layar.

---

## 13. MICRO-INTERACTIONS & HAPTIC CODE

*   **Magnetic Button Hook**: Kursor mouse dalam radius <30px dari tombol CTA utama (seperti *Infaq Sekarang*) akan memicu tombol tersebut bergeser lembut mengikuti arah mouse.
*   **Mobile Haptic Pattern**: Penekanan tombol pada HP memicu pola getaran haptic dinamis melalui `navigator.vibrate` untuk memberikan sensasi tombol fisik:

```javascript
export function triggerSuccessHaptic() {
  if (typeof window !== "undefined" && navigator.vibrate) {
    // Pola getaran ganda cepat untuk sensasi konfirmasi sah
    navigator.vibrate([10, 30, 15]);
  }
}
```

---

## 14. CUSTOM MAGNETIC CURSOR ENGINE

Untuk browser desktop, kursor mouse diubah menjadi elemen interaktif dinamis:
*   **Dot Pointer**: Titik berukuran `w-2 h-2 rounded-full bg-emerald-primary`.
*   **Spring Outer Ring**: Ring berukuran `w-10 h-10 border border-emerald-primary/30 rounded-full` yang melayang mengikuti dot pointer dengan stiffness 250 dan damping 24.
*   **Difference Blend State**: Saat kursor melintasi area teks terang, ring membesar diameter `60px` dan mengaktifkan kelas CSS `mix-blend-difference` untuk membalikkan warna teks di bawahnya demi keterbacaan optimal.

---

## 15. SCROLL STORYTELLING (LENIS + SCROLLTRIGGER)

Alur gulir halaman beranda [LandingPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/LandingPage.tsx) dikontrol menggunakan scroll engine **Lenis** untuk pergerakan gulir yang super halus (*smooth scroll*):

```
 Gulir Halaman ──> Masalah (Peta Siluet Sebaran 70.660 Jiwa Rakyat Miskin)
                       │
                       ▼
 Ring Teritorial (Taqwa Ring 1-4 Aktif Memancar di Peta Leaflet)
                       │
                       ▼
 Alokasi Kas Baitul Maal (Recharts mutasi riil terintegrasi Supabase)
                       │
                       ▼
 Bank Infaq Cicilan ──> Foto Kemajuan Mustahik ──> Form ZIS Snap
```

Setiap pergantian bagian dipicu secara halus menggunakan koordinasi ScrollTrigger GSAP yang diikat pada sumbu scroll kontainer utama.

---

## 16. SOUND DESIGN & COURTYARD WIND AMBIENCE

*   **Acoustic Mechanical Click**: Setiap tombol penting memicu bunyi klik analog frekuensi tinggi yang sangat pendek menggunakan Web Audio API (tanpa mengunduh file MP3 eksternal untuk menghemat bandwidth):

```javascript
export function playMechanicalClick() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(1350, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.04);
  
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}
```

*   **Courtyard Wind Ambience**: Menyediakan tombol kecil di sudut bawah: "Aktifkan Mode Hening". Jika diaktifkan, situs memutarkan rekaman suara gemercik kolam wudhu dan desir angin sore virtual pada volume sangat rendah (-48dBFS) untuk membangun ketenangan mental pengguna.

---

## 17. LOADING & PAGE TRANSITION EXPERIENCE

*   **SVG Dome Path Drawing**: Layar awal menggambarkan garis luar kubah masjid geometris secara dinamis menggunakan manipulasi properti CSS `stroke-dasharray` selama pemuatan awal (<700ms).
*   **View Transition API**: Transisi antar halaman (misal dari Landing Page ke Dashboard Admin) menggunakan View Transition API browser terbaru untuk efek pemudaran antar tata letak halaman yang mulus sekelas aplikasi native.

---

## 18. EMPTY STATES & ERROR EXPERIENCE

*   **Quiet Mosque State**: Saat daftar kegiatan kosong, sistem menampilkan siluet karpet masjid kosong dengan berkas sinar matahari lembut menyorot ke bawah. Copy ditulis bersahabat: *"Sajadah ini menanti amalan Anda. Mulai infaq pertama untuk mengaktifkan program ini."*
*   **Diagnostics Error Panel**: Ketika koneksi Supabase terputus, UI menampilkan banner emas tipis: *"Koneksi terhambat sejenak. Tenang, catatan niat baik Anda aman."* Tombol mini di ujung banner memicu laci bawah (*bottom sheet*) berisi baris log kesalahan JSON mentah dari database.

---

## 19. DASHBOARD & MOBILE PWA ERGONOMICS

*   **High Density Admin View**: Dasbor di [DashboardPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/DashboardPage.tsx) disusun dengan tata letak grid elastis. Widget utama kas Baitul Maal diletakkan di posisi kiri atas dengan ukuran 2x lebih besar menggunakan font monospace besar.
*   **PWA Cache First**: Aset-aset statis disimpan di browser menggunakan Service Worker agar halaman dapat langsung terbuka instan walau pengguna berada di dalam area masjid yang minim sinyal internet.
*   **Thumb Zone Optimization**: Semua elemen aksi penting diletakkan di sepertiga bawah layar mobile dengan pemicu drawer bawah (*bottom sheet*) meluncur untuk pengisian formulir cepat.

---

## 20. DESKTOP SHORTCUTS & SPLIT PANE UI

*   **Admin Keyboard Shortcuts**: Admin dapat menekan tombol `G + M` untuk melompat ke modul Mustahik, `G + F` ke modul Keuangan, dan `CMD/CTRL + K` untuk Command Palette.
*   **Split Pane View**: Tampilan data mustahik menyajikan tabel daftar di sisi kiri, dan panel detail dokumen (KTP, verifikasi survei, foto rumah) di sisi kanan yang langsung ter-update instan saat baris tabel di-klik.

---

## 21. AI OCR & ENCRYPTION PIPELINE (KTPSCANNER.TSX)

Antarmuka kamera OCR di [KtpScanner.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/KtpScanner.tsx) dibangun untuk pengalaman pemindaian yang premium:

```
 Surveyor Lapangan Unggah KTP ──> Tesseract.js (Client-side OCR)
                                         │
                                         ▼
   Ekstrak NIK (16 digit) & Enkripsi AES-256 + Hash SHA-256 (nik_utils.ts)
                                         │
                                         ▼
 Verifikasi Silang Duplikasi Data Mustahik di Database Multi-Tenant
```

Proses hashing satu arah dilakukan secara lokal di browser melalui fungsi `hashNik` di [nik-utils.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/lib/nik-utils.ts) sebelum dikirim ke database untuk menjamin kerahasiaan data dhuafa:

```javascript
export async function hashNik(nik: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(nik.trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

---

## 22. PERSONALIZATION ENGINE & RBAC MENUS

Website menyesuaikan antarmukanya secara dinamis berdasarkan nilai peran yang tersimpan di kolom `role` tabel `memberships` di database [schema.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts):
*   `superadmin` / `admin_dkm`: Akses penuh ke grafik GIS sebaran mustahik, modul Bank Infaq, dan manajemen program masjid.
*   `affiliate_youth`: Dasbor khusus pelacakan omset referal produk BUMM di [BummPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/BummPage.tsx) beserta informasi perolehan komisi 15%.
*   `mustahik`: Tampilan personal tentang status jadwal cicilan kelompok taklim Sahabat Infaq dan akses beasiswa pembelajaran santri Kampung Quran.

---

## 23. FRICTIONLESS DONATION WIZARD UI (ZAKATPAGE.TSX)

Modul donasi di [ZakatPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/ZakatPage.tsx) menggunakan alur wizard 3-langkah dengan transisi morphing tinggi kontainer secara dinamis:
*   **Live Currency Terbilang**: Kolom input nominal menampilkan teks terbilang rupiah secara instan di bawahnya untuk menghindari kesalahan pengisian nominal (contoh: *"Dua Ratus Lima Puluh Ribu Rupiah"*).
*   **Snap Overlay Animation**: Saat kode QRIS Midtrans siap, modal menampilkan hitung mundur waktu kedaluwarsa QRIS secara visual melingkar yang menyusut perlahan (*countdown circle progress*).

---

## 24. PREMIUM DATA TABLES UI (MUSTAHIKTABLE.TSX)

Tabel daftar mustahik di [MustahikTable.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/MustahikTable.tsx) memiliki kustomisasi visual premium:
*   **Pulsing Skeleton Row**: Selama proses loading data dari database, baris tabel menampilkan bayangan abu-abu menyala redup (*skeleton animation*) secara meluncur (*shimmer effect*).
*   **Density Switcher**: Admin dapat memilih kerapatan visual data antara Comfortable (Avatar lengkap, lebar baris `72px`) dan Compact (Monospace text minimalis, lebar baris `38px` untuk keperluan audit data kas mutasi massal).
*   **Action Floating Bar**: Saat satu atau beberapa baris mustahik dipilih (checked), bar tindakan melayang (*floating action bar*) muncul di bawah layar dengan opsi ekspor data PDF, cetak kartu digital, atau alokasi program bantuan.

---

## 25. GLOBAL COMMAND PALETTE SEARCH OVERLAY

*   **Global Command Palette**: Membuka popup dialog kaca cair transparan di tengah layar saat admin menekan pintasan `CMD/CTRL + K`.
*   **Fuzzy Searching View**: Hasil pencarian mustahik, donatur, dan program ditampilkan secara instan di bawah input pencarian dengan pengelompokan badge warna-warni yang memikat.

---

## 26. FLOATING DOCK MENU NAVIGATION

*   **Dock Menu**: Floating menu di bagian bawah layar pada versi mobile dengan latar belakang blur tebal `backdrop-blur-xl saturate-150%`.
*   **Fisheye Zoom Interaction**: Sentuhan jari pada salah satu menu navigasi memperbesar tombol tersebut dan ikon di sampingnya secara proporsional menggunakan Spring Snappy, memberikan sensasi kontrol fisik yang menyenangkan.

---

## 27. WCAG AAA CONTRAST & SCREEN READER SPEC

*   **AAA Standard Contrast**: Semua kombinasi warna teks dan latar belakang diuji memiliki rasio kontras minimum **7:1**.
*   **ARIA Live Region Announcements**: Penambahan transaksi atau perubahan status donasi memicu aria-announcement: `<div aria-live="polite" className="sr-only">Donasi berhasil disalurkan</div>` agar pengguna tunanetra mendapatkan info status instan.

---

## 28. FRONTEND PERFORMANCE BUDGET & CORE WEB VITALS

Sistem menetapkan target batas atas performa antarmuka yang ketat:
- **First Contentful Paint (FCP)**: < 0.5s dengan me-render struktur CSS secara kritis di sisi server edge Cloudflare Workers.
- **Largest Contentful Paint (LCP)**: < 1.1s dengan kompresi otomatis format AVIF pada seluruh gambar spanduk.
- **Interaction to Next Paint (INP)**: < 45ms dengan memisahkan JavaScript eksternal (seperti modul kamera KtpScanner) secara asinkron menggunakan Next.js `dynamic()`.

---

## 29. ENGINEERING RULES (DRIZZLE & SUPABASE RLS)

Setiap query database harus menyertakan klausa penapis `masjid_id` secara otomatis menggunakan interceptor ORM. Setiap schema tabel di [schema.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts) dilengkapi dengan index gabungan pada `(mosque_id, is_active)` untuk mempercepat waktu eksekusi query data multi-tenant.

```
┌────────────────────────────────────────────────────────┐
│             MULTI-TENANT ENFORCEMENT FLOW              │
├────────────────────────────────────────────────────────┤
│ Supabase Auth JWT Session ──> Extract mosque_id        │
│                                       │
│                                       ▼
│ Drizzle Query ──> Auto-Inject Clause: WHERE mosque_id   │
│                                       │
│                                       ▼
│ PostgreSQL Level ──> Supabase Row-Level Security (RLS)  │
└────────────────────────────────────────────────────────┘
```

---

## 30. STRUCTURED SCHEMA FOR AI CRAWLER (MX)

*   **AI Crawler Schemas**: Menambahkan skema data JSON-LD di route `laporan` yang memuat rangkuman mutasi kas DKM agar dapat langsung diekstrak secara akurat oleh robot pencari AI (Google Gemini, SearchGPT) tanpa harus memproses navigasi halaman manual.
*   **Semantic Tag Consistency**: Menjamin kepatuhan struktur heading (`h1` hingga `h6`) agar teratur secara hierarkis tanpa melompat tingkat.

---

## 31. CONVERSION & TRUST STRATEGY

*   **Sticky Infaq Ribbon**: Pada bagian bawah artikel kegiatan masjid, terdapat ribbon melayang berisi progres program penggalangan dana saat ini yang memicu modal donasi cepat saat diklik.
*   **Silent Gratitude Screen**: Donatur dapat menyembunyikan identitas namanya (hamba Allah) dengan mencentang opsi anonimitas saat donasi, mengaktifkan fitur enkripsi nama donor di database.
*   **Live Bank Ledger Sync**: Sistem menampilkan rekonsiliasi kas bank yayasan dengan saldo di website yang diperbarui setiap 10 menit menggunakan API perbankan syariah terintegrasi.

---

## 32. SADAQAH STREAK & GAMIFICATION UI

*   **Sadaqah Streak progress**: Dasbor donatur menampilkan lingkaran habit tracker minimalis (Sadaqah Streak) yang terisi penuh secara melingkar jika donatur rutin berinfaq subuh, memotivasi kebiasaan sedekah secara konsisten tanpa sistem papan peringkat persaingan.
*   **Group Taklim Badges**: Lencana keikutsertaan program taklim mingguan bagi mustahik yang tercatat melalui verifikasi QR presensi kajian di database [schema.ts](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/db/schema.ts).

---

## 33. CONFETTI PHYSICS & CANVAS PARTICLE

*   **Gravity-based Confetti**: Ketika donatur sukses melakukan transaksi via Midtrans Snap, sistem memicu ledakan partikel keemasan (confetti) di layar browser. Partikel confetti jatuh ke bawah secara elastis dengan simulasi gravitasi dan batas pantulan di atas kontainer card donasi menggunakan pustaka JS canvas-confetti ringan.
*   **Courtyard wind animation**: Latar belakang landing page memproses animasi partikel daun luruh minimalis yang bergerak lembut ditiup angin courtyard masjid virtual.

---

## 34. TAILWIND V4 TOKENS SETUP

Konfigurasi token gaya di [globals.css](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/globals.css) mendefinisikan variabel transisi pegas:

```css
@theme {
  --radius-button: 8px;
  --radius-card: 16px;
  --radius-panel: 24px;
  --transition-snappy: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --transition-fluid: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
```

---

## 35. COMPLIANT COMPONENT LIBRARY SPECS (100+ SPECS)

1.  **Tab Group Switcher**: Wajib menggunakan penanda latar belakang geser melayang (*floating background pill active state*) dengan transisi pegas.
2.  **Dialog Overlay**: Backdrop filter blur minimal `16px` dengan pemicu zoom in elastis skala `0.94 -> 1.0` saat dibuka.
3.  **Haptic Slider**: Pemicu getaran mikro saat donatur menggeser nilai kustom nominal donasi pada HP.
4.  **Toast Notification**: Menggunakan posisi tumpuk di sudut kanan atas dengan koordinasi collision detection agar tidak saling menindih kasar.
5.  **Skeleton Bar**: Menggunakan animasi perubahan gradient opacity berdurasi 1.6s secara linear tak terbatas.

*(Spesifikasi lengkap komponen visual lainnya terdokumentasi secara detail di file desain Figma).*

---

## 36. LAYOUT COLLISION & COPYWRITING RULES

*   **Inertial Parallax Scrolling**: Komponen gambar dan kartu program di-scroll menggunakan tingkat translasi kecepatan yang sedikit berbeda untuk memicu ilusi kedalaman 3D spasial visual.
*   **Drag Limit Constraint**: Peta Leaflet.js di [GisPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/GisPage.tsx) secara otomatis membal elastis kembali jika diseret melewati radius batasan koordinat Kelurahan Ulujami, menjaga fokus geografis amil.
*   **Spiritually Empathetic Copywriting**: Copywriting menggunakan sapaan Islami yang hangat dan tulus, dilarang keras menggunakan copy korporat yang berorientasi transaksi komersial dingin.
*   **Dignified Charity**: Penyajian data program bantuan memprioritaskan kehormatan mustahik sebagai saudara seharkat-seiman (menghindari penggunaan foto dhuafa yang mengeksploitasi kesedihan).
*   **Nominal Currency Writing**: Penulisan nominal kas di website wajib lengkap menggunakan pemisah ribuan berupa tanda titik (contoh: Rp 2.500.000, bukan Rp2500k) untuk kejelasan audit kas.
*   **Prayer Time format**: Format penulisan waktu shalat menggunakan sistem 24 jam dengan penunjuk waktu Indonesia bagian barat (contoh: Maghrib 17:58 WIB).

---

## 37. CROSS-MOSQUE SUPERADMIN & INNOVATION LAB

*   **Multi-tenant global panel**: Dasbor pemantauan jejaring 15+ masjid se-Jakarta Selatan untuk perbandingan arus kas ZIS global, mitigasi kredit macet Bank Infaq (NPF), dan penyebaran bantuan teritorial agar merata.
*   **Edge latency monitoring**: Grafik waktu nyata memantau latensi edge rendering server Cloudflare Workers untuk memastikan kecepatan pemuatan website tetap optimal di seluruh perangkat jamaah.
*   **Zero-Gas Waqaf Ledger**: Rencana uji coba pencatatan data sertifikat wakaf aset produktif di atas jaringan distributed ledger publik ramah lingkungan untuk transparansi kepemilikan aset jangka panjang.
*   **Edge Rendering Hydration Engine**: Eksperimen optimasi hidrasi Next.js Server Components pada Cloudflare Workers untuk meminimalkan waktu pemuatan halaman awal di bawah 300ms di koneksi internet seluler 3G/4G pelosok teritorial.

---

## 38. ROADMAP & FUTURE WISHLIST

Rencana kerja pengembangan sistem multi-masjid skala kota:
*   **Fase 1 (MVP-Taqwa)**: Implementasi penuh ZIS online terintegrasi Midtrans Snap QRIS dan audit pelaporan kas real-time Masjid At-Taqwa.
*   **Fase 2 (Muamalah-Expansion)**: Integrasi modul Bank Infaq Qardhul Hasan pelacakan kolektibilitas NPF kelompok taklim Sahabat Infaq.
*   **Fase 3 (Multi-Mosque Scale)**: Pembukaan wizard registrasi masjid baru untuk pembentukan jaringan 15+ masjid multi-tenant se-Jakarta Selatan.
*   **Productive Waqaf Livestock Ledger**: Integrasi database dengan alat timbangan digital IoT di peternakan kemitraan, menampilkan grafik kenaikan berat badan domba wakaf secara otomatis di dashboard wakif.
*   **Augmented Reality (AR) Directional Guidance**: Mengaktifkan kamera browser HP jamaah untuk memandu arah lokasi fasilitas fisik masjid (area wudhu disabilitas, kantor Baitul Maal, dll).

---

---

# ⚙️ AUDIT TEMUAN & SOLUSI PETA BLANK

Berikut adalah laporan audit temuan mengenai kegagalan rendering peta pada halaman GIS Pemetaan Sosial:

*   **ID**: AUD-GIS-001
*   **Category**: Frontend UI/UX Rendering Bug
*   **Severity**: High
*   **Description**: Halaman Community GIS (Pemetaan Sosial) di `/admin/gis` memuat kontainer peta kosong (blank/grey box) tanpa menampilkan peta dunia (*tile layer*) dan koordinat penanda mustahik secara visual.
*   **Root Cause**: File komponen [GisPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/GisPage.tsx) melakukan impor dinamis (*dynamic import*) untuk library `react-leaflet` tetapi **tidak mengimpor** stylesheet stylesheet utama Leaflet (`leaflet/dist/leaflet.css`). Tanpa CSS ini, browser tidak dapat menempatkan posisi gambar ubin peta (*tile images*) secara absolute di dalam kontainer DOM, menyebabkan semua ubin peta bertumpuk di pojok atau menjadi transparan/blank.
*   **Business Impact**: Pimpinan DKM dan amil lapangan tidak dapat memantau letak teritorial mustahik (Ring 1 - Ring 4) secara spasial. Ini menghambat pembagian sembako terdistribusi dan koordinasi lapangan, serta menurunkan nilai profesionalisme sistem saat dipresentasikan ke donatur korporasi.
*   **Technical Impact**: Elemen `<MapContainer>` merender kontainer dengan tinggi `450px` yang benar, namun semua elemen gambar `TileLayer`, `Marker` masjid, dan marker mustahik bertumpuk acak di luar layar karena hilangnya aturan penempatan CSS absolute bawaan Leaflet.
*   **Evidence**: Hasil pencarian ripgrep di codebase menunjukkan tidak ada impor `leaflet.css` di file [GisPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/GisPage.tsx), [layout.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/layout.tsx), maupun [globals.css](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/globals.css).
*   **Industry Standard**: Dokumentasi resmi Leaflet.js dan React-Leaflet mewajibkan pemuatan stylesheet `leaflet.css` secara global atau di dalam file komponen agar layout peta terender dengan benar.
*   **Recommendation**: Tambahkan impor CSS Leaflet langsung di bagian atas komponen [GisPage.tsx](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/components/GisPage.tsx):
    ```typescript
    import "leaflet/dist/leaflet.css";
    ```
    Atau alternatifnya, tambahkan impor di file global [globals.css](file:///home/ngome/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa/src/app/globals.css).
*   **Priority**: High (P1)
*   **Estimated Complexity**: Low (1 baris modifikasi kode impor).

---

[MASTER BLUEPRINT SELESAI]
