# Elicitation Notes - Campus Service Request and Maintenance System

Dokumen ini mencatat hasil dari proses pengumpulan kebutuhan (*elicitation*) dari berbagai stakeholder untuk memetakan masalah nyata dan solusi yang diinginkan.

## Hasil Wawancara Stakeholder

### 1. Pelapor (Mahasiswa & Dosen)
- **Keluhan**:
  - "Selama ini jika ada AC rusak atau proyektor mati di kelas, kami melapor lewat grup chat atau staf TU, tetapi sering lupa atau lambat ditangani."
  - "Kami tidak tahu status laporan kami, apakah sudah dibaca, sedang diperbaiki, atau bahkan dicuekin."
- **Kebutuhan**:
  - Halaman pembuatan laporan yang ringkas (aduan laporan/judul, deskripsi detail > 20 karakter, lokasi gedung dan lokasi ruangan secara terpisah).
  - Status laporan yang transparan (bisa dipantau secara real-time).
  - Fitur untuk memberikan komentar tambahan atau menanyakan progres langsung di dalam laporan.
  - Tombol konfirmasi ketika perbaikan selesai untuk memastikan pekerjaan benar-benar beres.

### 2. Administrator (Staf Sarana Prasarana)
- **Keluhan**:
  - "Laporan yang masuk sering menumpuk tanpa skala prioritas yang jelas. Kami kesulitan menentukan masalah mana yang harus diselesaikan terlebih dahulu."
  - "Pembagian tugas ke teknisi masih manual via telepon/WhatsApp, sehingga tidak tercatat secara rapi."
- **Kebutuhan**:
  - Halaman daftar semua laporan masuk yang bisa difilter berdasarkan status, prioritas, dan kategori.
  - Fitur untuk memeriksa detail keluhan pelapor, lalu menentukan kategori (AC, Listrik, Internet, Kebersihan, Sipil) dan prioritas (Low, Medium, High).
  - Opsi dropdown untuk menugaskan laporan kepada teknisi spesifik yang tersedia.
  - Tombol untuk menutup laporan (*Closed*) setelah pelapor memberikan konfirmasi.

### 3. Teknisi
- **Keluhan**:
  - "Kami sering bingung pekerjaan mana yang menjadi tanggung jawab kami hari ini."
  - "Progres pekerjaan di lapangan tidak terdokumentasi, sehingga admin sering bertanya terus-menerus."
- **Kebutuhan**:
  - Halaman daftar tugas khusus yang ditugaskan ke dirinya sendiri.
  - Tombol untuk menerima tugas (*In Progress*) dan menandai tugas selesai (*Resolved*).
  - Kolom catatan teknis (komentar) untuk mencatat suku cadang atau kendala di lapangan.

### 4. Manajer Fasilitas
- **Keluhan**:
  - "Saya tidak memiliki visualisasi data performa perawatan fasilitas. Sulit untuk mengevaluasi apakah tim bekerja dengan cepat atau lambat."
- **Kebutuhan**:
  - Halaman dashboard ringkas yang menampilkan total laporan per status, grafik jumlah laporan per kategori, dan metrik rata-rata waktu penyelesaian.
