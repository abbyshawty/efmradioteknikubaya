# 107.9 E-FM — Website Radio Kampus (Next.js)

Website resmi 107.9 E-FM, radio kampus Fakultas Teknik Universitas Surabaya.
Dibangun dengan **Next.js 14 (App Router) · TypeScript · Tailwind CSS + CSS
kustom · Upstash Redis**, lengkap dengan halaman **admin** untuk mengatur
konten tanpa menyentuh kode.

---

## 1. Persiapan

Butuh **Node.js 18.18+ atau 20+**.

```bash
npm install
cp .env.local.example .env.local
```

Buka `.env.local`, isi minimal `ADMIN_PASSWORD` (lihat bagian 4).

## 2. Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode development di `http://localhost:3000` |
| `npm run build` | Build produksi (dipakai otomatis oleh Vercel/Netlify) |
| `npm run start` | Jalankan hasil build produksi secara lokal |
| `npm run lint` | Cek kualitas kode |

```bash
npm run dev
```

Buka `http://localhost:3000` untuk situs, dan `http://localhost:3000/admin`
untuk panel admin (juga ada link "Admin" kecil di footer situs).

## 3. Apa saja yang bisa diatur lewat `/admin`

Semua ini tersimpan terpusat dan langsung tampil di halaman utama begitu
disimpan — tidak perlu deploy ulang:

- **Live Streaming**: ID video live YouTube, domain untuk live chat, link
  channel YouTube
- **Media Sosial**: Instagram, YouTube, Spotify, TikTok, email kontak
  (dipakai di popup saat tombol Email diklik)
- **Request Lagu**: URL webhook Google Apps Script (lihat
  `SETUP-REQUEST-LAGU.md`)
- **Program Kerja**: judul, deskripsi, dan URL foto dokumentasi untuk
  setiap item di kategori Harian / Bulanan / Tahunan — bisa tambah atau
  hapus item
- **Foto anggota divisi**: URL foto untuk masing-masing dari 16 anggota

**Yang TIDAK diatur lewat admin** (sengaja tetap di kode, karena jarang
berubah dan lebih aman diedit langsung sebagai kode):
- Nama, nama panggilan, dan peran anggota divisi → `components/Divisi.tsx`
- Teks Visi & Misi → `components/VisiMisi.tsx`
- Teks sejarah "About E-FM" → `components/About.tsx`
- Aturan Request Lagu → `components/RequestLagu.tsx`
- Judul & tagline hero → `components/Hero.tsx`

Semua file di atas ditandai komentar `✏️ EDIT` di lokasi yang perlu diubah.

## 4. Password Admin & Penyimpanan Data (Upstash Redis)

Karena Vercel/Netlify tidak menyimpan file secara permanen, semua
pengaturan dari `/admin` disimpan di **Upstash Redis** (gratis).

**Langkah setup (sekali saja):**

1. Daftar di **https://console.upstash.com**.
2. **Create Database** → tipe **Redis** → beri nama (mis. `efm`) → Create.
3. Buka database → tab **REST API** → salin `UPSTASH_REDIS_REST_URL` dan
   `UPSTASH_REDIS_REST_TOKEN`.
4. Tempelkan ke environment:
   - **Lokal**: file `.env.local`
   - **Vercel/Netlify**: menu **Settings → Environment Variables**, lalu
     redeploy

```
ADMIN_PASSWORD=password-kuat-pilihanmu
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=token-dari-upstash
```

> Tanpa Upstash, situs tetap jalan dan menyimpan ke file `data/config.json`
> (cocok untuk uji coba lokal), tapi di Vercel/Netlify perubahan dari admin
> **tidak akan bertahan** — jadi Upstash wajib di sana.

## 5. Request Lagu → Google Sheets

Form Request Lagu mengirim data lewat **Google Apps Script Web App**
(satu-satunya cara situs bisa menulis ke Google Sheets tanpa server
sendiri). Langkah deploy lengkap + kode script-nya ada di
**`SETUP-REQUEST-LAGU.md`**. Setelah deploy, tempel URL Web App-nya ke
field "Request Lagu" di halaman `/admin`.

## 6. Deploy

### Vercel
1. Push proyek ke GitHub.
2. **vercel.com** → **Add New → Project** → pilih repo.
3. Tambahkan Environment Variables (bagian 4) → **Deploy**.

### Netlify
1. Push ke GitHub.
2. **netlify.com** → **Add new site → Import** → pilih repo.
3. Build command: `npm run build`, plugin `@netlify/plugin-nextjs`
   (biasanya otomatis terdeteksi).
4. Tambahkan Environment Variables (bagian 4) → **Deploy**.

Setelah online, isi field-field penting di `/admin` (ID video live,
domain, link sosial media) supaya semua fitur aktif.

## Struktur Proyek

```
efm-website/
├─ app/
│  ├─ layout.tsx          # font Poppins + DM Mono, script Phosphor Icons
│  ├─ page.tsx            # merangkai semua section
│  ├─ globals.css         # seluruh gaya kustom (tuner, bento, modal, admin)
│  ├─ admin/page.tsx      # panel admin
│  └─ api/config/route.ts # API baca/simpan konfigurasi
├─ components/            # Header, Hero, Live, RequestLagu, ProgramKerja,
│                          # Divisi, Kontak, Modal (Context), dst.
├─ lib/
│  ├─ config.ts           # tipe SiteConfig & default
│  └─ storage.ts          # adapter Redis / file
├─ public/assets/         # logo, ikon sosial, foto anggota
├─ data/config.json       # penyimpanan lokal (mode tanpa Redis)
├─ SETUP-REQUEST-LAGU.md  # panduan deploy Apps Script
└─ .env.local.example
```
