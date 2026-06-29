# Laporan Pengumpulan & Refleksi Tugas Software Engineering

## Informasi Mahasiswa & Repositori

- **Nama**: Lucia Lasut
- **NIM**: 1234567890 (Silakan sesuaikan dengan NIM asli Anda)
- **Kelas**: Software Engineering
- **Anggota tim**: Individu
- **Repository URL**: https://github.com/lasutlucia/SWE-campus-maintenance
- **Cloudflare URL**: https://campus-maintenance.lasutlucia.workers.dev
- **Commit Terakhir**: Lihat di repositori GitHub (Cabang `main`)
- **Jumlah Test**: 20 automated tests (semuanya PASS)
- **AI yang Digunakan**: Antigravity (Google DeepMind Team)
- **Known Limitations (Keterbatasan Sistem)**:
  1. Fitur unggah gambar ditiadaan sesuai spesifikasi untuk menghindari penggunaan object storage eksternal berbayar.
  2. Sistem login menggunakan kueri langsung ke database D1 Cloudflare (tabel `users`) dengan input username dan password masing-masing role secara aman.
  3. Log aktivitas riwayat status disimpan dalam tabel log, namun tidak mencakup pengiriman notifikasi email real-time.

---

## Jawaban Pertanyaan Refleksi

### 1. Bagian mana yang paling membantu ketika menggunakan AI?
Bagian yang paling membantu adalah ketika menulis boilerplate kode backend Cloudflare Worker relasional di `worker/index.ts` dan mendesain estetika antarmuka UI dengan Vanilla CSS di `src/App.css`. AI dapat menghasilkan struktur dasar yang sangat cepat, rapi, dan responsif dengan integrasi D1.

### 2. Kesalahan apa yang paling sering dibuat AI?
Kesalahan berupa perhitungan logika kecil yang tidak akurat, seperti salah menghitung panjang string teks uji pada kasus uji validasi deskripsi (mengira string sepanjang 22 karakter hanya 18 karakter), serta ketidakcocokan konfigurasi saat menggabungkan plugin Cloudflare dengan Vitest dalam satu berkas `vite.config.ts`.

### 3. Fitur apa yang pernah dibuat AI tetapi tidak terdapat pada requirement?
Beberapa fitur tambahan yang dibuat AI secara inisiatif di luar spesifikasi tugas adalah:
1. **Fitur Pengalih Tema (Dark/Light Mode Toggle)**: Tombol pengubah warna tema antarmuka antara mode gelap neon futuristik dan mode terang minimalis, tersimpan otomatis di `localStorage`.
2. **Indikator Progres Karakter Deskripsi**: Bar animasi dinamis di bawah form deskripsi kerusakan yang mengisi secara real-time dan berubah warna menjadi hijau centang saat mencapai 20 karakter.
3. **Efek Denyut Pulsasi Baris Pencarian (Pulsing Search Highlights)**: Animasi baris tabel yang bersinar redup-terang (*pulsing*) untuk menandai kecocokan kata kunci pencarian (misal kata kunci "AC") sebagai isyarat visual (ilusi fokus).
4. **Animasi Guncangan Panel Gagal Login (Shake Error)**: Animasi guncang kartun pada kartu panel login saat nama pengguna/kata sandi salah divalidasi ke database D1.

### 4. Test apa yang gagal dan apa penyebabnya?
Pengujian unit pada kasus `2. Harus menolak deskripsi yang terlalu pendek (< 20 karakter)` di file `tests/unit/request-validation.test.ts` awalnya gagal. Penyebabnya adalah string uji `"Lampu padam sejak pagi"` memiliki panjang 22 karakter (>= 20), sehingga fungsi validasi menganggapnya sah (mengembalikan `true`), padahal test case mengharapkan hasil `false`.

### 5. Perubahan apa yang dilakukan setelah human review?
Setelah peninjauan langsung oleh pengguna (*human review*), dilakukan serangkaian penyesuaian fungsionalitas dan desain:
1. **Pemisahan Kolom Lokasi**: Memisahkan input Lokasi menjadi kolom "Gedung" dan "Ruangan" terpisah agar pelaporan lebih terperinci.
2. **Label Laporan Kerusakan**: Mengubah kolom "Judul Laporan" menjadi "Laporan Kerusakan" dan menghapus isian dropdown Kategori dari sisi Pelapor agar isian pelaporan bersifat deskriptif dan bebas.
3. **Pembersihan Dashboard Pelapor**: Menyembunyikan filter "Semua Kategori" dan "Semua Status" dari tabel Pelapor agar visualisasi fokus, serta mengaktifkan klik baris (*row click*) sederhana agar Pelapor dapat berdiskusi melalui kolom komentar terintegrasi.
4. **Tombol Komentar Ikonik**: Menambahkan aksi tombol ikon balon obrolan `💬 Komentar` langsung pada baris tabel agar pengguna tahu detail laporan dapat diklik untuk berdiskusi lintas peran secara real-time.
5. **Zona Waktu WITA**: Memperbaiki parsing jam pembuatan laporan, log audit, dan komentar ke zona waktu WITA (UTC+8) secara konsisten.
6. **Sinkronisasi Real-Time (4 Detik Polling)**: Menerapkan penarikan data berkala di latar belakang setiap 4 detik pada tabel dan detail komentar agar laporan baru dan balasan terupdate seketika di semua aktor tanpa refresh manual.
7. **Delegasi Otoritas Prioritas**: Mengubah prioritas default laporan baru menjadi `NONE` dan memindahkan dropdown penentuan prioritas (LOW/MEDIUM/HIGH) dari halaman Admin ke wewenang eksklusif Teknisi yang ditugaskan di lapangan.
8. **Perbaikan Layout & Otentikasi**: Menghapus garis pembatas vertikal kiri-kanan root layout agar dashboard membentang 100% simetris, memetakan login peran `Manajer Fasilitas` D1 secara presisi, serta menonaktifkan pembukaan detail otomatis saat pencarian dilakukan untuk kenyamanan mengetik.
9. **Penyesuaian Branding**: Mengubah teks branding nama aplikasi dari "Campus Portal" menjadi "Campus Maintenance" dan menyederhanakan nama peran "Administrator Sarpras" menjadi "Administrator" saja di seluruh repositori.

### 6. Mengapa output AI tidak boleh langsung dianggap benar?
Karena AI dapat memunculkan "halusinasi" kecil berupa kesalahan sintaksis, kesalahan perhitungan logika sederhana, atau konflik dependensi pustaka. Tanpa review dan verifikasi langsung oleh manusia melalui proses kompilasi build, pengetesan otomatis, dan peninjauan kode, kesalahan-kesalahan kecil tersebut dapat membuat aplikasi gagal berjalan di server produksi.

### 7. Bagaimana traceability membantu proyek?
Traceability (matriks penelusuran) membantu memastikan bahwa setiap kebutuhan fungsional (FR) yang didefinisikan di awal benar-benar diwujudkan dalam baris kode sumber, dilacak perkembangannya melalui isu GitHub, dan teruji secara sah oleh minimal satu skenario pengujian otomatis. Ini mencegah adanya fitur yang terlewat atau kode liar yang di luar lingkup kebutuhan proyek.

### 8. Apa yang akan diperbaiki jika proyek diulang?
Jika proyek diulang dari awal, saya akan membuat berkas konfigurasi test runner terpisah (`vitest.config.ts`) sejak langkah awal inisialisasi proyek dan menulis draf tabel relasi database SQL relasional lebih awal sebelum mulai membuat file router backend, guna menghindari penyesuaian skema di tengah tahap koding.
