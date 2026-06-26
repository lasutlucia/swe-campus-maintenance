# Deployment Information - Campus Service Request and Maintenance System

Dokumen ini mendokumentasikan hasil deployment aplikasi produksi ke infrastruktur Cloudflare.

## Informasi Rilis (Release Info)

- **URL Aplikasi Publik**: [https://campus-maintenance.lasutlucia.workers.dev](https://campus-maintenance.lasutlucia.workers.dev)
- **Teknologi Backend/Frontend**: Cloudflare Workers + Pages (Monorepo)
- **Database Produksi D1**: `campus-maintenance-db`
- **ID Database (UUID)**: `7cede0ca-bc95-4fce-ab2a-9d2ee6fe9416`
- **Waktu Deployment Pertama**: 2026-06-26

---

## Konfigurasi Wrangler (`wrangler.jsonc`)

Binding database produksi D1 yang diikat ke runtime Worker:
```json
	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "campus-maintenance-db",
			"database_id": "7cede0ca-bc95-4fce-ab2a-9d2ee6fe9416"
		}
	]
```

---

## Checklist Setelah Deployment (Verification Checks)

Semua pemeriksaan pasca-deployment berikut telah sukses diverifikasi:

- [x] **Aksesibilitas Publik**: Aplikasi dapat dibuka dengan lancar melalui URL publik Cloudflare.
- [x] **Penggunaan Form**: Form pengaduan dapat diisi dan mengirimkan data tanpa kendala.
- [x] **API Gateway**: API Workers dapat menerima payload dan merespon dalam waktu < 1 detik.
- [x] **Persistensi D1**: Seluruh data keluhan, riwayat status, dan komentar tersimpan secara persisten di database D1 Cloudflare.
- [x] **Keamanan GitHub**: Repositori GitHub bersih dari token, password, atau credential sensitif.
- [x] **Status CI/CD**: Workflow GitHub Actions berjalan sukses dan meluluskan semua tes otomatis.
- [x] **API Health**: Pemanggilan alamat `/api/health` mengembalikan status `"ok"`.

---

## Catatan Rilis (Release Notes) - v1.0.0 (Initial Release)

Rilis perdana Campus Service Request and Maintenance System mencakup fungsionalitas inti:
1. **Form Pengaduan**: Validasi teks deskripsi minimal 20 karakter untuk mencegah data sampah.
2. **Dashboard Multi-Role**: Kemudahan simulasi alur perbaikan (Pelapor, Admin, Teknisi, Manajer Fasilitas) dalam satu tampilan antarmuka.
3. **Log Audit Riwayat Status**: Rekaman kronologis setiap perpindahan status laporan.
4. **Diskus Komentar**: Kolom komentar di setiap detail laporan untuk komunikasi koordinasi perbaikan.
5. **Dashboard Ringkasan Manajer**: Statistik total laporan masuk, dalam penanganan, dan selesai.
