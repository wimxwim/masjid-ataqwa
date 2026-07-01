-- ============================================================
-- SEED DATA — MASJID AT-TAQWA ULUJAMI
-- Aman dijalankan berulang (delete + insert dalam transaction)
-- ============================================================

BEGIN;

-- Hapus semua data lama (urutan kebalikan dari FK dependencies)
-- Tabel tanpa mosque_id langsung dilewati — kosong di seed ini
DELETE FROM kajian_silabus        WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM bumm_products          WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM santri                 WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM donations              WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM activity_feed          WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM transactions           WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM testimonials           WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM donatur_tetap          WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM inventaris             WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM jamaah                 WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM mustahiks              WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM programs               WHERE mosque_id = 'a0000000-0000-0000-0000-000000000001';
DELETE FROM mosques                WHERE id = 'a0000000-0000-0000-0000-000000000001';

-- ========================================================================

-- 1. MASJID
INSERT INTO mosques (id, name, slug, address, lat, lng, city, district, village, is_active, is_legalized, config)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Masjid Jami'' At-Taqwa Ulujami',
    'ataqwa-ulujami',
    'Jl. Swadarma Raya No.25, Ulujami, Pesanggrahan, Jakarta Selatan',
    -6.2280, 106.7609,
    'Jakarta Selatan', 'Pesanggrahan', 'Ulujami',
    true, true,
    '{"prayer_adjustment":2,"kajian_start_hour":19,"zakat_fitrah_amount":45000,"infaq_weekly_default":50000}'
);

-- 2. PROGRAM
INSERT INTO programs (id, mosque_id, name, slug, description, category, is_active, is_featured, sort_order, config, start_date) VALUES
('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Kampung Quran At-Taqwa', 'kampung-quran', 'Program tahsin, tahfidz, dan tafsir Al-Quran untuk semua usia. Dari anak-anak TPQ hingga lansia.', 'pendidikan', true, true, 1, '{"icon":"book-open","color":"#10b981","target_beneficiaries":50,"target_budget":50000000}', '2026-01-01'),
('b2000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Bank Infaq Qardhul Hasan', 'bank-infaq', 'Pinjaman modal tanpa bunga dan biaya administrasi untuk memberdayakan UMKM lokal agar terlepas dari jeratan lintah darat.', 'ekonomi', true, true, 2, '{"icon":"hand-coins","color":"#0e7a45","target_beneficiaries":100,"target_budget":50000000,"image_url":"https://images.unsplash.com/photo-1597935258735-e254c1839512?auto=format&fit=crop&w=600&q=80","badge":"Modal Syariah"}', NULL),
('b3000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Wakaf Domba Produktif', 'wakaf-domba', 'Pengembangan kluster ternak domba modern terintegrasi, di mana hasil keuntungan digunakan 100% untuk mendanai operasional masjid.', 'ekonomi', true, true, 3, '{"icon":"sheep","color":"#c8a84e","target_beneficiaries":30,"target_budget":100000000,"image_url":"https://images.unsplash.com/photo-1484557985045-def2560fec70?auto=format&fit=crop&w=600&q=80","badge":"Peternakan Umat"}', NULL),
('b4000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Beasiswa Pendidikan Anak Asuh', 'beasiswa', 'Bantuan SPP, seragam, dan uang saku bulanan untuk anak yatim dan dhuafa di lingkungan masjid agar tidak putus sekolah.', 'pendidikan', true, true, 4, '{"icon":"graduation-cap","color":"#3b82f6","target_beneficiaries":25,"target_budget":120000000,"image_url":"https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80","badge":"Pendidikan"}', NULL),
('b5000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'BUMM At-Taqwa', 'bumm', 'Badan Usaha Milik Masjid — kopi, bakery, foodcourt, creative hub. Pemberdayaan ekonomi pemuda.', 'ekonomi', false, false, 5, '{"icon":"store","color":"#f59e0b","target_beneficiaries":30,"target_budget":150000000}', NULL);

-- 3. MUSTAHIK (5 KK)
INSERT INTO mustahiks (id, mosque_id, name, phone, address, lat, lng, desil_level, ring_number, monthly_income, dependents, usaha_type, is_active) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Siti Aminah', '081211111111', 'Jl. H. Syam 1, RT 03/05, Ulujami', -6.2490, 106.7490, '1', 1, 800000, 4, 'Jualan gorengan keliling', true),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Ahmad Rifa''i', '081222222222', 'Gg. H. Saidi II, RT 02/06, Ulujami', -6.2480, 106.7510, '2', 1, 1200000, 6, 'Kuli bangunan serabutan', true),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Maryam binti Umar', '081233333333', 'Jl. Ulujami Raya Gg. III, RT 01/04', -6.2475, 106.7520, '2', 2, 1000000, 3, 'Asisten rumah tangga', true),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Kusnadi', '081244444444', 'Kp. Ulujami Dalam, RT 05/07', -6.2500, 106.7480, '3', 2, 1500000, 5, 'Tukang ojek pangkalan', true),
('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Jamilah', '081255555555', 'Jl. Swadaya I No. 12, RT 04/06', -6.2488, 106.7530, '1', 1, 600000, 7, 'Serabutan / jahit', true);

-- 4. JAMAAH
INSERT INTO jamaah (id, mosque_id, nama, phone, alamat, rt_rw, peran) VALUES
('30000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'H. Sujono', '081311111111', 'Jl. Ulujami Raya No. 45', '03/05', 'Ketua DKM'),
('30000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Fahri Ramadhan', '081322222222', 'Gg. Masjid I, No. 2', '02/05', 'REMISYA'),
('30000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Dinda Aulia', '081333333333', 'Perum Ulujami Indah Blok C4', '01/04', 'REMISYA'),
('30000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Ustadz Adi Firmansyah', '081344444444', 'Jl. H. Nawi Raya No. 10', '04/06', 'Da''i / Imam'),
('30000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Hj. Rohmah', '081355555555', 'Kp. Ulujami Gang Kramat', '03/05', 'Bendahara DKM'),
('30000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Rizky Pratama', '081366666666', 'Jl. Swadaya III No. 7', '05/07', 'REMISYA'),
('30000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Imam Bukhori', '081377777777', 'Ds. Ulujami Selatan', '02/06', 'Marbot Masjid'),
('30000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Sari Dewi', '081388888888', 'Jl. Ulujami Raya Gg. V', '04/06', 'Guru TPQ');

-- 5. DONATUR TETAP
INSERT INTO donatur_tetap (id, mosque_id, nama, phone, alamat, komitmen_bulanan, aliran_dana, program_spesifik, frekuensi, status) VALUES
('20000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'PT Berkah Abadi Sejahtera', '081411111111', 'Jl. TB Simatupang Kav. 58, Jakarta Selatan', 2000000, 'Dana Operasional Masjid', 'Program Kampung Quran', 'Bulanan', 'Aktif'),
('20000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Drh. Aulia Rahman', '081422222222', 'Perum Ulujami Indah Blok A3', 500000, 'Zakat Maal', 'Beasiswa Anak Asuh', 'Bulanan', 'Aktif');

-- 6. TESTIMONIALS
INSERT INTO testimonials (id, mosque_id, mustahik_id, nama, usia, title, story, ring, durasi_bulan, is_active) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Siti Aminah', 48, 'Dari Jualan Gorengan Kini Buka Warung', 'Saya mulai ikut program pemberdayaan Masjid At-Taqwa sejak suami saya meninggal. Dapat modal bergulir Rp 500.000 dari Bank Infaq, saya buka warung kecil-kecilan di teras rumah. Anak saya juga dapat beasiswa SPP SD. Alhamdulillah, sekarang bisa bayar listrik sendiri.', 'Ring 1', 9, true),
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Ahmad Rifa''i', 52, 'Masjid Mengubah Hidup Saya', 'Dulu saya jadi kuli bangunan serabutan. Penghasilan gak nentu. Masjid ngajak ikut program wakaf domba produktif — saya dapat 2 ekor domba. Sekarang udah beranak pinak jadi 8 ekor. Saya jual buat biaya sekolah 3 orang anak. Terima kasih Masjid At-Taqwa.', 'Ring 1', 12, true);

-- 7. BUMM PRODUCTS
INSERT INTO bumm_products (id, mosque_id, program_id, product_name, category, description, price, commission_pct, stock, image_url, is_active) VALUES
('50000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b5000000-0000-0000-0000-000000000001', 'Kopi At-Taqwa Premium 250gr', 'Kuliner', 'Kopi arabika single origin Nusantara, di-roast oleh pemuda binaan masjid. Segar, tidak asam, cocok untuk seduh manual.', 35000, 15, 50, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80', true),
('50000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b5000000-0000-0000-0000-000000000001', 'Bakery At-Taqwa — Roti Sobek Coklat', 'Kuliner', 'Roti sobek homemade dari dapur buat oleh ibu-ibu mustahik binaan. Tanpa pengawet, lembut, dan coklat asli.', 18000, 15, 30, 'https://images.unsplash.com/photo-1549931319-a545951292d2?auto=format&fit=crop&w=400&q=80', true),
('50000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b5000000-0000-0000-0000-000000000001', 'Gamis Batik At-Taqwa (Dewasa)', 'Fesyen', 'Gamis batik modern motif khas Ulujami, produksi pemudi masjid. Bahan katun premium, nyaman dipakai sehari-hari.', 120000, 20, 15, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=400&q=80', true);

-- 8. INVENTARIS
INSERT INTO inventaris (id, mosque_id, nama_barang, jumlah, satuan, kondisi, asal) VALUES
('40000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sound System Wireless (Mikrofon + Speaker)', 2, 'Set', 'Baik', 'Wakaf'),
('40000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Al-Quran Digital (Ipad + Qalma App)', 10, 'Unit', 'Baik', 'Hibah'),
('40000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Karpet Masjid (Saf Shalat Utama)', 50, 'Lembar', 'Baik', 'Wakaf');

-- 9. DONASI
INSERT INTO donations (id, mosque_id, program_id, donor_name, donor_phone, amount, akad_type, program_name, payment_method, payment_status, paid_at) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'PT Berkah Abadi', '081511111111', 5000000, 'infaq', 'Kampung Quran', 'transfer', 'paid', '2026-06-02'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b4000000-0000-0000-0000-000000000001', 'Drh. Aulia Rahman', '081522222222', 500000, 'zakat_mal', 'Beasiswa Anak Asuh', 'transfer', 'paid', '2026-06-05'),
('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', NULL, 'H. Sujono', '081533333333', 200000, 'infaq', 'Umum', 'tunai', 'paid', '2026-06-07'),
('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Yayasan Bina Qurani', '081544444444', 3000000, 'sedekah', 'Kampung Quran', 'transfer', 'paid', '2026-06-10'),
('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b3000000-0000-0000-0000-000000000001', 'Wakif dari Bintaro', '081555555555', 10000000, 'wakaf', 'Wakaf Domba Produktif', 'transfer', 'paid', '2026-06-12'),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NULL, 'Jamaah Subuh', NULL, 180000, 'infaq', 'Kotak Amal', 'tunai', 'paid', '2026-06-14'),
('d0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', NULL, 'Ibu-ibu Arisan RT 03', '081566666666', 750000, 'sedekah', 'Santunan Yatim', 'tunai', 'paid', '2026-06-18'),
('d0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'H. Sujono', '081533333333', 1000000, 'zakat_fitrah', 'Kampung Quran', 'transfer', 'paid', '2026-06-20'),
('d0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', NULL, 'Anonim', NULL, 50000, 'infaq', 'Umum', 'qris', 'paid', '2026-06-25'),
('d0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'b5000000-0000-0000-0000-000000000001', 'Pembeli Kopi Online', NULL, 35000, 'sedekah', 'BUMM At-Taqwa', 'qris', 'paid', '2026-06-28');

-- 10. TRANSAKSI (multi-fund-type sesuai fiqih muamalah)
INSERT INTO transactions (id, mosque_id, type, category, amount, description, donor_name, recipient_name, phone, notes, transaction_date, fund_type, akad_type, is_restricted, asnaf_type) VALUES
-- ZAKAT FITRAH (3 transaksi)
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Zakat Fitrah Beras/Uang', 900000, 'Zakat Fitrah 20 jiwa @ Rp 45.000 — dari panitia ZIS', 'Panitia ZIS', NULL, NULL, 'Setoran Ramadhan 1447 H', '2026-06-05', 'zakat_fitrah', 'tamlik', false, 'fakir_miskin'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Zakat Fitrah Beras/Uang', 360000, 'Zakat Fitrah 8 jiwa — keluarga H. Sujono', 'H. Sujono', NULL, '081533333333', 'Disetorkan ke panitia', '2026-06-06', 'zakat_fitrah', 'tamlik', false, 'fakir_miskin'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Zakat Fitrah Beras/Uang', 180000, 'Zakat Fitrah 4 jiwa — keluarga Hj. Rohmah', 'Hj. Rohmah', NULL, '081355555555', NULL, '2026-06-07', 'zakat_fitrah', 'tamlik', false, 'fakir_miskin'),

-- ZAKAT MAAL (2 transaksi)
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Zakat Maal', 2500000, 'Zakat maal 2,5% dari penghasilan tahunan — donatur tetap', 'PT Berkah Abadi Sejahtera', NULL, '081411111111', 'Transfer BCA Syariah — dialokasikan ke beasiswa anak asuh', '2026-06-10', 'zakat_maal', 'tamlik', false, 'gharim'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Zakat Maal', 500000, 'Zakat maal bulanan — donatur tetap', 'Drh. Aulia Rahman', NULL, '081422222222', 'Auto-debit BSI', '2026-06-15', 'zakat_maal', 'tamlik', false, 'fakir_miskin'),

-- INFAQ TERIKAT (2 transaksi — untuk program spesifik)
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Infaq Program Anak Asuh', 750000, 'Infaq rutin donatur anak asuh — untuk SPP 5 anak yatim', 'Drh. Aulia Rahman', NULL, '081522222222', 'Via transfer BSI — khusus beasiswa', '2026-06-12', 'infaq_terikat', 'tabarru', true, NULL),
('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Infaq Pembangunan Tempat Wudhu', 500000, 'Donasi khusus pembangunan tempat wudhu', 'H. Sujono', NULL, '081533333333', 'Diserahkan langsung ke Ketua DKM — dana terikat pembangunan', '2026-06-14', 'infaq_terikat', 'tabarru', true, NULL),

-- INFAQ TIDAK TERIKAT (1 transaksi — kotak amal umum)
('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Kotak Amal Jumat', 520000, 'Kotak Amal Jumat — 12 Juni 2026', 'Jamaah Jumat', NULL, NULL, 'Kotak 1+2 terkumpul — dana bebas untuk operasional', '2026-06-12', 'infaq_tidak_terikat', 'tabarru', false, NULL),

-- WAKAF TUNAI POKOK (1 transaksi)
('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Wakaf Uang Masjid', 5000000, 'Wakaf uang untuk pembelian karpet baru masjid — dana pokok wakaf tidak boleh berkurang', 'PT Berkah Abadi', NULL, NULL, 'Wakaf tunai via BCA Syariah — ikrar wakaf terdaftar', '2026-06-18', 'wakaf_pokok', 'wakaf', true, NULL),

-- WAKAF HASIL (2 transaksi — hasil dari wakaf produktif)
('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Hasil Wakaf Domba', 800000, 'Penjualan 2 ekor domba dari kluster wakaf produktif — hasil untuk operasional masjid', 'Peternakan Wakaf', NULL, NULL, 'Domba bantuan wakif, hasil dijual untuk listrik & air', '2026-06-20', 'wakaf_hasil', 'wakaf', false, NULL),
('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Hasil Wakaf Domba', 350000, 'Penjualan 1 ekor domba jantan — hasil dikelola nadzir', 'Peternakan Wakaf', NULL, NULL, NULL, '2026-06-22', 'wakaf_hasil', 'wakaf', false, NULL),

-- QARDHUL HASAN (1 transaksi — pengembalian pinjaman)
('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Pemasukan', 'Qardhul Hasan Kembali', 250000, 'Angsuran mingguan Bank Infaq — Siti Aminah (minggu ke-3)', NULL, 'Siti Aminah', '081211111111', 'Pinjaman Rp 500.000 @Rp 50.000/minggu — tinggal 5 minggu lagi', '2026-06-21', 'qardhul_hasan', 'qardh', false, NULL),

-- PENGELUARAN (operasional dari infaq_tidak_terikat + wakaf_hasil)
('c0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'Pengeluaran', 'Honor Ustadz', 600000, 'Honor mengajar Ustadz Adi — 4x pertemuan pekan ini @150rb', NULL, 'Ustadz Adi Firmansyah', '081344444444', 'Dari dana infaq tidak terikat', '2026-06-09', 'infaq_tidak_terikat', 'tabarru', false, NULL),
('c0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'Pengeluaran', 'Listrik & Air', 450000, 'Pembayaran rekening listrik masjid Juni 2026', NULL, 'PLN', NULL, 'Didanai dari hasil wakaf domba', '2026-06-11', 'wakaf_hasil', 'wakaf', false, NULL),
('c0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'Pengeluaran', 'Santunan Mustahik', 300000, 'Santunan sembako untuk Siti Aminah (Ring 1) dan Maryam (Ring 2)', NULL, 'Siti Aminah', '081211111111', 'Dari dana zakat maal — mustahik Ring 1', '2026-06-16', 'zakat_maal', 'tamlik', false, 'fakir_miskin'),
('c0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'Pengeluaran', 'Operasional Harian', 200000, 'Kebersihan masjid — sabun, pengharum, perlengkapan toilet', NULL, 'Marbot (Imam Bukhori)', '081377777777', 'Dari infaq tidak terikat', '2026-06-13', 'infaq_tidak_terikat', 'tabarru', false, NULL),
('c0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'Pengeluaran', 'Konsumsi Kajian', 150000, 'Snack + air mineral untuk kajian ba''da Maghrib (tafsir)', NULL, 'DKM Bidang Konsumsi', NULL, 'Dari infaq tidak terikat', '2026-06-15', 'infaq_tidak_terikat', 'tabarru', false, NULL),
('c0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'Pengeluaran', 'Pembangunan & Perbaikan', 2000000, 'Perbaikan kran dan toilet tempat wudhu (3 titik bocor)', NULL, 'Tukang (Bang Anwar)', NULL, 'Dari infaq terikat pembangunan', '2026-06-18', 'infaq_terikat', 'tabarru', true, NULL),
('c0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'Pengeluaran', 'Gaji & Insentif', 500000, 'Insentif marbot masjid bulan Juni', NULL, 'Imam Bukhori', '081377777777', 'Dari infaq tidak terikat', '2026-06-22', 'infaq_tidak_terikat', 'tabarru', false, NULL);

-- 11. ACTIVITY FEED
INSERT INTO activity_feed (id, mosque_id, type, nama, alamat, detail, jumlah) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'donation', 'PT Berkah Abadi', 'Jakarta Selatan', 'Donasi Rp 5.000.000 melalui transfer BCA Syariah untuk Kampung Quran', 5000000),
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'donation', 'Drh. Aulia Rahman', 'Ulujami Indah', 'Bayar zakat maal via BSI Rp 500.000 — dialokasikan ke Beasiswa Anak Asuh', 500000),
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'zakat', 'H. Sujono', 'Ulujami', 'Zakat Fitrah untuk 4 jiwa anggota keluarga @ Rp 45.000', 180000),
('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'donation', 'Yayasan Bina Qurani', 'Jakarta Pusat', 'Donasi program Kampung Quran Rp 3.000.000', 3000000),
('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'donation', 'Wakif dari Bintaro', 'Bintaro Jaya', 'Wakaf domba produktif Rp 10.000.000', 10000000),
('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'mustahik', 'Siti Aminah', 'Jl. H. Syam 1, Ulujami', 'Lulus Ring 1 — modal usaha warung cair Rp 500.000 dari Bank Infaq', NULL),
('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'donation', 'Ibu-ibu Arisan RT 03', 'Ulujami', 'Santunan yatim bersamaan — dana terkumpul Rp 750.000', 750000),
('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'mustahik', 'Ahmad Rifa''i', 'Gg. H. Saidi, Ulujami', 'Program Wakaf Domba — 2 ekor induk domba diserahkan ke mustahik', NULL),
('f0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'bumm', 'Pembeli Kopi Online', 'Jakarta Selatan', 'Pembelian Kopi At-Taqwa Premium 250gr via marketplace', 35000),
('f0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'donation', 'Jamaah Subuh', 'Ulujami', 'Kotak amal subuh terkumpul Rp 180.000', 180000),
('f0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'donation', 'Bakery At-Taqwa', 'Ulujami', 'Penjualan Roti Sobek Coklat — 20 pcs terjual hari ini', 360000),
('f0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'mustahik', 'Jamilah', 'Jl. Swadaya I, Ulujami', 'Terdata sebagai mustahik baru — Ring 1, 7 tanggungan', NULL);

-- 12. KAJIAN SILABUS
INSERT INTO kajian_silabus (mosque_id, category, kitab, weight_pct, total_sessions, month_year) VALUES
('a0000000-0000-0000-0000-000000000001', 'tafsir',   'Tafsir Al-Mishbah',           22.0, 4, '2026-07'),
('a0000000-0000-0000-0000-000000000001', 'hadits',   'Bulughul Maram',              18.0, 4, '2026-07'),
('a0000000-0000-0000-0000-000000000001', 'fiqih',    'Fiqih Sunnah',                16.0, 4, '2026-07'),
('a0000000-0000-0000-0000-000000000001', 'aqidah',   'Aqidah Al-Wasithiyah',        16.0, 4, '2026-07'),
('a0000000-0000-0000-0000-000000000001', 'sirah',    'Sirah Nabawiyah',             16.0, 4, '2026-07'),
('a0000000-0000-0000-0000-000000000001', 'tasawuf',  'Ihya Ulumuddin',              6.0,  2, '2026-07'),
('a0000000-0000-0000-0000-000000000001', 'ekonomi_syariah', 'Ekonomi Syariah',      6.0,  4, '2026-07');

COMMIT;
