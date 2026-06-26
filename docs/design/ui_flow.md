# UI Flow - Campus Service Request and Maintenance System

Dokumen ini mendeskripsikan alur antarmuka pengguna (UI Flow) dan perubahan status halaman untuk masing-masing peran aktor.

## Navigasi Global
Halaman web menggunakan header statis yang memuat **Role Switcher** di bagian kanan atas. Tombol switcher ini mensimulasikan sesi pengguna yang aktif. Berpindah peran akan secara dinamis menyembunyikan/menampilkan komponen yang relevan di bawah ini:

```
                  ┌───────────────────────────────┐
                  │          Role Switcher        │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┼─────────────────────────┐
         ▼                       ▼                         ▼
    [Pelapor UI]              [Admin UI]              [Teknisi UI]
  - Form Kirim Laporan      - List Semua Laporan     - List Tugas Khusus
  - List Laporan Saya       - Filter & Pencarian     - Tombol Mulai Kerja
  - Kolom Komentar          - Dropdown Prioritas     - Tombol Selesai
                            - Assign Teknisi
                            - Tombol Close Tiket
```

## Alur Halaman Per Aktor

### 1. Alur Pelapor
1. Pengguna membuka halaman web utama.
2. Pada panel kiri, Pelapor mengisi form pengaduan (Judul, Deskripsi, Lokasi, Kategori) lalu menekan tombol **Kirim Pengaduan**.
3. Laporan yang dikirim akan langsung muncul di panel sebelah kanan pada **Daftar Laporan Pengaduan** dengan status `SUBMITTED`.
4. Pelapor dapat mengklik baris laporan untuk membuka panel **Detail Laporan** di bagian bawah.
5. Di dalam panel detail, Pelapor dapat melihat status, riwayat penanganan, komentar yang ada, serta menuliskan komentar baru pada kolom komentar.

### 2. Alur Administrator
1. Admin memilih peran "Administrator" pada switcher.
2. Halaman memuat daftar seluruh laporan dari semua civitas akademika.
3. Admin melakukan pencarian atau penyaringan menggunakan input teks dan dropdown filter di panel daftar.
4. Admin mengklik salah satu laporan baru untuk membuka **Detail Laporan**.
5. Pada detail laporan berstatus `SUBMITTED`, Admin mengklik tombol **Mulai Review Laporan** (status berubah menjadi `UNDER REVIEW`).
6. Admin menyesuaikan tingkat prioritas (`LOW`/`MEDIUM`/`HIGH`) dan kategori jika dirasa kurang sesuai.
7. Admin menugaskan teknisi pelaksana perbaikan via dropdown. Tindakan ini secara otomatis mengubah status menjadi `ASSIGNED`.
8. Setelah teknisi menyelesaikan pekerjaan (status `RESOLVED`), Admin meninjau perbaikan lalu menekan tombol **Tutup Tiket Laporan (Closed)** untuk menutup tiket (status menjadi `CLOSED`).

### 3. Alur Teknisi
1. Teknisi memilih peran "Teknisi: Budi" atau "Teknisi: Agus" pada switcher.
2. Halaman secara dinamis menyaring dan memuat hanya laporan yang ditugaskan ke nama teknisi tersebut.
3. Teknisi mengklik laporan berstatus `ASSIGNED` untuk membuka **Detail Laporan**.
4. Teknisi mengklik tombol **Mulai Bekerja (In Progress)** untuk menandai pekerjaan dimulai (status berubah menjadi `IN PROGRESS`).
5. Setelah perbaikan selesai di lapangan, Teknisi mengklik tombol **Tandai Selesai (Resolved)** (status berubah menjadi `RESOLVED`).
6. Teknisi dapat menulis komentar teknis di kolom komentar untuk melapor kendala atau detail suku cadang.

### 4. Alur Manajer Fasilitas
1. Manajer memilih peran "Manajer Fasilitas" pada switcher.
2. Halaman memuat tiga kartu statistik utama:
   - **Total Pengaduan**: Keseluruhan laporan.
   - **Dalam Penanganan**: Laporan berstatus Under Review, Assigned, dan In Progress.
   - **Selesai / Ditutup**: Laporan berstatus Resolved dan Closed.
3. Manajer Fasilitas dapat memantau data seluruh laporan melalui tabel ringkasan yang tersedia. Tampilan ini bersifat *read-only* (tidak menyediakan tombol aksi).
