// ============================================================
//  Tipe & nilai default konfigurasi situs.
//  Semua field di sini bisa diubah lewat halaman /admin.
// ============================================================
import { storageGet, storageSet } from "./storage";

export type ProgramItem = {
  title: string;
  desc: string;
  img: string; // URL foto dokumentasi, boleh kosong
};

export type ProgramCategory = {
  title: string;
  items: ProgramItem[];
};

export type ProgramKerja = {
  harian: ProgramCategory;
  bulanan: ProgramCategory;
  tahunan: ProgramCategory;
};

export type Member = {
  name: string;
  nick: string;
  role: string;
  photo: string; // URL foto, boleh kosong
};

export type Division = {
  name: string;
  code: string;
  desc: string;
  members: Member[];
};

export type AboutFact = {
  label: string; // mis. "Sejak"
  value: string; // mis. "1990-an"
  sub: string; // keterangan kecil di bawah value, boleh kosong
};

export type SiteConfig = {
  // Logo di header & footer
  logos: { efm: string; ubaya: string };
  // Hero (judul besar di atas) + teks berjalan di bawahnya
  hero: { line1: string; line2: string; tagline: string };
  ticker: { message: string };
  // Visi & Misi
  visiMisi: { title: string; visi: string[]; misi: string[] };
  // Live streaming
  liveSection: { title: string };
  youtubeVideoId: string;
  liveChatDomain: string;
  channelUrl: string;
  // Request Lagu
  requestSection: {
    title: string;
    desc: string;
    rules: string[];
    noteText: string; // teks sebelum link Instagram di bawah aturan
    noteLinkText: string; // teks link-nya, mengarah ke URL Instagram
  };
  // Request Lagu -> Google Sheets (lihat SETUP-REQUEST-LAGU.md)
  sheetWebhookUrl: string;
  // About
  about: { title: string; paragraphs: string[]; facts: AboutFact[] };
  // Program Kerja
  programSection: { title: string; desc: string };
  programKerja: ProgramKerja;
  // Divisi & anggota
  divisiSection: { title: string };
  divisions: Division[];
  // Kontak / media sosial
  kontak: { title: string; desc: string };
  instagram: string;
  youtube: string;
  spotify: string;
  tiktok: string;
  email: string;
  // Footer
  footer: { text: string };
};

// Foto anggota versi lama disimpan sebagai map { slug: url } di field
// `members`. Daftar slug ini dipakai untuk memindahkan foto tersebut ke
// struktur `divisions` yang baru (lihat migrateLegacy di bawah).
type LegacyMember = Omit<Member, "photo"> & { key: string };

const LEGACY_DIVISIONS: (Omit<Division, "members"> & { members: LegacyMember[] })[] = [
  {
    name: "Badan Pengurus Harian",
    code: "BPH",
    desc: "Badan Pengurus Harian atau bisa juga disebut dengan BPH adalah divisi yang mengurus semua hal terkait internal maupun eksternal dari Radio Kampus.",
    members: [
      { key: "abby", name: "Assidiqie Habibillah", nick: "Abby", role: "Ketua E-FM" },
      { key: "jose", name: "Ignatius Jose Kurniawan", nick: "Jose", role: "Wakil Ketua E-FM" },
      { key: "velyn", name: "Fellina Ivanka", nick: "Velyn", role: "Sekretaris dan Bendahara E-FM" },
    ],
  },
  {
    name: "Producer and Announcer",
    code: "PA",
    desc: "Producer and Announcer atau bisa juga disebut dengan PA adalah divisi yang bertugas untuk menyiapkan materi siaran dan juga bertugas sebagai penyiar atau broadcasting.",
    members: [
      { key: "retha", name: "Margareta Yuna Agustina", nick: "Retha", role: "Koordinator" },
      { key: "laura", name: "Laura Gabriela Goyosa", nick: "Laura", role: "Anggota" },
      { key: "angel", name: "Angel Elysia Sari", nick: "Angel", role: "Anggota" },
      { key: "georgius", name: "Georgius Talenta Surya", nick: "Geo", role: "Anggota" },
    ],
  },
  {
    name: "Music Director",
    code: "MD",
    desc: "Music Director atau bisa juga disebut dengan MD adalah divisi yang mengurus seluruh hal yang berhubungan dengan music serta editing video.",
    members: [
      { key: "henokh", name: "Henokh Imanuel Purnama", nick: "Henokh", role: "Koordinator" },
      { key: "rafael", name: "Rafael Veroland Lukito", nick: "Rafael", role: "Anggota" },
      { key: "cristian", name: "Cristian Ronaldo Wijaya", nick: "Cristian", role: "Anggota" },
      { key: "hendrik", name: "Hendrik Chrystoper Lo", nick: "Hendrik", role: "Anggota" },
      { key: "ago", name: "Lago Kristiani Tarigas", nick: "Ago", role: "Anggota" },
    ],
  },
  {
    name: "Design Social Media",
    code: "DSM",
    desc: "Design Social Media atau bisa juga disebut sebagai DSM adalah divisi yang mengurus social media dan mengatur segala kebutuhan design Radio Kampus.",
    members: [
      { key: "echa", name: "Neysa Nathania Pane", nick: "Echa", role: "Koordinator" },
      { key: "nia", name: "Nathania Naya Irwangsa", nick: "Nia", role: "Anggota" },
      { key: "nana", name: "Alexandria Sophie", nick: "Nana", role: "Anggota" },
      { key: "keisya", name: "Keisya Olivia Suyanto", nick: "Keisya", role: "Anggota" },
    ],
  },
];

// Data foto awal ditaruh sebagai kode (bukan dibaca dari data/config.json)
// karena Next.js tidak selalu ikut membundel file yang dibaca lewat
// fs.readFileSync ke fungsi serverless Vercel.
const DEFAULT_PHOTOS: Record<string, string> = {
  abby: "/assets/members/abby.png",
  jose: "/assets/members/jose.png",
  velyn: "/assets/members/velyn.png",
  retha: "/assets/members/retha.png",
  laura: "/assets/members/laura.png",
  angel: "/assets/members/angel.png",
  georgius: "/assets/members/georgius.png",
  henokh: "",
  rafael: "/assets/members/rafael.png",
  cristian: "/assets/members/cristian.png",
  hendrik: "/assets/members/hendrik.png",
  ago: "/assets/members/ago.png",
  echa: "/assets/members/echa.png",
  nia: "/assets/members/nia.png",
  nana: "/assets/members/nana.png",
  keisya: "/assets/members/keisya.png",
};

function buildDivisions(photos: Record<string, string>): Division[] {
  return LEGACY_DIVISIONS.map((div) => ({
    ...div,
    members: div.members.map(({ key, ...m }) => ({ ...m, photo: photos[key] ?? "" })),
  }));
}

export const DEFAULT_CONFIG: SiteConfig = {
  logos: {
    efm: "/assets/logo-efm.png",
    ubaya: "/assets/logo-ubaya.png",
  },
  hero: {
    line1: "E-FM Radio Kampus",
    line2: "Universitas Surabaya",
    tagline: "Fresh Your Mind with Edutainment Radio",
  },
  ticker: {
    message: "Request lagu? Kirim melalui page Request Lagu",
  },
  visiMisi: {
    title: "VISI dan MISI E-FM",
    visi: [
      "Membangun kolaborasi dan jaringan.",
      "Menciptakan lingkungan kerja yang kolaboratif dan suportif.",
      "Memfasilitasi anggota untuk membangun jaringan dengan media eksternal.",
    ],
    misi: [
      "Mendorong kolaborasi internal dan memperluas jaringan anggota dengan praktisi media eksternal.",
      "Menjadi fasilitator dalam menginformasikan segala kegiatan ORMAWA maupun NON-ORMAWA di lingkungan Fakultas Teknik Universitas Surabaya.",
      "Memberikan informasi yang fresh dan mendidik bagi seluruh masyarakat Universitas Surabaya.",
    ],
  },
  liveSection: { title: "Live Streaming" },
  youtubeVideoId: "",
  liveChatDomain: "",
  channelUrl: "https://www.youtube.com/@efmftubaya",
  requestSection: {
    title: "Request Lagu",
    desc: "Isi form di bawah, lagu pilihan kalian akan direview oleh team Music Director sebelum diputar. Jangan lupa baca aturan singkatnya terlebih dahulu.",
    rules: [
      "Tidak menerima lagu bergenre dangdut atau genre lain yang riuh saat diputar di area kampus.",
      'Hindari lagu dengan lirik eksplisit. Cek label "E" di Spotify, YouTube Music, atau Apple Music sebelum request.',
      "Tidak menerima lagu bermuatan SARA, politik, isu sensitif, atau lagu rohani.",
      "Lagu diputar Senin sampai Jumat, pukul 12.30 sampai 13.00. Jadwal dapat berubah sewaktu-waktu.",
      "Jika lagumu belum diputar, kemungkinan menunggu giliran atau belum sesuai aturan di atas.",
    ],
    noteText: "Ada pertanyaan atau mau paid promote? DM Instagram",
    noteLinkText: "@efmradioubaya",
  },
  sheetWebhookUrl: "",
  about: {
    title: "About E-FM",
    paragraphs: [
      "Radio Kampus E-FM awalnya dibentuk oleh jurusan Teknik Elektro pada tahun 1990-an. Awalnya Radio Kampus adalah eksperimen dari beberapa mahasiswa Teknik Elektro dan hanya dipegang oleh jurusan Teknik Elektro.",
      "Radio Kampus E-FM juga sempat hiatus dan kemudian kembali beroperasi pada tahun 2006 dan dikelola sebagai ORMAWA. Lokasi ruangan Radio Kampus berada di TC 04.04.",
    ],
    facts: [
      { label: "Sejak", value: "1990-an", sub: "tahun mengudara" },
      { label: "Jangkauan", value: "107.9 FM", sub: "+ streaming daring" },
      { label: "Anggota", value: "16 orang", sub: "" },
    ],
  },
  programSection: {
    title: "Program Kerja E-FM",
    desc: "Pilih kategori untuk melihat dokumentasi foto dan detail program kerja kami.",
  },
  programKerja: {
    harian: {
      title: "Program Kerja Harian",
      items: [
        {
          title: "Music Chart",
          img: "",
          desc: "Update lagu-lagu terkini yang sedang menjadi Trending / Top Chart. Disiarkan melalui sound system fakultas dan sosial media.",
        },
      ],
    },
    bulanan: {
      title: "Program Kerja Bulanan",
      items: [
        {
          title: "Podcast",
          img: "",
          desc: "Podcast yang akan diadakan sebulan sekali untuk menambah pengalaman anggota. Podcast akan diunggah di media sosial E-FM (Instagram, YouTube, TikTok, Spotify).",
        },
        {
          title: "Kunjungan Radio",
          img: "",
          desc: "Kunjungan ke radio kampus universitas lain atau radio komersil di daerah Surabaya untuk menambah pengalaman anggota. Kami sudah pernah berkunjung ke Petra Campus Radio dan KLIK FM.",
        },
      ],
    },
    tahunan: {
      title: "Program Kerja Tahunan",
      items: [
        {
          title: "Welcome Party",
          img: "",
          desc: "Acara penyambutan anggota baru KMM Radio Kampus yang diikuti oleh seluruh anggota Radio Kampus Fakultas Teknik.",
        },
        {
          title: "EFFORT",
          img: "",
          desc: "Acara seminar yang bertujuan untuk menambah pengalaman public speaking agar berani tampil berbicara di depan layar maupun kalangan umum.",
        },
      ],
    },
  },
  divisiSection: { title: "Divisi E-FM" },
  divisions: buildDivisions(DEFAULT_PHOTOS),
  kontak: {
    title: "Temukan kami di social media E-FM",
    desc: "Follow Social Media kami untuk informasi acara, event, dan request lagu. Mau kolaborasi siaran atau paid promote hubungi kami melalui email.",
  },
  instagram: "https://www.instagram.com/efmradioubaya",
  youtube: "https://www.youtube.com/@efmftubaya",
  spotify:
    "https://open.spotify.com/user/316ln345kir6dkazsy4lyvpbupem?si=d4ccbbd5ae9e472a&nd=1&dlsi=0945f2826c1849f3",
  tiktok: "https://www.tiktok.com/@efmradioubaya?is_from_webapp=1&sender_device=pc",
  email: "efmradio_ft@ormawa.ubaya.ac.id",
  footer: { text: "107.9 E-FM · Universitas Surabaya, Surabaya" },
};

function deepMerge<T>(base: T, patch: Partial<T>): T {
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const key of Object.keys(patch || {})) {
    const pv = (patch as any)[key];
    const bv = (base as any)[key];
    if (pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object" && !Array.isArray(bv)) {
      out[key] = deepMerge(bv, pv);
    } else if (pv !== undefined) {
      out[key] = pv;
    }
  }
  return out;
}

/** Konfigurasi lama menyimpan foto anggota di `members: { slug: url }`.
 *  Kalau belum pernah disimpan dengan struktur `divisions`, foto-foto itu
 *  dipindahkan ke data divisi default supaya tidak hilang. */
function migrateLegacy(stored: Record<string, any>): Partial<SiteConfig> {
  const { members, ...rest } = stored;
  if (!rest.divisions && members && typeof members === "object") {
    rest.divisions = buildDivisions({ ...DEFAULT_PHOTOS, ...members });
  }
  return rest;
}

export async function readConfig(): Promise<SiteConfig> {
  const stored = (await storageGet()) as Record<string, any> | null;
  return deepMerge(DEFAULT_CONFIG, migrateLegacy(stored ?? {}));
}

export async function writeConfig(patch: Partial<SiteConfig>): Promise<SiteConfig> {
  const current = await readConfig();
  const merged = deepMerge(current, patch);
  await storageSet(merged);
  return merged;
}
