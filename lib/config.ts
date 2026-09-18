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

export type SiteConfig = {
  // Live streaming
  youtubeVideoId: string;
  liveChatDomain: string;
  channelUrl: string;
  // Media sosial
  instagram: string;
  youtube: string;
  spotify: string;
  tiktok: string;
  email: string;
  // Request Lagu -> Google Sheets (lihat SETUP-REQUEST-LAGU.md)
  sheetWebhookUrl: string;
  // Program Kerja: Harian (1 item), Bulanan (2 item), Tahunan (2 item)
  programKerja: ProgramKerja;
  // Foto anggota divisi, key = slug nama panggilan (mis. "abby"), value = URL foto
  members: Record<string, string>;
};

export const DEFAULT_CONFIG: SiteConfig = {
  youtubeVideoId: "",
  liveChatDomain: "",
  channelUrl: "https://www.youtube.com/@efmftubaya",
  instagram: "https://www.instagram.com/efmradioubaya",
  youtube: "https://www.youtube.com/@efmftubaya",
  spotify:
    "https://open.spotify.com/user/316ln345kir6dkazsy4lyvpbupem?si=d4ccbbd5ae9e472a&nd=1&dlsi=0945f2826c1849f3",
  tiktok: "https://www.tiktok.com/@efmradioubaya?is_from_webapp=1&sender_device=pc",
  email: "efmradio_ft@ormawa.ubaya.ac.id",
  sheetWebhookUrl: "",
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
  members: {
    // ✏️ Data foto awal. Sudah dipindah dari data/config.json ke sini karena
    // Next.js tidak selalu ikut membundel file yang dibaca lewat fs.readFileSync
    // dengan path dinamis ke fungsi serverless Vercel -- menaruhnya sebagai kode
    // langsung memastikan datanya selalu ikut ter-deploy.
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
  },
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

export async function readConfig(): Promise<SiteConfig> {
  const stored = (await storageGet()) as Partial<SiteConfig> | null;
  return deepMerge(DEFAULT_CONFIG, stored ?? {});
}

export async function writeConfig(patch: Partial<SiteConfig>): Promise<SiteConfig> {
  const current = await readConfig();
  const merged = deepMerge(current, patch);
  await storageSet(merged);
  return merged;
}
