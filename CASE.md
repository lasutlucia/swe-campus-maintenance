# Laporan Pengumpulan & Refleksi Tugas Software Engineering

## Informasi Mahasiswa & Repositori

- **Nama**: Lucia Lasut
- **NIM**: 1234567890 (Silakan sesuaikan dengan NIM asli Anda)
- **Kelas**: Software Engineering
- **Anggota tim**: Individu
- **Repository URL**: https://github.com/lasutlucia/SWE-campus-maintenance
- **Cloudflare URL**: https://campus-maintenance.lasutlucia.workers.dev
- **Commit Terakhir**: `9679b4d`
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
Fitur *Interactive Multi-Role Switcher* pada panel atas header halaman web. Fitur ini dirancang khusus untuk memfasilitasi kemudahan pengujian manual oleh dosen atau reviewer agar bisa berganti identitas aktor secara dinamis tanpa harus melakukan alur login manual yang kompleks.

### 4. Test apa yang gagal dan apa penyebabnya?
Pengujian unit pada kasus `2. Harus menolak deskripsi yang terlalu pendek (< 20 karakter)` di file `tests/unit/request-validation.test.ts` awalnya gagal. Penyebabnya adalah string uji `"Lampu padam sejak pagi"` memiliki panjang 22 karakter (>= 20), sehingga fungsi validasi menganggapnya sah (mengembalikan `true`), padahal test case mengharapkan hasil `false`.

### 5. Perubahan apa yang dilakukan setelah human review?
- Mengubah string pengujian deskripsi pendek menjadi `"Lampu kelas padam"` (17 karakter) agar test case berhasil lulus.
- Memisahkan berkas konfigurasi pengujian menjadi `vitest.config.ts` untuk mengisolasi `@cloudflare/vite-plugin` agar tidak memblokir inisialisasi lingkungan testing Vitest.

### 6. Mengapa output AI tidak boleh langsung dianggap benar?
Karena AI dapat memunculkan "halusinasi" kecil berupa kesalahan sintaksis, kesalahan perhitungan logika sederhana, atau konflik dependensi pustaka. Tanpa review dan verifikasi langsung oleh manusia melalui proses kompilasi build, pengetesan otomatis, dan peninjauan kode, kesalahan-kesalahan kecil tersebut dapat membuat aplikasi gagal berjalan di server produksi.

### 7. Bagaimana traceability membantu proyek?
Traceability (matriks penelusuran) membantu memastikan bahwa setiap kebutuhan fungsional (FR) yang didefinisikan di awal benar-benar diwujudkan dalam baris kode sumber, dilacak perkembangannya melalui isu GitHub, dan teruji secara sah oleh minimal satu skenario pengujian otomatis. Ini mencegah adanya fitur yang terlewat atau kode liar yang di luar lingkup kebutuhan proyek.

### 8. Apa yang akan diperbaiki jika proyek diulang?
Jika proyek diulang dari awal, saya akan membuat berkas konfigurasi test runner terpisah (`vitest.config.ts`) sejak langkah awal inisialisasi proyek dan menulis draf tabel relasi database SQL relasional lebih awal sebelum mulai membuat file router backend, guna menghindari penyesuaian skema di tengah tahap koding.
