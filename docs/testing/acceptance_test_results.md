# Acceptance Test Results - Campus Service Request and Maintenance System

Dokumen ini mendokumentasikan hasil pengujian terima (*acceptance testing*) secara manual untuk memastikan siklus hidup laporan berjalan lancar.

---

## Log Skenario Pengujian End-to-End

### Skenario 1: Siklus Hidup Laporan (Submitted -> Closed)

- **Tujuan**: Memastikan laporan kerusakan AC di kelas dapat dilaporkan, diproses oleh admin, diselesaikan oleh teknisi, dan ditutup oleh admin.
- **Langkah-langkah Uji**:
  1. Pilih peran **Pelapor** di Role Switcher.
  2. Isi form: Judul: `AC Ruang B302 Mati Total`, Deskripsi: `AC di kelas B302 mati total sejak jam 10 pagi, ruangan menjadi sangat panas dan pengap. Mohon diperbaiki sebelum jam kuliah berikutnya.`, Lokasi: `Gedung B, Ruang 302`, Kategori: `AC`. Klik **Kirim Pengaduan**.
     - *Hasil*: Muncul alert sukses dan nomor tiket pengaduan unik `CSR-xxxx` terdaftar di tabel dengan status `SUBMITTED` dan prioritas default `MEDIUM`. **(PASS)**
  3. Klik baris laporan baru tersebut untuk membuka detail laporan di bagian bawah.
  4. Ganti peran ke **Administrator** via Role Switcher.
  5. Pada panel detail laporan, klik tombol **Mulai Review Laporan**.
     - *Hasil*: Status laporan berubah menjadi `UNDER REVIEW` dan terekam di log aktivitas. **(PASS)**
  6. Ubah dropdown prioritas menjadi `HIGH`.
     - *Hasil*: Prioritas ter-update menjadi `HIGH` di database. **(PASS)**
  7. Pada dropdown Tugaskan Teknisi, pilih `Budi (Teknisi)`.
     - *Hasil*: Status laporan otomatis berubah menjadi `ASSIGNED` dan nama teknisi tertera pada info detail. **(PASS)**
  8. Ganti peran ke **Teknisi: Budi** via Role Switcher.
     - *Hasil*: Daftar laporan menyaring dan hanya menampilkan laporan yang ditugaskan ke Budi. **(PASS)**
  9. Klik detail laporan tersebut, lalu klik tombol **Mulai Bekerja (In Progress)**.
     - *Hasil*: Status laporan berubah menjadi `IN PROGRESS`. Log aktivitas terekam. **(PASS)**
  10. Tulis komentar: `"Kami sedang memeriksa kompresor AC di lapangan."` dan klik **Kirim**.
      - *Hasil*: Komentar tersimpan dan langsung terlampir di panel diskusi komentar secara kronologis. **(PASS)**
  11. Setelah selesai memperbaiki AC, klik tombol **Tandai Selesai (Resolved)**.
      - *Hasil*: Status laporan berubah menjadi `RESOLVED`. **(PASS)**
  12. Ganti peran ke **Pelapor** via Role Switcher.
      - *Hasil*: Pelapor melihat status laporan telah menjadi `RESOLVED`. Pelapor menambahkan komentar: `"Terima kasih, AC sekarang sudah dingin kembali."` **(PASS)**
  13. Ganti peran ke **Administrator** via Role Switcher.
      - *Hasil*: Admin melihat komentar dari pelapor. Admin menekan tombol **Tutup Tiket Laporan (Closed)**.
      - *Hasil Akhir*: Status laporan menjadi `CLOSED` (Selesai). Tombol aksi terkunci. **(PASS)**

---

## Verifikasi Persistensi Data
- **Langkah Uji**: Segera setelah status laporan berubah menjadi `CLOSED`, lakukan penyegaran (*refresh*) halaman browser (F5).
- **Hasil**: Seluruh data pengaduan, log riwayat status, dan diskusi komentar tetap tampil secara utuh tanpa ada kehilangan data. Hal ini memverifikasi bahwa data telah terintegrasi secara persisten pada Cloudflare D1 SQL. **(PASS)**
