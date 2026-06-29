# GitHub Issues - Campus Service Request and Maintenance System

Dokumen ini mendokumentasikan 10 GitHub Issues yang dibuat untuk melacak tugas pengembangan fitur wajib sesuai dengan template yang disyaratkan.

---

## 1. Issue #1: [FR-01] Pembuatan Laporan Baru
### Requirement
- FR-01: Pelapor dapat membuat laporan baru dengan menginput aduan laporan (judul), deskripsi, lokasi gedung, dan lokasi ruangan secara terpisah.
### User Story
- US-01: Sebagai Pelapor, saya ingin melaporkan masalah fasilitas agar kerusakan segera diperbaiki.
### Acceptance Criteria
- AC-01-01: Halaman menyediakan form dengan input: Laporan Kerusakan (Judul), Deskripsi Masalah, Lokasi Gedung, dan Lokasi Ruangan secara terpisah.
- AC-01-02: Sistem menggabungkan lokasi gedung dan ruangan di latar belakang serta mengembalikan pesan error jika ada field kosong atau deskripsi < 20 karakter.
### Pekerjaan
- [x] Buat form pelaporan di frontend (`src/App.tsx`).
- [x] Buat endpoint `POST /api/requests` di backend (`worker/index.ts`).
- [x] Simpan data laporan baru ke database D1.
- [x] Buat unit test pendaftaran laporan.
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 2. Issue #2: [FR-02] Validasi Input Laporan
### Requirement
- FR-02: Sistem harus memvalidasi bahwa semua field wajib terisi dan deskripsi minimal terdiri dari 20 karakter.
### User Story
- US-01: Sebagai Pelapor, saya ingin melaporkan masalah fasilitas agar kerusakan segera diperbaiki.
### Acceptance Criteria
- AC-01-02: Sistem mengembalikan pesan error jika ada field kosong atau deskripsi < 20 karakter.
### Pekerjaan
- [x] Implementasikan validasi input di frontend form.
- [x] Implementasikan validasi payload JSON di API backend (`worker/index.ts`).
- [x] Tampilkan pesan kesalahan yang deskriptif ke pengguna.
- [x] Buat unit test validasi deskripsi (minimal 20 karakter).
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 3. Issue #3: [FR-03] Daftar Laporan
### Requirement
- FR-03: Sistem menampilkan daftar semua laporan dengan status, kategori, prioritas, dan tanggal pembuatannya.
### User Story
- US-02: Sebagai Pelapor, saya ingin melihat daftar laporan yang pernah saya buat untuk memantau perkembangannya.
- US-04: Sebagai Administrator, saya ingin melihat daftar seluruh laporan yang dikirim civitas akademika agar bisa dikelola.
### Acceptance Criteria
- AC-02-01: Halaman menampilkan list laporan milik pengguna beserta nomor laporan unik `CSR-xxxx`, judul, lokasi, status, dan prioritasnya.
- AC-04-01: Halaman Administrator menampilkan seluruh daftar laporan dari semua pelapor.
### Pekerjaan
- [x] Rancang komponen tabel daftar laporan di frontend (`src/App.tsx`).
- [x] Buat endpoint `GET /api/requests` di backend (`worker/index.ts`).
- [x] Ambil data dari tabel `service_requests` di database D1.
- [x] Buat unit test pengambilan daftar.
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 4. Issue #4: [FR-04] Pencarian dan Penyaringan
### Requirement
- FR-04: Pengguna dapat mencari laporan berdasarkan kata kunci judul/lokasi dan menyaring berdasarkan kategori, prioritas, atau status.
### User Story
- US-04: Sebagai Administrator, saya ingin menyaring daftar seluruh laporan agar mempermudah pemantauan.
### Acceptance Criteria
- AC-04-02: Admin dapat melakukan penyaringan berdasarkan kategori dan status secara bersamaan di UI.
### Pekerjaan
- [x] Tambahkan input pencarian teks dan dropdown filter kategori/status di frontend.
- [x] Implementasikan parameter query string (`search`, `status`, `category`) di API backend.
- [x] Modifikasi kueri SQL di backend agar menyaring data secara dinamis.
- [x] Uji filter pencarian.
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 5. Issue #5: [FR-05] Detail Laporan
### Requirement
- FR-05: Sistem menampilkan detail lengkap dari laporan terpilih, termasuk riwayat perubahan status dan komentar.
### User Story
- US-02: Sebagai Pelapor, saya ingin melihat detail laporan untuk memantau progres detail perbaikan.
### Acceptance Criteria
- AC-02-02: Halaman detail menampilkan informasi detail, riwayat status, dan komentar secara real-time.
### Pekerjaan
- [x] Rancang tampilan panel detail laporan di frontend.
- [x] Buat endpoint `GET /api/requests/:id` di backend Workers.
- [x] Lakukan query relasional ke tabel `service_requests`, `comments`, dan `status_history`.
- [x] Buat unit test detail laporan.
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 6. Issue #6: [FR-06 & FR-07] Peninjauan Laporan & Penentuan Prioritas
### Requirement
- FR-06: Administrator dapat menandai laporan baru sebagai `Under Review` saat mulai memeriksa detail keluhan.
- FR-07: Administrator dapat menentukan prioritas laporan menjadi `LOW`, `MEDIUM`, atau `HIGH`.
### User Story
- US-05: Sebagai Administrator, saya ingin mengubah status laporan menjadi 'Under Review' dan menetapkan prioritasnya agar penanganan lebih terstruktur.
### Acceptance Criteria
- AC-05-01: Admin dapat mengklik tombol "Start Review" untuk mengubah status laporan dari `SUBMITTED` menjadi `UNDER REVIEW`.
- AC-05-02: Admin dapat mengubah tingkat prioritas laporan via dropdown pilihan `LOW`, `MEDIUM`, atau `HIGH`.
### Pekerjaan
- [x] Sediakan tombol review dan dropdown prioritas di panel admin frontend.
- [x] Buat endpoint `PUT /api/requests/:id/status` di backend.
- [x] Terapkan aturan bisnis BR-02 (Hanya Admin yang dapat mengubah prioritas).
- [x] Catat perubahan status ke log `status_history`.
- [x] Buat unit test otorisasi role Admin untuk perubahan prioritas.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 7. Issue #7: [FR-08] Penugasan Teknisi
### Requirement
- FR-08: Administrator dapat menugaskan teknisi spesifik ke laporan yang sedang ditinjau.
### User Story
- US-06: Sebagai Administrator, saya ingin menugaskan teknisi tertentu ke laporan yang sedang ditinjau agar perbaikan dapat dieksekusi.
### Acceptance Criteria
- AC-06-01: Detail laporan berstatus `UNDER REVIEW` menyediakan opsi dropdown nama teknisi.
- AC-06-02: Setelah Admin memilih teknisi, status laporan otomatis berubah menjadi `ASSIGNED`.
### Pekerjaan
- [x] Tambahkan dropdown penugasan teknisi di frontend.
- [x] Hubungkan dropdown ke API update status.
- [x] Implementasikan logika auto-transition status ke `ASSIGNED` di backend saat teknisi terpilih.
- [x] Buat unit test penugasan teknisi.
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 8. Issue #8: [FR-09] Pembaruan Progres Kerja
### Requirement
- FR-09: Teknisi dapat mengubah status laporan yang ditugaskan padanya menjadi `In Progress` atau `Resolved`.
### User Story
- US-07: Sebagai Teknisi, saya ingin melihat daftar tugas yang ditugaskan kepada saya.
- US-08: Sebagai Teknisi, saya ingin memperbarui progres tugas agar pelapor mengetahui perkembangan perbaikan.
### Acceptance Criteria
- AC-07-01: Halaman Teknisi menampilkan daftar tugas yang ditugaskan ke namanya.
- AC-08-01: Tombol "Mulai Bekerja" mengubah status laporan menjadi `IN PROGRESS`.
- AC-08-02: Tombol "Selesai Perbaikan" mengubah status laporan menjadi `RESOLVED`.
### Pekerjaan
- [x] Buat filter di frontend berdasarkan nama teknisi yang aktif.
- [x] Tampilkan tombol aksi khusus teknisi di panel detail.
- [x] Implementasikan aturan bisnis BR-05 (Teknisi hanya dapat memperbarui tugas miliknya sendiri).
- [x] Buat unit test validasi izin pengerjaan teknisi.
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 9. Issue #9: [FR-10 & FR-11] Penambahan Komentar & Riwayat Status
### Requirement
- FR-10: Pelapor, Administrator, dan Teknisi dapat menambahkan komentar atau catatan pada laporan.
- FR-11: Sistem harus mencatat dan menampilkan log perubahan status laporan secara kronologis.
### User Story
- US-03: Sebagai Pelapor, saya ingin mengirim komentar pada detail laporan untuk memberikan info tambahan.
- US-09: Sebagai Pengguna, saya ingin melihat log riwayat status laporan agar alur penanganan transparan.
### Acceptance Criteria
- AC-03-02: Komentar yang dikirim langsung tersimpan di database dan muncul secara kronologis.
- AC-09-02: Log aktivitas mencantumkan format perubahan status yang tepat.
### Pekerjaan
- [x] Buat UI kolom komentar dan komponen timeline log riwayat status di frontend.
- [x] Buat endpoint `POST /api/requests/:id/comments` di backend.
- [x] Hubungkan frontend dengan headers `X-User-Role` dan `X-User-Name`.
- [x] Terapkan aturan bisnis BR-04 (Komentar tidak dapat diedit/dihapus).
- [x] Jalankan pengujian logs.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.

---

## 10. Issue #10: [FR-12] Penutupan Laporan
### Requirement
- FR-12: Administrator dapat menutup laporan yang telah selesai (`Closed`) atau membukanya kembali (`Reopened`).
### User Story
- US-10: Sebagai Administrator, saya ingin menutup laporan secara resmi setelah perbaikan dikonfirmasi agar statusnya final.
### Acceptance Criteria
- AC-10-01: Pada detail laporan berstatus `RESOLVED`, Administrator dapat menekan tombol "Tutup Laporan".
- AC-10-02: Tindakan tersebut mengubah status menjadi `CLOSED` dan memblokir modifikasi status lebih lanjut.
### Pekerjaan
- [x] Sediakan tombol "Tutup Laporan" (Close Report) di frontend untuk Admin.
- [x] Implementasikan aturan bisnis BR-03 (Laporan hanya dapat ditutup setelah statusnya `RESOLVED`) di backend.
- [x] Catat perubahan status ke log `status_history`.
- [x] Buat unit test validasi aturan penutupan laporan.
- [x] Update traceability matrix.
### Selesai Jika
- [x] Acceptance criteria terpenuhi.
- [x] Test lulus.
- [x] Human review selesai.
