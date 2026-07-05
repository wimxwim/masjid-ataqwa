# 📖 PANDUAN LENGKAP: Script Admin Masjid
### Ditulis dalam bahasa sehari-hari agar mudah dipahami

---

## 🔑 Apa itu Script Ini?

Script `admin-masjid.sh` adalah **alat pengelolaan masjid** yang dijalankan lewat terminal.
Bayangkan ini seperti **"remote control"** untuk semua hal teknis masjid:
- Kelola pengelola masjid (tambah, hapus, edit)
- Backup & restore data
- Kirim notifikasi WhatsApp
- Pantau database
- Dan banyak lagi (50 fitur total!)

---

## ▶️ Cara Menjalankan

Buka terminal, lalu ketik:

```bash
cd ~/GERAKAN_PEMUDA_BERDAYA/masjid-ataqwa
bash scripts/admin-masjid.sh
```

Maka akan muncul **menu utama** dengan pilihan 1-50 dan 0 untuk keluar.

---

## 📋 Daftar Semua Fitur (50 Menu)

### 🟢 Bagian 1: CRUD & Pengelola (Menu 1-15)
| Menu | Nama | Fungsi |
|------|------|--------|
| 1 | Tambah pengelola | Daftarkan pengelola baru ke sistem |
| 2 | Lihat pengelola | Tampilkan semua pengelola yang terdaftar |
| 3 | Hapus pengelola | Hapus pengelola dari sistem |
| 4 | Edit profil | Ubah nama, telepon, dsb |
| 5 | Aktif/nonaktifkan | Matikan atau hidupkan akun pengelola |
| 6 | Log aktivitas | Lihat siapa saja yang sudah login |
| 7 | Ekspor CSV | Simpan data pengelola ke file Excel |
| 8 | Email pengumuman | Kirim email massal ke pengelola |
| 9 | Dashboard statistik | Ringkasan data masjid |
| 10 | Cari pengelola | Cari pengelola berdasarkan nama/email |
| 11 | Reset password | Atur ulang password pengelola |
| 12 | Ubah peran | Ganti peran (admin/ketua/viewer) |
| 13 | Backup (JSON) | Simpan SEMUA data ke file JSON |
| 14 | Restore (JSON) | Pulihkan data dari file backup JSON |
| 15 | Riwayat login | Catatan kapan pengelola login |

### 🔵 Bagian 2: Komunikasi & Pengaturan (Menu 16-21)
| Menu | Nama | Fungsi |
|------|------|--------|
| 16 | Notif WhatsApp | Kirim notifikasi WA ke jamaah |
| 17 | Kelola nama masjid | Ubah nama masjid di sistem |
| 18 | Daftar masjid | Lihat semua masjid yang terdaftar |
| 19 | Pindah masjid | Ganti masjid yang dikelola |
| 20 | Reset semua data | ⚠️ HAPUS SEMUA DATA (hanya darurat!) |
| 21 | Bantuan | Tampilkan panduan ringkas |

### 🟡 Bagian 3: Dashboard & Observasi (Menu 22-24)
| Menu | Nama | Fungsi |
|------|------|--------|
| 22 | Mata Elang | Pantau status sistem secara realtime |
| 23 | Push & Deploy | Update kode ke server production |
| 24 | Sapu Bersih Cache | Bersihkan cache yang sudah usang |

### 🟣 Bagian 4: Database Supabase CLI (Menu 25-39)
| Menu | Nama | Fungsi |
|------|------|--------|
| 25 | Jalankan SQL | Ketik dan jalankan perintah SQL langsung |
| 26 | Lihat Tabel | Lihat semua tabel di database |
| 27 | Status Migrasi | Cek apakah database sudah up-to-date |
| 28 | Push Migrasi | Terapkan perubahan struktur database |
| 29 | Schema Diff | Bandingkan database lokal vs server |
| 30 | Backup DB (SQL) | Backup database ke file SQL |
| 31 | Restore DB (SQL) | Pulihkan database dari file SQL |
| 32 | DB Lint | Cek kesalahan struktur database |
| 33 | Security Advisor | Cek masalah keamanan database |
| 34 | Performance Advisor | Cek performa database (query lambat) |
| 35 | Jalankan Seed | Jalankan data awal (contoh data) |
| 36 | Lihat Storage | Lihat file yang tersimpan (foto, dll) |
| 37 | Lihat Secrets | Lihat API keys yang tersimpan |
| 38 | Set Secret | Tambah/update API key |
| 39 | Info Project & Koneksi | Cek info project + test koneksi DB |

### 🔴 Bagian 5: Password & Vercel (Menu 40-41)
| Menu | Nama | Fungsi |
|------|------|--------|
| 40 | Ganti Password DB | Ubah password database Supabase |
| 41 | Sync .env ke Vercel | Push semua pengaturan ke Vercel |

### 📊 Bagian 6: Inspeksi Database (Menu 42-49)
| Menu | Nama | Fungsi |
|------|------|--------|
| 42 | Bloat Check | Cek tabel yang membesar tanpa perlu |
| 43 | Locks Monitor | Cek query yang mengunci tabel |
| 44 | Query Lama | Cek query yang berjalan terlalu lama |
| 45 | Trafik Profil | Lihat tabel mana yang sering diakses |
| 46 | Vacuum Stats | Cek status pembersihan tabel |
| 47 | Index Stats | Cek efisiensi index database |
| 48 | Squash Migrasi | Gabung banyak migrasi jadi 1 file |
| 49 | Generate Types (TS) | Buat file TypeScript dari database |

### 📖 Bagian 7: Panduan (Menu 50)
| Menu | Nama | Fungsi |
|------|------|--------|
| 50 | Buka Panduan | Baca panduan lengkap di terminal atau browser |

---

## 🔐 Menu 40: Ganti Password Database (Penjelasan Detail)

### Kenapa Perlu Ganti Password?
Password database itu seperti **kunci rumah**. Kalau sudah tersebar atau terlalu lama,
sebaiknya diganti demi keamanan.

### Yang Terjadi Saat Anda Ganti Password:
1. Script **membuka browser** ke halaman pengaturan database di Supabase
2. Anda **ketik password baru** di browser (Supabase akan memproses)
3. Anda **paste password baru** ke terminal
4. Script **otomatis update**:
   - File `.env` di komputer (untuk development lokal)
   - Variable `DATABASE_URL` di Vercel (untuk production/website)
   - Variable `SUPABASE_DB_PASSWORD` di `.env`
5. Selesai! Tinggal restart aplikasi

### Yang Perlu Diingat:
- ⚠️ Password baru harus **kuat**: minimal 12 karakter, campur huruf besar/kecil, angka, simbol
- ⚠️ Setelah ganti password, **semua koneksi database aktif akan terputus** (normal)
- ⚠️ Simpan password baru di **Bitwarden** atau password manager lain
- ⚠️ Kalau lupa password baru, harus ganti lagi lewat Dashboard

---

## 🔄 Menu 41: Sync .env ke Vercel (Penjelasan Detail)

### Kenapa Perlu Sync?
Ketika Anda mengubah sesuatu di file `.env` (misal: ganti API key, ganti password),
perubahan itu **hanya ada di komputer Anda**. Website yang sudah live di **Vercel belum tahu**.
Menu 41 ini **mengirim semua pengaturan dari `.env` ke Vercel** supaya website ikut ter-update.

### Yang Terjadi Saat Sync:
1. Script **membaca** semua variabel di file `.env`
2. Untuk setiap variabel, script **kirim ke Vercel** (production environment)
3. Kalau variabel sudah ada di Vercel → **update**
4. Kalau variabel belum ada → **tambah baru**
5. Tampilkan laporan: berhasil, skip, atau gagal

### Kapan Harus Sync?
- Setelah **ganti password** database (Menu 40)
- Setelah **tambah/update API key** (misal: Midtrans, Fonnte, Turnstile)
- Setelah **ubah konfigurasi** apapun di `.env`
- Sebelum **deploy** ke production

---

## 📊 Menu 42-47: Inspeksi Database (Penjelasan Detail)

### Menu 42: Bloat Check
**Apa itu bloat?**
Bayangkan tabel database seperti lemari arsip. Setiap kali data dihapus atau diupdate,
ada "ruang kosong" yang tertinggal di lemari. Lama-lama lemari jadi penuh tapi isinya
sedikit. Itu namanya **bloat**.

**Kapan perlu cek?**
- Kalau website terasa lambat
- Setelah banyak data dihapus
- Rutin setiap bulan

**Yang muncul:**
- Tabel mana yang bloat
- Berapa banyak ruang terbuang
- Saran untuk memperbaiki

---

### Menu 43: Locks Monitor
**Apa itu locks?**
Bayangkan ada 2 orang mau edit file yang sama di waktu bersamaan. Sistem database
"mengunci" file itu supaya tidak bentrok. Tapi kalau kuncinya terlalu lama,
yang lain jadi menunggu.

**Kapan perlu cek?**
- Kalau ada yang bilang "website saya tidak bisa diakses"
- Kalau ada error "timeout" atau "deadlock"
- Kalau proses tertentu terasa sangat lambat

**Yang muncul:**
- Query mana yang sedang mengunci tabel
- Sudah berapa lama dikunci
- Siapa yang terpengaruh

---

### Menu 44: Query Lama (Long Running Queries)
**Apa itu query lama?**
Query adalah "permintaan data" ke database. Kalau query-nya rumit atau data-nya banyak,
prosesnya bisa lama. Query yang terlalu lama (lebih dari 1 menit) biasanya bermasalah.

**Kapan perlu cek?**
- Kalau halaman tertentu lambat dimuat
- Kalau laporan tertentu tidak selesai-selesai
- Secara rutin (misal: setiap minggu)

**Yang muncul:**
- Query mana yang berjalan lama
- Sudah berapa lama berjalan
- Siapa yang menjalankannya

---

### Menu 45: Trafik Profil
**Apa itu trafik profil?**
Ini seperti **"peta jalan"** untuk database. Menunjukkan tabel mana yang paling sering
dibaca dan ditulis. Tabel yang sering diakses perlu diperhatikan performanya.

**Kapan perlu cek?**
- Saat merencanakan optimasi
- Sebelum menambah fitur baru yang banyak data
- Secara berkala untuk perencanaan kapasitas

**Yang muncul:**
- Tabel mana yang paling sering diakses
- Berapa kali dibaca vs ditulis
- Tabel mana yang jarang dipakai (bisa diarsipkan)

---

### Menu 46: Vacuum Stats
**Apa itu vacuum?**
Database perlu "bersih-bersih" secara rutin, seperti menyapu lantai. Vacuum menghapus
data yang sudah tidak dipakai dan merapikan tabel. Tanpa vacuum, tabel akan semakin
membesar dan lambat.

**Kapan perlu cek?**
- Setelah banyak INSERT, UPDATE, DELETE
- Kalau tabel terasa semakin besar
- Secara rutin (Supabase biasanya auto-vacuum, tapi perlu dipantau)

**Yang muncul:**
- Tabel mana yang perlu di-vacuum
- Sudah berapa lama tidak di-vacuum
- Berapa banyak dead tuple (data sampah)

---

### Menu 47: Index Stats
**Apa itu index?**
Index di database itu seperti **daftar isi buku**. Tanpa index, database harus baca
seluruh buku untuk menemukan satu halaman. Dengan index, langsung tahu di halaman berapa.

**Kapan perlu cek?**
- Kalau query tertentu lambat padahal data tidak banyak
- Setelah menambah index baru (cek apakah efektif)
- Secara berkala untuk optimasi

**Yang muncul:**
- Index mana yang sering dipakai
- Index mana yang jarang dipakai (boros ruang)
- Index mana yang hilang (query jadi lambat)

---

## 🛠️ Tips & Trik

### 1. Shortcut Keyboard
- `Ctrl+C` = Batalkan perintah yang sedang berjalan
- `Ctrl+L` = Bersihkan layar terminal
- `Tab` = Auto-complete nama file/perintah

### 2. Kalau Script Error
Cek apakah:
- [ ] File `.env` ada dan lengkap
- [ ] Supabase CLI terpasang (`supabase --version`)
- [ ] Vercel CLI terpasang (`vercel --version`)
- [ ] Koneksi internet aktif
- [ ] Sudah login ke Supabase (`supabase login`)

### 3. Backup Rutin
Jalankan backup minimal **1x seminggu**:
- Menu 13 (JSON) = Backup data pengelola, program, donasi, dsb
- Menu 30 (SQL) = Backup SELURUH database termasuk struktur tabel

### 4. Keamanan
- Jangan bagikan isi `.env` ke siapapun
- Jangan share password database
- Ganti password secara berkala (Menu 40)
- Cek Security Advisor secara rutin (Menu 33)

---

## ❓ FAQ (Pertanyaan yang Sering Ditanya)

**Q: Saya lupa password admin, bagaimana?**
A: Jalankan Menu 11 (Reset Password). Masukkan email yang terdaftar, sistem akan
mengirim link reset ke email tersebut.

**Q: Data saya hilang setelah ganti password!**
A: Data tidak hilang. Yang hilang hanya **koneksi**. Pastikan `.env` sudah diupdate
dengan password baru, lalu restart aplikasi.

**Q: Menu 20 (Reset Semua Data) itu apa?**
A: Ini **menghapus SEMUA data** di database. Hanya untuk keadaan darurat
(misal: data corrupt parah). WAJIB backup dulu sebelum pakai!

**Q: Kenapa harus sync ke Vercel setelah ganti .env?**
A: Karena `.env` hanya ada di komputer Anda. Vercel punya **salinan sendiri**.
Kalau tidak sync, website tetap pakai yang lama.

**Q: Script bilang "Supabase CLI tidak terpasang"?**
A: Install dengan cara:
```bash
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/
```

**Q: Saya tidak punya Vercel CLI?**
A: Install dengan cara:
```bash
npm install -g vercel
```

**Q: Menu 48 (Squash Migrasi) itu apa?**
A: Bayangkan Anda punya 50 file migrasi yang kecil-kecil. Squash menggabungkan
semuanya jadi 1 file besar. Berguna untuk **membersihkan history** dan membuat
project lebih rapi.

**Q: Menu 49 (Generate Types) itu apa?**
A: Membuat file TypeScript yang berisi "denah" semua tabel di database.
Ini membantu programmer menulis kode yang lebih aman dan tidak salah ketik
nama tabel/kolom.

---

## 📞 Butuh Bantuan?

Kalau ada masalah yang tidak terjawab di sini:
1. Jalankan Menu 21 (Bantuan) untuk panduan ringkas
2. Jalankan Menu 39 (Info Project) untuk cek status sistem
3. Tanya ke teknisi/developer yang menangani project ini

---

*Panduan ini dibuat untuk Masjid Hub — Gerakan Pemuda Berdaya*
*Terakhir diperbarui: Juli 2026*
