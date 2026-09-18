# Menyambungkan Form Request Lagu ke Google Sheets

Website ini adalah halaman statis, jadi JavaScript di browser tidak bisa
langsung menulis ke Google Sheets. Cara standarnya: pakai **Google Apps
Script** sebagai jembatan kecil, langsung ditempel di spreadsheet tujuan.
Gratis, tidak perlu server tambahan, dan berjalan di infrastruktur Google.

Sheet tujuan: `https://docs.google.com/spreadsheets/d/1ux_9htZJhM8Dj29G9vTqQ9FZ-Dcp6Ad6ofPH1l7iZxM/edit`

## Langkah setup (sekali saja)

1. Buka spreadsheet di atas, lalu klik menu **Extensions → Apps Script**.
2. Hapus semua kode contoh yang ada, lalu tempel kode di bawah ini.
3. Simpan project (nama bebas, misal "Webhook Request Lagu").
4. Klik **Deploy → New deployment**.
5. Klik ikon gear di samping "Select type", pilih **Web app**.
6. Isi:
   - **Execute as**: Me (akun kamu)
   - **Who has access**: Anyone
7. Klik **Deploy**. Google akan minta otorisasi, pilih akun yang sama dengan
   pemilik spreadsheet, lalu klik **Allow** (mungkin ada peringatan "Google
   hasn't verified this app" karena scriptnya milikmu sendiri, klik
   **Advanced → Go to (nama project) (unsafe)** untuk lanjut, ini aman karena
   scriptnya kamu tulis sendiri).
8. Salin **Web app URL** yang muncul (bentuknya seperti
   `https://script.google.com/macros/s/AKfycb.../exec`).
9. Buka file `index.html` situs, cari `const SHEET_WEBHOOK_URL = ""` di
   bagian atas tag `<script>`, dan tempelkan URL itu di antara tanda kutip.

Setelah itu, setiap kali form Request Lagu dikirim, satu baris baru otomatis
masuk ke sheet bernama **"Request Lagu"** di spreadsheet tersebut (dibuat
otomatis oleh script saat submission pertama masuk).

## Kode Apps Script

```javascript
const SHEET_ID = "1ux_9htZJhM8Dj29G9vTqQ9FZ-Dcp6Ad6ofPH1l7iZxM";
const SHEET_NAME = "Request Lagu";

function doPost(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Waktu", "Nama", "Judul & Artis", "Link Musik", "Hari", "Pesan"]);
    sheet.setFrozenRows(1);
  }

  const p = e.parameter;
  sheet.appendRow([
    new Date(),
    p.nama || "",
    p.lagu || "",
    p.link || "",
    p.hari || "",
    p.pesan || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Catatan penting

- **Update deployment saat mengedit script.** Kalau kamu mengubah kode
  Apps Script di kemudian hari, jangan cuma Save. Klik **Deploy → Manage
  deployments → ikon pensil → Version: New version → Deploy** supaya
  perubahan benar-benar aktif di URL yang sama.
- **Verifikasi manual.** Karena permintaan dikirim dengan mode `no-cors`
  (keterbatasan teknis Apps Script dari browser statis), situs tidak bisa
  membaca apakah pengiriman benar-benar berhasil atau gagal. Pesan
  konfirmasi di halaman akan tetap muncul begitu data dikirim. Untuk
  memastikan datanya benar-benar masuk, cek langsung ke sheet setelah
  melakukan tes kirim.
- **Kalau ingin membatasi siapa yang bisa mengisi**, ini di luar cakupan
  perubahan ini; Apps Script Web App dengan akses "Anyone" berarti siapa
  saja yang tahu URL formnya bisa mengirim data (sama seperti Google Form
  publik biasa).
