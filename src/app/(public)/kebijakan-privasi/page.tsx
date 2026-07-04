export const metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi dan perlindungan data pribadi Masjid Jami' At-Taqwa Ulujami",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display font-bold text-3xl text-ink mb-2">Kebijakan Privasi</h1>
      <p className="text-sm text-muted mb-8">Terakhir diperbarui: 4 Juli 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-ink/80">

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">1. Pendahuluan</h2>
          <p>
            Masjid Jami' At-Taqwa Ulujami ("kami", "kita", "masjid") berkomitmen melindungi
            privasi data pribadi seluruh jamaah, donatur, mustahik, dan pengguna platform digital
            Masjid Hub. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan,
            menyimpan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang No. 27 Tahun
            2022 tentang Perlindungan Data Pribadi (UU PDP).
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">2. Data yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan data berikut sesuai dengan kebutuhan layanan:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Data Identitas:</strong> Nama lengkap, Nomor Induk Kependudukan (NIK), alamat, nomor telepon, email</li>
            <li><strong>Data Keluarga:</strong> Nama anggota keluarga, hubungan, usia (untuk mustahik)</li>
            <li><strong>Data Ekonomi:</strong> Pekerjaan, penghasilan, jumlah tanggungan, skor kelayakan (untuk penerima bantuan)</li>
            <li><strong>Data Donasi:</strong> Riwayat zakat, infaq, sedekah, wakaf</li>
            <li><strong>Data Pembayaran:</strong> Bukti transfer, ID transaksi</li>
            <li><strong>Data Lokasi:</strong> Koordinat geografis (untuk pemetaan penerima bantuan)</li>
            <li><strong>Data Teknis:</strong> Alamat IP, jenis browser, cookie sesi</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">3. Dasar Hukum Pemrosesan</h2>
          <p>Kami memproses data pribadi berdasarkan:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Kewajiban hukum</strong> — pencatatan zakat dan laporan keuangan masjid sesuai syariah dan peraturan negara</li>
            <li><strong>Kepentingan publik</strong> — penyaluran zakat, infaq, sedekah kepada mustahik yang berhak</li>
            <li><strong>Kepentingan sah</strong> — pengelolaan data mustahik dan donatur untuk program pemberdayaan ekonomi</li>
            <li><strong>Persetujuan eksplisit</strong> — untuk data NIK dan data keluarga yang termasuk data pribadi spesifik</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">4. Keamanan Data</h2>
          <p>Kami menerapkan langkah-langkah keamanan berikut:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Enkripsi NIK:</strong> Semua NIK dienkripsi menggunakan AES-256-GCM (Advanced Encryption Standard 256-bit, Galois/Counter Mode). Hanya pengurus masjid yang berwenang yang dapat mendekripsinya</li>
            <li><strong>Hash NIK:</strong> Hash SHA-256 digunakan untuk deteksi duplikasi tanpa membuka data asli</li>
            <li><strong>Autentikasi:</strong> Akses ke data sensitif memerlukan login dengan peran tertentu (superadmin, admin_dkm, social_lead, finance_director)</li>
            <li><strong>Enkripsi Transport:</strong> Semua koneksi menggunakan HTTPS/TLS 1.3</li>
            <li><strong>Log Audit:</strong> Setiap perubahan data sensitif dicatat dengan detail</li>
            <li><strong>RBAC:</strong> Role-based access control membatasi akses berdasarkan tugas pengurus</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">5. Penggunaan Data</h2>
          <p>Data pribadi digunakan untuk:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Verifikasi kelayakan penerima zakat, infaq, sedekah, dan wakaf (ZISWAF)</li>
            <li>Penyaluran bantuan tepat sasaran</li>
            <li>Pencatatan dan pelaporan keuangan masjid yang transparan</li>
            <li>Pemetaan lokasi penerima bantuan untuk optimalisasi distribusi</li>
            <li>Komunikasi terkait program masjid (melalui WhatsApp/telepon dengan persetujuan)</li>
            <li>Pemenuhan kewajiban pelaporan kepada Badan Amil Zakat Nasional (BAZNAS)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">6. Pembagian Data dengan Pihak Ketiga</h2>
          <p>Kami tidak menjual data pribadi Anda. Data hanya dibagikan dalam kondisi:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Payment Gateway (Midtrans):</strong> Untuk pemrosesan donasi online — data yang dikirim terbatas pada nama, email, dan nominal donasi</li>
            <li><strong>Cloudflare:</strong> CDN dan keamanan infrastruktur — data teknis (IP, cookie sesi)</li>
            <li><strong>Badan Amil Zakat Nasional:</strong> Data agregat mustahik untuk laporan (tanpa NIK dan alamat detail)</li>
            <li><strong>Pihak berwajib:</strong> Atas permintaan hukum yang sah</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">7. Hak Anda</h2>
          <p>Berdasarkan UU PDP, Anda berhak untuk:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mengetahui jenis data yang kami kumpulkan (transparansi)</li>
            <li>Meminta akses ke data pribadi Anda yang kami simpan</li>
            <li>Meminta koreksi jika data tidak akurat</li>
            <li>Meminta penghapusan data (dengan batasan tertentu sesuai ketentuan hukum)</li>
            <li>Menarik persetujuan pemrosesan data</li>
            <li>Mengajukan keberatan atas pemrosesan data</li>
            <li>Mengajukan pengaduan ke Kementerian Komunikasi dan Informatika</li>
          </ul>
          <p className="mt-3">Untuk menggunakan hak-hak di atas, hubungi Pengurus Masjid melalui kontak di bawah.</p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">8. Retensi Data</h2>
          <p>
            Data pribadi disimpan selama diperlukan untuk tujuan pengelolaan masjid dan
            pemberdayaan masyarakat, atau selama diwajibkan oleh ketentuan perundang-undangan
            (minimal 5 tahun untuk data keuangan). Data yang tidak lagi diperlukan akan dihapus
            atau dianonimkan.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">9. Perubahan Kebijakan</h2>
          <p>
            Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui
            platform Masjid Hub dan berlaku efektif sejak tanggal publikasi.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">10. Kontak</h2>
          <p>
            Untuk pertanyaan, permintaan akses, koreksi, atau penghapusan data, hubungi:
          </p>
          <div className="bg-surface p-4 rounded-xl mt-2 space-y-1 text-sm">
            <p><strong>Sekretariat Masjid Jami' At-Taqwa Ulujami</strong></p>
            <p>Jl. Masjid At-Taqwa No. 1, RT 01/RW 05, Ulujami, Pesanggrahan</p>
            <p>Jakarta Selatan, DKI Jakarta 12250</p>
            <p>Telp: 021-7359876 / 0812-9988-7766</p>
            <p>Email: info@masjidattaqwa-ulujami.or.id</p>
          </div>
        </section>

      </div>
    </div>
  );
}
