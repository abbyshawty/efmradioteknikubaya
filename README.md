# 107.9 E-FM — Website Radio Kampus (Next.js)

Website resmi 107.9 E-FM, radio kampus Fakultas Teknik Universitas Surabaya.
Dibangun dengan **Next.js 14 (App Router) · TypeScript · Tailwind CSS + CSS
kustom · Upstash Redis · Vercel Blob**, lengkap dengan halaman **admin**
yang dilindungi login untuk mengatur konten tanpa menyentuh kode.

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
| `npm run build` | Build produksi (dipakai otomatis oleh Vercel) |
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
- **Request Lagu**: URL webhook Google Apps Script (lihat
  `SETUP-REQUEST-LAGU.md`) — URL ini disembunyikan dari pengunjung, lihat
  bagian keamanan di bawah
- **Program Kerja**: judul, deskripsi, dan **foto dokumentasi** (unggah
  langsung + potong/zoom sendiri di halaman admin) untuk setiap item di
  kategori Harian / Bulanan / Tahunan — bisa tambah atau hapus item
- **Foto anggota divisi**: unggah + potong/zoom foto untuk masing-masing
  dari 16 anggota, rasio otomatis terkunci 1:1

**Yang TIDAK diatur lewat admin** (sengaja tetap di kode, karena jarang
berubah): nama/peran anggota (`components/Divisi.tsx`), teks Visi & Misi
(`components/VisiMisi.tsx`), sejarah "About E-FM" (`components/About.tsx`),
aturan Request Lagu (`components/RequestLagu.tsx`), judul & tagline hero
(`components/Hero.tsx`). Semua ditandai komentar `EDIT` di lokasi yang
perlu diubah.

## 4. Setup Wajib Sebelum Deploy

Situs ini butuh **tiga layanan** yang harus disiapkan dan diisi sebagai
Environment Variables (lokal: `.env.local`; Vercel: **Settings →
Environment Variables**, lalu redeploy):

### a. Username, password & kunci sesi admin
```
ADMIN_USERNAME=username-pilihanmu
ADMIN_PASSWORD=password-kuat-pilihanmu
ADMIN_SESSION_SECRET=string-acak-panjang-bebas
```
`ADMIN_SESSION_SECRET` dipakai untuk menandatangani sesi login (cookie)
supaya tidak bisa dipalsukan. Boleh string apa saja asal panjang & acak.

### b. Upstash Redis (penyimpanan konfigurasi + sesi + rate limit)
1. Daftar di **https://console.upstash.com**.
2. **Create Database** → tipe **Redis** → Create.
3. Tab **REST API** → salin `UPSTASH_REDIS_REST_URL` dan
   `UPSTASH_REDIS_REST_TOKEN`.

> Tanpa Upstash, situs tetap jalan (fallback ke file lokal untuk dev),
> tapi di Vercel perubahan dari admin **tidak akan bertahan**, dan
> pembatasan percobaan login juga tidak akan konsisten antar server.
> Upstash wajib untuk produksi.

### c. Vercel Blob (penyimpanan foto yang diunggah lewat admin)
1. Buka proyek di dashboard Vercel → tab **Storage**.
2. **Create Database** → pilih **Blob** → beri nama → Create.
3. Hubungkan store itu ke proyek ini — Vercel otomatis menambahkan
   `BLOB_READ_WRITE_TOKEN` ke Environment Variables proyek.
4. Kalau mau jalankan upload foto secara lokal juga, salin token yang
   sama ke `.env.local`.

## 5. Keamanan

Beberapa hal yang sudah diterapkan, dan yang perlu kamu jaga:

- **Halaman `/admin` dikunci login.** Form pengaturan baru muncul setelah
  password benar; sesi tersimpan di cookie `httpOnly` (tidak bisa dibaca
  lewat JavaScript di browser) selama 12 jam.
- **Percobaan login dibatasi**: maksimal 8 kali gagal per 15 menit per
  alamat IP, lalu diblokir sementara. Butuh Upstash aktif supaya batasan
  ini konsisten di semua server Vercel (tanpa Upstash, batasannya hanya
  berlaku per instance server, kurang andal).
- **URL webhook Google Sheets tidak pernah dikirim ke browser pengunjung.**
  Form Request Lagu mengirim datanya ke `/api/request-lagu` di server kita
  sendiri, yang baru meneruskannya ke Google Sheets dari sisi server. Ini
  mencegah orang luar mengirim data sampah langsung ke spreadsheet kalian
  tanpa lewat form situs.
- **Upload foto divalidasi**: hanya PNG/JPG/WebP, maksimal 8 MB per file,
  dan endpoint upload-nya sendiri butuh sesi admin yang valid.
- **`ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `ADMIN_SESSION_SECRET` harus kuat dan rahasia.**
  Jangan pernah commit `.env.local` ke Git (sudah ada di `.gitignore`).
- Next.js dikunci ke versi **14.2.34**, yang sudah menambal celah keamanan
  yang pernah dilaporkan pada versi 14.x sebelumnya. Kalau suatu saat ada
  peringatan keamanan baru saat `npm install`, jalankan `npm outdated next`
  untuk cek versi terbaru di jalur 14.x, lalu upgrade.

## 6. Request Lagu → Google Sheets

Form Request Lagu mengirim data lewat **Google Apps Script Web App**
(satu-satunya cara situs bisa menulis ke Google Sheets tanpa server
sendiri). Langkah deploy lengkap + kode script-nya ada di
**`SETUP-REQUEST-LAGU.md`**. Setelah deploy, tempel URL Web App-nya ke
field "Request Lagu" di halaman `/admin`.

## 7. Deploy ke Vercel

1. Push proyek ke GitHub.
2. **vercel.com/new** → import repo (pastikan integrasi GitHub Vercel
   sudah diberi akses ke repo ini lewat GitHub → Settings → Installations).
3. Tambahkan semua Environment Variables dari bagian 4 di atas.
4. Deploy.
5. Setelah live, buka `/admin`, login, isi ID video live, link sosial
   media, dan foto-foto yang belum ada.

## Struktur Proyek

```
efm-website/
├─ app/
│  ├─ layout.tsx              # font Poppins + DM Mono, script Phosphor Icons
│  ├─ page.tsx                # merangkai semua section
│  ├─ globals.css             # seluruh gaya kustom (tuner, bento, modal, admin)
│  ├─ admin/page.tsx          # panel admin (dengan gerbang login)
│  └─ api/
│     ├─ config/route.ts        # GET publik (aman) / POST simpan (butuh sesi)
│     ├─ admin/config/route.ts  # GET lengkap, khusus sesi admin
│     ├─ admin-login/route.ts   # login + rate limiting
│     ├─ admin-logout/route.ts  # logout
│     ├─ upload/route.ts        # upload foto ke Vercel Blob (butuh sesi)
│     └─ request-lagu/route.ts  # proxy form Request Lagu ke Google Sheets
├─ components/
│  ├─ admin/ImageCropUpload.tsx # widget potong + unggah foto
│  └─ ...                       # Header, Hero, Live, ProgramKerja, Divisi, dst.
├─ lib/
│  ├─ config.ts               # tipe SiteConfig & default
│  ├─ storage.ts              # adapter Redis / file
│  └─ auth.ts                 # sesi login & rate limiting
├─ public/assets/              # logo, ikon sosial, foto anggota
├─ data/config.json            # penyimpanan lokal (mode tanpa Redis)
├─ SETUP-REQUEST-LAGU.md       # panduan deploy Apps Script
└─ .env.local.example
```
