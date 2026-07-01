# FIQIH & REGULASI BENDAHARA MASJID — Acuan Pengembangan Masjid Hub

> Dokumen ini adalah riset komprehensif tentang hukum Islam, standar akuntansi syariah, dan regulasi Indonesia
> yang mengatur pengelolaan keuangan masjid. Digunakan sebagai acuan fitur bendahara di Masjid Hub.
> **Sumber:** Jurnal ilmiah, Fatwa DSN-MUI, PSAK 109, UU RI, kitab fiqih muamalah, artikel ulama kontemporer.

---

## DAFTAR ISI

1. [KLASIFIKASI AKAD DALAM KEUANGAN MASJID](#1-klasifikasi-akad)
2. [HUKUM MENCAMPUR DANA: ZAKAT, INFAQ, SEDEKAH, WAKAF](#2-hukum-mencampur-dana)
3. [PSAK 109 — STANDAR AKUNTANSI ZIS](#3-psak-109)
4. [FATWA DSN-MUI TERKAIT](#4-fatwa-dsn-mui)
5. [REGULASI INDONESIA](#5-regulasi-indonesia)
6. [LARANGAN SYAR'I: MEMINJAM KAS MASJID](#6-larangan-meminjam-kas-masjid)
7. [KONSEP DANA ABADI MASJID](#7-dana-abadi-masjid)
8. [IMPLIKASI KE FITUR MASJID HUB](#8-implikasi-ke-fitur)
9. [DAFTAR PUSTAKA](#9-daftar-pustaka)

---

## 1. KLASIFIKASI AKAD

Dalam fiqih muamalah, dana yang masuk ke masjid berasal dari akad yang berbeda-beda. Masing-masing punya konsekuensi hukum yang berbeda dalam pencatatan, penyaluran, dan pelaporan.

### 1.1 Zakat

| Aspek | Keterangan |
|-------|-----------|
| **Hukum** | **Wajib** (Rukun Islam ke-4) |
| **Dalil** | QS. At-Taubah: 60, 103; QS. Al-Baqarah: 267; Hadits riwayat Bukhari-Muslim |
| **Syarat** | Nisab (batas minimal harta), Haul (mencapai 1 tahun kepemilikan) |
| **Jenis** | Zakat Fitrah (jiwa) + Zakat Maal (harta) |
| **Penerima (Mustahiq)** | **8 golongan tetap** (QS. At-Taubah: 60): Fakir, Miskin, Amil, Muallaf, Riqab (budak), Gharim (berutang), Fi Sabilillah, Ibnu Sabil |
| **Akad** | **Tamlik** (pemindahan kepemilikan) — wajib ada niat dan serah-terima |
| **Waktu penyaluran** | Fauriyah (sesegera mungkin) — tidak boleh ditunda tanpa uzur syar'i |
| **Sifat dana** | Konsumtif (habis pakai) atau produktif (Fatwa MUI No. 4/2003 dengan syarat ketat) |

**Implikasi sistem:**
- Dana zakat WAJIB dipisah pencatatannya dari dana lain
- Tidak boleh dicampur dengan dana infaq/sedekah/wakaf di rekening yang sama
- Penyaluran hanya untuk 8 asnaf
- Laporan zakat harus bisa diaudit per mustahiq

### 1.2 Infaq

| Aspek | Keterangan |
|-------|-----------|
| **Hukum** | **Sunah** (tidak wajib seperti zakat) |
| **Dalil** | QS. Al-Baqarah: 261; QS. Ali Imran: 134 |
| **Syarat** | Tidak ada nisab, tidak ada haul, tidak ada batasan jumlah |
| **Penerima** | Fleksibel (tidak terbatas 8 asnaf) — bisa untuk operasional masjid, pembangunan, kegiatan sosial |
| **Akad** | **Tabarru'** (hibah/sumbangan sukarela) — tidak ada imbalan duniawi |
| **Sifat dana** | Bisa konsumtif, bisa untuk modal kegiatan |

**Implikasi sistem:**
- Infaq bisa digunakan untuk operasional masjid (listrik, air, gaji marbot, dll)
- Tidak perlu nisab/hitungan khusus
- Pencatatan per kategori penggunaan tetap penting

### 1.3 Sedekah

| Aspek | Keterangan |
|-------|-----------|
| **Hukum** | **Sunah** (sangat dianjurkan) |
| **Dalil** | QS. Al-Baqarah: 261, 264; Hadits "sedekah memadamkan dosa" |
| **Cakupan** | Lebih luas dari infaq — tidak terbatas harta, bisa jasa, senyum, ilmu |
| **Penerima** | Fleksibel — siapa saja yang membutuhkan |
| **Akad** | **Tabarru'** (sama dengan infaq) |

**Catatan:** Dalam PSAK 109, infaq dan sedekah diperlakukan sama dalam pencatatan akuntansi.

### 1.4 Wakaf

| Aspek | Keterangan |
|-------|-----------|
| **Hukum** | **Sunah** (tapi punya aturan sangat ketat) |
| **Dalil** | QS. Ali Imran: 92; Hadits riwayat Muslim tentang wakaf Umar bin Khattab |
| **Prinsip inti** | Pokok (ashl) ditahan, manfaat (tsamarah) disalurkan |
| **Rukun wakaf** | Wakif (pemberi), Mauquf 'alaih (penerima manfaat), Mauquf (harta), Shighat (ikrar wakaf), Nazhir (pengelola) |
| **Sifat dana** | **Abadi** — pokok tidak boleh berkurang, hanya hasilnya boleh digunakan |
| **Nazhir** | Wajib profesional dan amanah — kalau salah kelola wajib dhaman (ganti rugi) |
| **Regulasi** | UU No. 41/2004 tentang Wakaf, PP No. 42/2006, Peraturan BWI |

**Pembagian wakaf dari sisi peruntukan:**
1. **Wakaf Mutlak (al-waqfu muthlaq)** — hasilnya untuk kemaslahatan masjid secara umum. Contoh: uang kotak infaq yang tidak disebutkan khusus.
2. **Wakaf untuk Kemaslahatan Masjid (al-waqfu li mashalih al-masjid)** — ditentukan khusus oleh wakif. Contoh: wakaf genteng, wakaf karpet, wakaf untuk pembangunan.

**Hukum kritis (Al-Qalyubi, Hasyiyah 'ala al-Mahalli):**
> "Wakaf mutlak tidak boleh digunakan untuk menghias masjid atau ukiran. Juga tidak boleh digunakan untuk lampu yang tidak ada manfaat penting. Surplus wakaf mutlak TIDAK BOLEH dipakai menutup defisit wakaf kemaslahatan masjid — dan sebaliknya."

> "Jika surplus pada wakaf mutlak atau wakaf kemaslahatan masjid, surplus itu disimpan untuk imarah masjid. Nazhir boleh mengelola dana surplus untuk menambah nilai manfaat. Imarah kebun (aset tak bergerak) lebih didahulukan dari imarah masjid."

**Implikasi sistem:**
- Dana wakaf HARUS tercatat terpisah total dari ZIS
- Pokok wakaf tidak boleh dimasukkan ke laporan penggunaan dana (hanya hasilnya)
- Jika dana wakaf produktif (wakaf uang, wakaf saham), hasilnya saja yang digunakan
- Pelaporan wakaf punya format khusus (neraca wakaf, laporan perubahan aset kelolaan)
- Setiap transaksi wakaf butuh dokumentasi ikrar wakaf

### 1.5 Fidyah

| Aspek | Keterangan |
|-------|-----------|
| **Hukum** | **Wajib** (pengganti puasa yang tidak bisa diqadha) |
| **Penerima** | Miskin/fakir |
| **Takaran** | 1 mud (0,6 kg) per hari puasa yang ditinggalkan |
| **Sifat** | Sama seperti zakat — wajib tamlik |

### 1.6 Qardhul Hasan

| Aspek | Keterangan |
|-------|-----------|
| **Hukum** | **Sunah** — pinjaman tanpa bunga, tanpa imbalan |
| **Sumber dana** | Bisa dari infaq/sedekah, atau dana zakat (Fatwa Ijtima' Ulama 2021 dengan syarat) |
| **Penerima** | Mustahiq yang membutuhkan modal usaha |
| **Pengembalian** | Harus dikembalikan sesuai nominal, digulirkan ke mustahiq lain |
| **Akad** | Qardh (utang-piutang) — bukan tamlik |

---

## 2. HUKUM MENCAMPUR DANA

### 2.1 Prinsip Dasar

**ZAKAT TIDAK BOLEH DICAMPUR DENGAN INFAQ/SEDEKAH/WAKAF.**

Ini prinsip mutlak dalam fiqih dan PSAK 109. Alasannya:

1. **Zakat** punya hukum wajib, penerima tetap (8 asnaf), ada nisab dan haul
2. **Infaq/Sedekah** hukum sunah, penerima fleksibel, tidak ada nisab
3. **Wakaf** punya sifat abadi, dikelola dulu baru disalurkan manfaatnya

Kalau dicampur, mustahiq zakat (8 asnaf) tidak bisa dipastikan mendapat haknya, dan akad zakat yang mensyaratkan tamlik (pemindahan kepemilikan) jadi tidak jelas.

### 2.2 Pendapat Ulama

Al-Qalyubi (w. 1070 H) menegaskan:
- Surplus wakaf mutlak tidak boleh dipakai menutup defisit wakaf li mashalih al-masjid
- Begitu pula sebaliknya
- Kewajiban nazhir: simpan surplus, beli aset tak bergerak dengan sisa dana

### 2.3 PSAK 109

PSAK 109 mewajibkan penyajian **terpisah** untuk:
1. Laporan posisi keuangan (neraca): Dana Zakat, Dana Infaq/Sedekah, Dana Amil, Dana Nonhalal
2. Laporan perubahan dana (masing-masing)
3. Laporan perubahan aset kelolaan
4. Laporan arus kas
5. Catatan atas laporan keuangan

### 2.4 Pengecualian — Infaq & Sedekah

Dalam PSAK 109, infaq dan sedekah BOLEH dicatat dalam satu kelompok karena sifatnya sama:
- Sama-sama tabarru' (sukarela)
- Sama-sama tidak terikat nisab/waktu
- Sama-sama penerima fleksibel

**Praktik umum di Indonesia:** Dana ZIS dipisah menjadi 3 kolom: Zakat, Infak/Sedekah, dan Dana Amil (dana untuk operasional pengelola).

---

## 3. PSAK 109 — STANDAR AKUNTANSI ZIS

### 3.1 Latar Belakang

Diterbitkan oleh Ikatan Akuntan Indonesia (IAI) pada 2008, direvisi 2022. Tujuan: standardisasi pencatatan dan pelaporan keuangan Organisasi Pengelola Zakat (OPZ) di Indonesia.

PSAK 109 bukan hanya untuk BAZNAS/LAZ — tapi juga untuk masjid yang mengelola ZIS.

### 3.2 Komponen Laporan Keuangan

| Laporan | Isi |
|---------|-----|
| **Neraca (Laporan Posisi Keuangan)** | Aset, Liabilitas, Saldo Dana (Dana Zakat, Dana Infak/Sedekah, Dana Amil, Dana Nonhalal) |
| **Laporan Perubahan Dana Zakat** | Saldo awal, penerimaan, penyaluran, saldo akhir |
| **Laporan Perubahan Dana Infak/Sedekah** | Saldo awal, penerimaan, penyaluran (terikat + tidak terikat), saldo akhir |
| **Laporan Perubahan Dana Amil** | Pendapatan amil, beban amil, surplus/defisit |
| **Laporan Perubahan Aset Kelolaan** | Saldo awal, penambahan, pengurangan, saldo akhir |
| **Laporan Arus Kas** | Aktivitas operasi, investasi, pendanaan |
| **Catatan atas Laporan Keuangan** | Kebijakan akuntansi, rincian, penjelasan |

### 3.3 Pengakuan dan Pengukuran

| Transaksi | Pengakuan | Pengukuran |
|-----------|-----------|------------|
| Penerimaan Zakat | Saat kas diterima (basis kas) | Nilai nominal |
| Penerimaan Infak/Sedekah | Saat kas diterima | Nilai nominal |
| Penyaluran Zakat | Saat diserahkan ke mustahiq | Nilai nominal |
| Penyaluran Infak/Sedekah | Saat diserahkan | Nilai nominal |
| Aset Kelolaan (aset wakaf) | Saat penerimaan | Nilai wajar |
| Hasil Pengelolaan Aset | Saat diterima | Nilai nominal |
| Dana Nonhalal | Pisah dari ZIS, disalurkan untuk kemaslahatan | Nilai nominal |

### 3.4 Poin Kritis PSAK 109

1. **Dana zakat dan infak/sedekah WAJIB disajikan terpisah** di neraca
2. **Infak/sedekah terikat vs tidak terikat** — kalau pemberi menentukan tujuan, dicatat sebagai dana terikat
3. **Dana amil** — maksimal 1/8 (12,5%) dari dana zakat untuk biaya operasional pengelola
4. **Dana nonhalal** — penerimaan dari non-syariah (bunga bank konvensional) dipisah dan disalurkan untuk kepentingan umum
5. **Aset kelolaan** — disusutkan kalau ada, penurunan nilai karena kelalaian amil jadi tanggungan amil
6. **Aset tidak lancar infak/sedekah** — dinilai sebesar nilai wajar saat penerimaan

---

## 4. FATWA DSN-MUI TERKAIT

| No Fatwa | Tentang | Relevansi |
|----------|---------|-----------|
| **4/2003** | Penggunaan Dana Zakat untuk Istitsmar (Investasi) | Zakat boleh diinvestasikan untuk produktif dengan syarat: (a) usaha halal, (b) studi kelayakan, (c) diawasi kompeten, (d) lembaga profesional, (e) izin pemerintah, (f) tidak ada mustahiq yang kelaparan, (g) dibatasi waktunya |
| **Ijtima' Ulama VII B2/2021** | Penyaluran Dana Zakat dalam Bentuk Al-Qardh Al-Hasan | Zakat boleh disalurkan sebagai pinjaman modal ke mustahiq dengan syarat: penerima mustahiq, untuk usaha, selektif, wajib dikembalikan, digulirkan |
| **116/2017** | Uang Elektronik Syariah | Relevan untuk donasi digital online |
| **144/2021** | Marketplace Berdasarkan Prinsip Syariah | Relevan untuk platform donasi online |
| **158/2024** | Akad I'arah (Pinjam Pakai) | Relevan untuk aturan barang milik masjid dipinjamkan |

**Catatan penting Fatwa 4/2003:**
- Zakat mal harus dikeluarkan **fauriyah** (segera)
- Penyaluran dari amil ke mustahiq boleh ditunda jika mustahiq belum ada atau ada kemaslahatan lebih besar
- Kemaslahatan ditentukan pemerintah dengan aturan yang terukur
- Investasi zakat harus pada sektor riil yang halal, bukan spekulasi

---

## 5. REGULASI INDONESIA

### 5.1 Pengelolaan Zakat

| Regulasi | Isi |
|----------|-----|
| **UU No. 23/2011** tentang Pengelolaan Zakat | Dasar hukum pengelolaan zakat nasional, pembentukan BAZNAS/LAZ, sanksi pidana |
| **PP No. 14/2014** | Pelaksanaan UU Pengelolaan Zakat |
| **PM No. 5/2016** | Pembentukan LAZ |
| **PM No. 1/2018** | Koordinasi, Pengawasan, dan Pelaporan Zakat |

**Pasal penting UU 23/2011:**
- Pasal 3: Pengelolaan zakat berasaskan: syariat Islam, amanah, kemanfaatan, keadilan, kepastian hukum, terintegrasi, akuntabilitas.
- Pasal 38: Setiap orang dilarang dengan sengaja bertindak selaku amil zakat tanpa izin.
- Pasal 39: Pidana penjara maksimal 5 tahun bagi yang tidak menyetorkan zakat yang telah dikumpulkan.

### 5.2 Pengelolaan Wakaf

| Regulasi | Isi |
|----------|-----|
| **UU No. 41/2004** tentang Wakaf | Dasar hukum wakaf nasional, pembentukan BWI |
| **PP No. 42/2006** | Pelaksanaan UU Wakaf |
| **PP No. 25/2018** | Wakaf Uang |

**Pasal penting UU 41/2004:**
- Pasal 5: Wakaf berfungsi mewujudkan potensi dan manfaat ekonomis harta benda wakaf untuk kepentingan ibadah dan kesejahteraan umum.
- Pasal 10: Nazhir wajib mengelola dan mengembangkan harta benda wakaf sesuai peruntukannya.
- Pasal 22: Nazhir dilarang melakukan perubahan tujuan dan peruntukan wakaf tanpa persetujuan BWI.

### 5.3 Keuangan Masjid — Belum Ada UU Khusus

**Tidak ada undang-undang khusus yang mengatur keuangan masjid.** Pengelolaan keuangan masjid diatur oleh:
1. **Internal masjid** — AD/ART atau pedoman pengurus
2. **Fiqih muamalah** — aturan wakaf, zakat, infaq
3. **PSAK 109** — standar akuntansi (sukarela untuk masjid)
4. **Akuntabilitas umum** — prinsip transparansi dan good governance

---

## 6. LARANGAN SYAR'I — MEMINJAM KAS MASJID

**HUKUM: HARAM** — uang kas masjid tidak boleh dipinjamkan/dihutangkan kepada siapa pun, termasuk pengurus.

### 6.1 Dalil dan Alasan

1. **Masjid bukan ahli tasharruf** — masjid tidak punya legal standing untuk melakukan akad utang-piutang. Dalam fikih, kedudukan masjid disamakan dengan anak kecil, orang gila, dan mahjur 'alaih.
2. **Utang-piutang butuh shighat (ijab-qabul)** — masjid sebagai bangunan tidak bisa mengucapkan akad.
3. **Kas masjid = wakaf** — harta wakaf tidak boleh dialihkan dari peruntukannya.
4. **Hadits riwayat Abu Hurairah:** Pengurus yang meminjam dana masjid untuk dirinya masuk kategori orang munafik (tidak amanah).

### 6.2 Penegasan Ulama

I'anah Ath-Thalibin, Juz 3:
> "Apabila wakaf tersebut dikhususkan untuk masjid, maka haram disalurkan kepada selainnya."

Kaedah fikih:
> "التصرف على الرعية منوط بالمصلحة" — Kebijakan pengelola terhadap amanah harus terikat dengan kemaslahatan (peruntukan asli).

### 6.3 Implikasi Fitur

Sistem harus:
- Mencegah pencatatan "pinjaman" dari kas masjid ke individu
- Tidak memiliki fitur "pinjam kas" untuk personal
- Kalau ada qardhul hasan dari dana ZIS, pencatatannya terpisah dan hanya untuk mustahiq

---

## 7. KONSEP DANA ABADI MASJID

### 7.1 Definisi

Dana abadi masjid (endowment fund) adalah dana yang **pokoknya tidak boleh digunakan**, hanya **hasilnya** yang dimanfaatkan untuk operasional dan program masjid.

### 7.2 Sumber Dana

- Wakaf uang tunai (produktif)
- Hasil investasi tanah/bangunan wakaf
- Saham syariah atau reksadana syariah
- Program donasi abadi (sedekah bulanan rutin)

### 7.3 Aturan Fiqih

- Pokok dana abadi = harta wakaf → tidak boleh berkurang
- Hasil pengelolaan boleh dipakai untuk kemaslahatan masjid
- Nazhir wajib profesional dan amanah
- Kalau nazhir lalai sampai pokok berkurang → wajib dhaman (ganti rugi)
- Laporan keuangan dana abadi harus terpisah dari dana operasional

### 7.4 Fitur yang Diperlukan

- Pencatatan pokok dana abadi (tidak tersentuh)
- Pencatatan hasil pengelolaan
- Pelaporan terpisah
- Tracking investasi/produktivitas dana
- Audit trail penggunaan hasil

---

## 8. IMPLIKASI KE FITUR MASJID HUB

Berdasarkan riset di atas, berikut rekomendasi fitur dan arsitektur bendahara masjid:

### 8.1 Struktur Akun / Klasifikasi Dana

```
DANA MASJID — per gerepok (kantong) terpisah
│
├─ 1. DANA ZAKAT (wajib dipisah total)
│   ├─ Zakat Fitrah
│   └─ Zakat Maal
│
├─ 2. DANA INFAQ/SEDEKAH (boleh digabung)
│   ├─ Infaq Terikat (ditentukan tujuan oleh pemberi)
│   │   ├─ Operasional Masjid (listrik, air, kebersihan)
│   │   ├─ Pembangunan & Renovasi
│   │   ├─ Kegiatan Dakwah & Kajian
│   │   ├─ Pendidikan (TPA, beasiswa)
│   │   ├─ Sosial (santunan yatim, dhuafa)
│   │   └─ Lain-lain
│   └─ Infaq Tidak Terikat (bebas)
│
├─ 3. DANA WAKAF (wajib dipisah; pokok abadi)
│   ├─ Wakaf Tunai / Uang
│   │   ├─ Pokok Wakaf (tidak boleh digunakan)
│   │   └─ Hasil Pengelolaan (boleh digunakan)
│   ├─ Wakaf Produktif (tanah, bangunan, saham)
│   │   ├─ Pokok Wakaf
│   │   └─ Hasil Pengelolaan
│   └─ Wakaf Langsung (karpet, genteng, dll)
│
├─ 4. DANA AMIL (untuk operasional pengelola)
│   ├─ Maksimal 12,5% dari Dana Zakat
│   └─ Sumber lain yang halal
│
├─ 5. DANA NONHALAL (terpisah—kalau ada)
│   └─ Bunga bank konvensional, dll → disalurkan ke kepentingan umum
│
└─ 6. QARDHUL HASAN (jika ada program pembiayaan)
    └─ Dana bergulir untuk mustahiq
```

### 8.2 Fitur Bendahara (Urutan Prioritas)

| Prioritas | Fitur | Dasar Hukum |
|-----------|-------|-------------|
| 🔴 **1** | Pemisahan dana per akad (ZIS, Wakaf, Operasional) di pencatatan | PSAK 109, Fiqih Wakaf, UU 23/2011 |
| 🔴 **2** | Laporan Penerimaan + Penyaluran per jenis dana | PSAK 109, Prinsip Amanah |
| 🔴 **3** | Cetak laporan bulanan/tahunan (format PSAK 109) | PSAK 109, Akuntabilitas |
| 🟡 **4** | Notifikasi saat dana zakat mencapai nisab/nominal tertentu | Fatwa MUI 4/2003 |
| 🟡 **5** | Tracking mustahiq per asnaf (8 golongan) | QS. At-Taubah 60 |
| 🟡 **6** | Pencatatan dana terikat vs tidak terikat (infaq) | PSAK 109 |
| 🟡 **7** | Laporan hasil pengelolaan dana wakaf (pokok + hasil) | UU 41/2004, Fiqih Wakaf |
| 🟢 **8** | Qardhul Hasan tracker (siapa pinjam, berapa, status) | Fatwa Ijtima' 2021 |
| 🟢 **9** | Audit trail: siapa catat, kapan, dari sumber apa | Amanah, Transparansi |
| 🟢 **10** | Multi-rekening bank per jenis dana | Praktik masjid modern |

### 8.3 Larangan yang Harus Di-Code-kan

1. ❌ **Tidak boleh mengambil uang zakat untuk operasional masjid** — zakat hanya untuk 8 asnaf
2. ❌ **Tidak boleh meminjam uang kas masjid** — hukumnya haram, termasuk untuk pengurus
3. ❌ **Tidak boleh mencampur dana zakat dan infaq** — wajib dipisah pencatatan & penyimpanan
4. ❌ **Tidak boleh menggunakan pokok wakaf** — hanya hasilnya
5. ❌ **Tidak boleh melebihi 12,5% amil dari dana zakat** — batas syar'i

### 8.4 Fitur Laporan Wajib (sesuai PSAK 109)

| Laporan | Isi |
|---------|-----|
| **Neraca Masjid** | Aset, Liabilitas, Saldo Dana per jenis |
| **Laporan Penerimaan Dana** | Per sumber: Zakat, Infaq, Sedekah, Wakaf, Lainnya |
| **Laporan Penyaluran Dana** | Per akad + per program |
| **Laporan Perubahan Dana Zakat** | Saldo awal → penerimaan → penyaluran → saldo akhir |
| **Laporan Perubahan Dana Infak/Sedekah** | Sama, dipisah terikat vs tidak terikat |
| **Laporan Perubahan Aset Kelolaan** | Khusus untuk wakaf produktif |
| **Laporan Arus Kas** | Kas masuk/keluar per periode |
| **Catatan atas Laporan Keuangan** | Kebijakan akuntansi, penjelasan pos-pos penting |

### 8.5 Rekomendasi Arsitektur Database

```sql
-- Setiap transaksi WAJIB punya:
-- 1. fund_type: enum('zakat_fitrah','zakat_maal','infaq_terikat','infaq_tidak_terikat','wakaf_pokok','wakaf_hasil','qardhul_hasan','non_halal')
-- 2. akad: enum('tamlik','tabarru','wakaf','qardh')
-- 3. transaction_type: enum('penerimaan','penyaluran','transfer_antar_dana')
-- 4. Terikat/Tidak: hanya untuk infaq/sedekah
-- 5. Mustahiq reference: untuk zakat → 8 asnaf

-- Tabel transactions diperluas:
ALTER TABLE transactions ADD COLUMN fund_type VARCHAR(50);
ALTER TABLE transactions ADD COLUMN akad_type VARCHAR(20);
ALTER TABLE transactions ADD COLUMN is_restricted BOOLEAN DEFAULT false;  -- dana terikat?
ALTER TABLE transactions ADD COLUMN asnaf_type VARCHAR(20);  -- untuk zakat
ALTER TABLE transactions ADD COLUMN wakif_name TEXT;  -- untuk wakaf
ALTER TABLE transactions ADD COLUMN ikrar_wakaf_ref TEXT;  -- dokumen ikrar
```

---

## 9. DAFTAR PUSTAKA

### Kitab Fiqih
- Al-Qalyubi, *Hasyiyah 'ala al-Mahalli* (Juz 3, h. 164)
- I'anah Ath-Thalibin (Juz 3)
- Yusuf al-Qardhawi, *Fiqh al-Zakah* (2009)
- Al-Mughni, Ibnu Qudamah

### Standar Akuntansi
- PSAK 109 — Akuntansi Zakat, Infak, dan Sedekah (IAI, 2008/2022)
- PSAK 101 — Penyajian Laporan Keuangan Syariah (IAI)

### Fatwa DSN-MUI
- Fatwa No. 4/2003 — Penggunaan Dana Zakat untuk Istitsmar
- Fatwa Ijtima' Ulama VII B2/2021 — Penyaluran Dana Zakat dalam Bentuk Al-Qardh Al-Hasan
- Fatwa No. 116/2017 — Uang Elektronik Syariah
- Fatwa No. 158/2024 — Akad I'arah

### Undang-Undang
- UU No. 23/2011 tentang Pengelolaan Zakat
- UU No. 41/2004 tentang Wakaf
- PP No. 42/2006 tentang Pelaksanaan UU Wakaf
- PP No. 25/2018 tentang Wakaf Uang

### Jurnal Ilmiah
- Rahman, T. (2015). "Akuntansi Zakat, Infak dan Sedekah (PSAK 109): Upaya Peningkatan Transparansi dan Akuntabilitas". *Muqtasid*, 6(1).
- Kurnianingsih, W. (2022). "Pengelolaan Dana ZIS Berbasis Masjid Perspektif Hukum Ekonomi Syariah". *Jurnal Hukum Ekonomi Syariah*, 5(2).
- Firdaus, D.W. (2015). "Perancangan Sistem Informasi Akuntansi ZIS di Masjid menggunakan PSAK 109". *Prosiding SAINTIKS FTIK UNIKOM*.
- Abbas, A. et al. (2021). "An Analysis of Accounting Practices for ZIS in LAZISNU Parepare". *Islamic Banking and Finance Review*, 8(2).
- Astuti, D.D. et al. (2024). "Analisis Laporan Keuangan Dana ZIS Berdasarkan PSAK 109 pada BSI". *JAMAK*, 3(3).

---

*Dokumen ini disusun oleh AI (OpenCode) berdasarkan riset literatur fiqih, standar akuntansi, fatwa MUI, dan regulasi Indonesia.
Untuk validasi lanjut, disarankan konsultasi dengan ahli fiqih muamalah dan akuntan syariah.*

*Tanggal: 30 Juni 2026*
