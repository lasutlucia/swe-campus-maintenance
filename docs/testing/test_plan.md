# Test Plan - Campus Service Request and Maintenance System

Dokumen ini mendeskripsikan rencana pengujian sistem (*test plan*) untuk memastikan keandalan fungsionalitas dan ketaatan terhadap aturan bisnis.

## Metode Pengujian

1. **Unit Testing (Automated)**:
   - Dilakukan menggunakan runner **Vitest** di lingkungan Node.js.
   - Menguji kebenaran fungsi penunjang seperti validasi teks input dan evaluasi hak akses peran aktor (Total 20 test cases).
2. **Acceptance Testing (Manual)**:
   - Dilakukan dengan menyimulasikan peran masing-masing aktor langsung pada antarmuka web yang terintegrasi database D1.

---

## Daftar Skenario Unit Test (Automated)

### 1. Validasi Pembuatan Laporan Baru (FR-02)
- **UT-01 (Harus menolak deskripsi kosong)**: Menguji bahwa string kosong tidak diperbolehkan.
- **UT-02 (Harus menolak deskripsi pendek)**: Menguji deskripsi < 20 karakter ditolak.
- **UT-03 (Harus menerima deskripsi pas 20 karakter)**: Menguji deskripsi 20 karakter diterima.
- **UT-04 (Harus menerima deskripsi panjang)**: Menguji deskripsi > 20 karakter diterima.
- **UT-05 (Harus menolak judul kosong)**: Menjamin judul wajib diisi.
- **UT-06 (Harus menerima judul valid)**: Memastikan judul teks normal diterima.
- **UT-07 (Harus menolak lokasi kosong)**: Menjamin lokasi wajib diisi.
- **UT-08 (Harus menerima lokasi valid)**: Memastikan lokasi teks normal diterima.
- **UT-09 (Harus menolak kategori kosong)**: Menjamin kategori wajib diisi.
- **UT-10 (Harus menerima kategori diperbolehkan)**: Hanya kategori AC, Listrik, Internet, Kebersihan, Sipil yang valid.

### 2. Aturan Bisnis & Perizinan (BR-01 s.d BR-05)
- **UT-11 (Hanya Admin yang dapat mengubah prioritas)**: Menolak perubahan prioritas oleh Pelapor/Teknisi.
- **UT-12 (Hanya Admin yang dapat mengubah kategori)**: Menolak perubahan kategori oleh Pelapor/Teknisi.
- **UT-13 (Hanya Admin yang dapat menugaskan teknisi)**: Menolak penugasan teknisi oleh Pelapor/Teknisi.
- **UT-14 (Admin dapat menutup laporan RESOLVED)**: Mengizinkan transisi status `RESOLVED` -> `CLOSED` oleh Admin.
- **UT-15 (Admin tidak dapat menutup laporan NON-RESOLVED)**: Melarang transisi status `IN PROGRESS` -> `CLOSED` oleh Admin.
- **UT-16 (Aktor non-Admin tidak dapat menutup laporan)**: Melarang Pelapor/Teknisi menutup laporan.
- **UT-17 (Teknisi dapat mengubah tugas miliknya)**: Mengizinkan Teknisi Budi mengubah status tugas yang ditugaskan ke Budi.
- **UT-18 (Teknisi tidak dapat mengubah tugas orang lain)**: Melarang Teknisi Agus mengubah status tugas yang ditugaskan ke Budi.
- **UT-19 (Mengizinkan transisi status valid)**: Memverifikasi kebenaran alur status logis.
- **UT-20 (Menolak transisi status tidak valid)**: Menjamin status tidak bisa melompat dari Submitted langsung ke Closed.

---

## Eksekusi Pengujian Otomatis
Pengujian dijalankan secara lokal dengan perintah:
```bash
npm run test -- --run
```
