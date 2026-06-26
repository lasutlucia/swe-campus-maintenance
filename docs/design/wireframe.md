# Wireframe Mockup - Campus Service Request and Maintenance System

Dokumen ini mendeskripsikan tata letak (*layout*) dan komponen antarmuka pengguna dalam bentuk representasi wireframe teks.

---

## 1. Tampilan Utama (Dashboard & Form Pelaporan)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [Logo] Campus Service Request                             Role Switcher: [ Pelapor v ]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Kirim Laporan Baru                      │  │ Daftar Laporan Pengaduan            │  │
│  ├─────────────────────────────────────────┤  ├─────────────────────────────────────┤  │
│  │ Judul Masalah:                          │  │ [ Cari... ] [Semua Status v][Semua Kategoriv]  │
│  │ [ Input Judul                         ] │  ├─────────────────────────────────────┤  │
│  │                                         │  │ No. Tiket │ Judul      │ Prioritas│Status  │  │
│  │ Deskripsi Kerusakan (Min. 20 Karakter):  │  ├───────────┼────────────┼──────────┼────────┤  │
│  │ [ Input Deskripsi                     ] │  │ CSR-101   │ AC Bocor   │ MEDIUM   │SUBMITTED│  │
│  │ [                                     ] │  │ CSR-102   │ Lampu Mati │ HIGH     │ASSIGNED│  │
│  │                                         │  │ CSR-103   │ Wifi Lambat│ LOW      │CLOSED  │  │
│  │ Lokasi Ruang / Gedung:                  │  │           │            │          │        │  │
│  │ [ Input Lokasi                        ] │  │           │            │          │        │  │
│  │                                         │  │           │            │          │        │  │
│  │ Kategori Masalah:                       │  │           │            │          │        │  │
│  │ [ Dropdown Kategori                   ] │  │           │            │          │        │  │
│  │                                         │  │           │            │          │        │  │
│  │ [ Kirim Pengaduan ]                     │  │           │            │          │        │  │
│  └─────────────────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tampilan Detail Laporan & Aktivitas (Di bagian bawah saat baris diklik)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  CSR-101: AC Bocor di Kelas B302                                        [Tutup Detail] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  AC di ruang kelas B302 mengeluarkan air sejak pagi hari, menetes ke meja mahasiswa.  │
│                                                                                        │
│  ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Detail Informasi                        │  │ Tindakan & Komentar                 │  │
│  ├─────────────────────────────────────────┤  ├─────────────────────────────────────┤  │
│  │ Lokasi: Gedung B, Ruang 302             │  │ Pilihan Prioritas: (Admin-only)     │  │
│  │ Kategori: AC                            │  │ [ HIGH v ]                          │  │
│  │ Prioritas: [ MEDIUM ]                   │  │                                     │  │
│  │ Status: [ SUBMITTED ]                   │  │ Tugaskan Teknisi: (Admin-only)      │  │
│  │ Teknisi: Belum ditugaskan               │  │ [ Budi (Teknisi) v ]                │  │
│  ├─────────────────────────────────────────┤  ├─────────────────────────────────────┤  │
│  │ Log Aktivitas Riwayat Status:           │  │ Komentar & Diskusi:                 │  │
│  │ - NONE -> SUBMITTED (Oleh Sistem)       │  │ * Rian (Pelapor): Mohon diperbaiki  │  │
│  │ - SUBMITTED -> ASSIGNED (Oleh Admin)    │  │                                     │  │
│  │                                         │  │ [ Tulis Komentar... ]      [ Kirim ]│  │
│  └─────────────────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
