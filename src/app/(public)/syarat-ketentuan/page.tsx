export const metadata = {
  title: "Syarat & Ketentuan",
  description: "Syarat dan ketentuan penggunaan platform digital Masjid Jami' At-Taqwa Ulujami",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display font-bold text-3xl text-ink mb-2">Syarat & Ketentuan</h1>
      <p className="text-sm text-muted mb-8">Terakhir diperbarui: 4 Juli 2026</p>

      <div className="prose prose-sm max-w-none space-y-6 text-ink/80">

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">1. Penerimaan Ketentuan</h2>
          <p>
            Dengan mengakses dan menggunakan platform Masjid Hub ("Platform"), Anda menyetujui
            syarat dan ketentuan ini. Jika Anda tidak setuju, jangan gunakan Platform ini.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">2. Definisi</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Platform:</strong> Sistem informasi Masjid Hub yang dikelola Masjid Jami' At-Taqwa Ulujami</li>
            <li><strong>Pengurus:</strong> Anggota DKM (Dewan Kemakmuran Masjid) yang memiliki akses ke sistem</li>
            <li><strong>Jamaah:</strong> Pengguna umum yang mengakses halaman publik Platform</li>
            <li><strong>Donatur:</strong> Pihak yang memberikan donasi/zakat/infaq/sedekah/wakaf melalui Platform</li>
            <li><strong>Mustahik:</strong> Penerima manfaat zakat, infaq, sedekah, dan wakaf</li>
            <li><strong>Konten:</strong> Informasi yang disediakan melalui Platform termasuk teks, data keuangan, dan multimedia</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">3. Layanan Platform</h2>
          <p>Platform ini menyediakan layanan:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Informasi program dan kegiatan masjid</li>
            <li>Donasi online (ZISWAF) terintegrasi Midtrans</li>
            <li>Laporan keuangan transparan real-time</li>
            <li>Manajemen data mustahik dan donatur oleh pengurus</li>
            <li>Pemetaan penerima bantuan</li>
            <li>Sistem pinjaman Qardhul Hasan (Bank Infaq)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">4. Donasi Online</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Setiap donasi yang dilakukan melalui Platform adalah sah secara hukum dan syariah</li>
            <li>Donasi yang telah diproses tidak dapat dibatalkan, kecuali atas kebijakan pengurus masjid</li>
            <li>Masjid akan menyalurkan donasi sesuai dengan akad yang dipilih (zakat/infaq/sedekah/wakaf)</li>
            <li>Bukti donasi elektronik sah sebagai dokumen keuangan</li>
            <li>Donatur berhak mendapatkan laporan penyaluran donasi</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">5. Pengelolaan Data Mustahik</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Calon mustahik wajib memberikan data yang benar dan dapat dipertanggungjawabkan</li>
            <li>Data NIK dienkripsi dan hanya digunakan untuk verifikasi dan pelaporan</li>
            <li>Ketidakbenaran data dapat mengakibatkan pembatalan bantuan</li>
            <li>Mustahik setuju bahwa data ekonominya dapat diverifikasi oleh pengurus masjid</li>
            <li>Informasi mustahik bersifat rahasia dan hanya diketahui pengurus yang berwenang</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">6. Kewajiban Pengurus Masjid</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Menjaga kerahasiaan data mustahik, donatur, dan jamaah</li>
            <li>Menggunakan data hanya untuk kepentingan pengelolaan masjid</li>
            <li>Tidak menyalahgunakan akses untuk kepentingan pribadi</li>
            <li>Melaporkan jika terjadi pelanggaran data atau akses tidak sah</li>
            <li>Memastikan data keuangan akurat dan dapat diaudit</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">7. Kekayaan Intelektual</h2>
          <p>
            Seluruh konten, desain, kode, dan logo yang ada di Platform adalah milik Masjid Jami'
            At-Taqwa Ulujami. Dilarang menggunakan, menyalin, atau mendistribusikan konten Platform
            tanpa izin tertulis dari pengurus masjid.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">8. Batasan Tanggung Jawab</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Platform disediakan "sebagaimana adanya" tanpa jaminan operasi tanpa gangguan</li>
            <li>Masjid tidak bertanggung jawab atas kerugian akibat gangguan teknis di luar kendali kami</li>
            <li>Kami tidak bertanggung jawab atas konten tautan eksternal</li>
            <li>Kami berhak mengubah atau menghentikan layanan sewaktu-waktu dengan pemberitahuan</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">9. Akun Pengurus</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Akun pengurus bersifat pribadi dan tidak dapat dialihkan</li>
            <li>Pengurus bertanggung jawab penuh atas aktivitas akunnya</li>
            <li>Setiap akses diaudit dan dicatat dalam sistem log</li>
            <li>Akses dapat dicabut sewaktu-waktu oleh superadmin jika terjadi pelanggaran</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">10. Hukum yang Berlaku</h2>
          <p>
            Syarat dan ketentuan ini diatur oleh hukum Negara Republik Indonesia. Setiap sengketa
            akan diselesaikan secara musyawarah, dan jika tidak tercapai, melalui Pengadilan Negeri
            Jakarta Selatan.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-xl text-ink mt-8 mb-3">11. Hubungi Kami</h2>
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
