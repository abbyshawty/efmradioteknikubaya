"use client";
import { useEffect, useState } from "react";
import type { ProgramItem, ProgramKerja as ProgramKerjaType, SiteConfig } from "@/lib/config";

type FormState = SiteConfig & { password: string };

const EMPTY_ITEM: ProgramItem = { title: "", desc: "", img: "" };

const EMPTY_CONFIG: SiteConfig = {
  youtubeVideoId: "",
  liveChatDomain: "",
  channelUrl: "",
  instagram: "",
  youtube: "",
  spotify: "",
  tiktok: "",
  email: "",
  sheetWebhookUrl: "",
  programKerja: {
    harian: { title: "Program Kerja Harian", items: [] },
    bulanan: { title: "Program Kerja Bulanan", items: [] },
    tahunan: { title: "Program Kerja Tahunan", items: [] },
  },
  members: {},
};

// ✏️ Daftar anggota untuk form foto. Nama & peran hanya label bantu di sini
// (sumber aslinya ada di components/Divisi.tsx) -- yang disimpan cuma URL foto.
const MEMBER_LIST: { key: string; name: string; division: string }[] = [
  { key: "abby", name: "Assidiqie Habibillah (Abby)", division: "BPH" },
  { key: "jose", name: "Ignatius Jose Kurniawan (Jose)", division: "BPH" },
  { key: "velyn", name: "Fellina Ivanka (Velyn)", division: "BPH" },
  { key: "retha", name: "Margareta Yuna Agustina (Retha)", division: "PA" },
  { key: "laura", name: "Laura Gabriela Goyosa (Laura)", division: "PA" },
  { key: "angel", name: "Angel Elysia Sari (Angel)", division: "PA" },
  { key: "georgius", name: "Georgius Talenta Surya (Geo)", division: "PA" },
  { key: "henokh", name: "Henokh Imanuel Purnama (Henokh)", division: "MD" },
  { key: "rafael", name: "Rafael Veroland Lukito (Rafael)", division: "MD" },
  { key: "cristian", name: "Cristian Ronaldo Wijaya (Cristian)", division: "MD" },
  { key: "hendrik", name: "Hendrik Chrystoper Lo (Hendrik)", division: "MD" },
  { key: "ago", name: "Lago Kristiani Tarigas (Ago)", division: "MD" },
  { key: "echa", name: "Neysa Nathania Pane (Echa)", division: "DSM" },
  { key: "nia", name: "Nathania Naya Irwangsa (Nia)", division: "DSM" },
  { key: "nana", name: "Alexandria Sophie (Nana)", division: "DSM" },
  { key: "keisya", name: "Keisya Olivia Suyanto (Keisya)", division: "DSM" },
];

const PROGRAM_LABELS: Record<keyof ProgramKerjaType, string> = {
  harian: "Harian",
  bulanan: "Bulanan",
  tahunan: "Tahunan",
};

export default function AdminPage() {
  const [form, setForm] = useState<FormState>({ ...EMPTY_CONFIG, password: "" });
  const [status, setStatus] = useState<{ type: "ok" | "err" | ""; msg: string }>({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c: SiteConfig) => setForm((f) => ({ ...f, ...c, password: "" })))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function set<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setMember(key: string, url: string) {
    setForm((f) => ({ ...f, members: { ...f.members, [key]: url } }));
  }

  function setProgramItem(cat: keyof ProgramKerjaType, idx: number, patch: Partial<ProgramItem>) {
    setForm((f) => {
      const items = [...f.programKerja[cat].items];
      items[idx] = { ...items[idx], ...patch };
      return { ...f, programKerja: { ...f.programKerja, [cat]: { ...f.programKerja[cat], items } } };
    });
  }

  function addProgramItem(cat: keyof ProgramKerjaType) {
    setForm((f) => {
      const items = [...f.programKerja[cat].items, { ...EMPTY_ITEM }];
      return { ...f, programKerja: { ...f.programKerja, [cat]: { ...f.programKerja[cat], items } } };
    });
  }

  function removeProgramItem(cat: keyof ProgramKerjaType, idx: number) {
    setForm((f) => {
      const items = f.programKerja[cat].items.filter((_, i) => i !== idx);
      return { ...f, programKerja: { ...f.programKerja, [cat]: { ...f.programKerja[cat], items } } };
    });
  }

  async function save() {
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const { password, ...patch } = form;
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ...patch }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "err", msg: data.error || "Gagal menyimpan." });
      } else {
        const where = data.storage === "redis" ? "Upstash Redis" : "file lokal";
        setStatus({ type: "ok", msg: `Tersimpan ke ${where}. Perubahan langsung tampil di halaman utama.` });
      }
    } catch {
      setStatus({ type: "err", msg: "Tidak bisa menghubungi server." });
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return (
      <main className="admin-shell">
        <div className="admin-wrap">
          <p className="admin-loading">Memuat konfigurasi…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-head">
          <span className="admin-eyebrow">Panel Admin</span>
          <h1>Pengaturan 107.9 E-FM</h1>
          <p>Semua perubahan di sini langsung tampil di halaman utama begitu disimpan.</p>
        </header>

        {/* Password */}
        <section className="admin-card">
          <h2>Password Admin</h2>
          <div className="admin-field">
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
        </section>

        {/* Live Streaming */}
        <section className="admin-card">
          <h2><i className="ph-bold ph-broadcast" /> Live Streaming</h2>
          <div className="admin-field">
            <label>ID Video Live YouTube</label>
            <span className="admin-hint">Dari link youtube.com/watch?v=ABC123 → isi: ABC123. Kosongkan jika belum ada siaran.</span>
            <input type="text" value={form.youtubeVideoId} onChange={(e) => set("youtubeVideoId", e.target.value)} placeholder="ABC123xyz" />
          </div>
          <div className="admin-field">
            <label>Domain Hosting (untuk live chat)</label>
            <span className="admin-hint">Tanpa https:// — mis. efm.ubaya.ac.id. Kosongkan untuk otomatis pakai domain saat ini.</span>
            <input type="text" value={form.liveChatDomain} onChange={(e) => set("liveChatDomain", e.target.value)} placeholder="efm.ubaya.ac.id" />
          </div>
          <div className="admin-field">
            <label>Link Channel YouTube</label>
            <input type="text" value={form.channelUrl} onChange={(e) => set("channelUrl", e.target.value)} placeholder="https://www.youtube.com/@efmftubaya" />
          </div>
        </section>

        {/* Social Media */}
        <section className="admin-card">
          <h2><i className="ph-bold ph-share-network" /> Media Sosial</h2>
          <div className="admin-field">
            <label>Instagram</label>
            <input type="text" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>YouTube</label>
            <input type="text" value={form.youtube} onChange={(e) => set("youtube", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Spotify</label>
            <input type="text" value={form.spotify} onChange={(e) => set("spotify", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>TikTok</label>
            <input type="text" value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} />
          </div>
          <div className="admin-field">
            <label>Email Kontak</label>
            <span className="admin-hint">Ditampilkan lewat popup saat tombol Email di situs diklik.</span>
            <input type="text" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
        </section>

        {/* Request Lagu */}
        <section className="admin-card">
          <h2><i className="ph-bold ph-music-notes" /> Request Lagu</h2>
          <div className="admin-field">
            <label>URL Google Apps Script (webhook Sheets)</label>
            <span className="admin-hint">
              Lihat langkah deploy lengkap di file <b>SETUP-REQUEST-LAGU.md</b> yang disertakan. Formatnya
              https://script.google.com/macros/s/XXXX/exec
            </span>
            <input
              type="text"
              value={form.sheetWebhookUrl}
              onChange={(e) => set("sheetWebhookUrl", e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </div>
        </section>

        {/* Program Kerja */}
        <section className="admin-card">
          <h2><i className="ph-bold ph-calendar-check" /> Program Kerja</h2>
          {(Object.keys(form.programKerja) as (keyof ProgramKerjaType)[]).map((cat) => (
            <div className="admin-subblock" key={cat}>
              <h3>{PROGRAM_LABELS[cat]}</h3>
              {form.programKerja[cat].items.map((item, idx) => (
                <div className="admin-item" key={idx}>
                  <div className="admin-field">
                    <label>Judul</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => setProgramItem(cat, idx, { title: e.target.value })}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Deskripsi</label>
                    <textarea
                      value={item.desc}
                      onChange={(e) => setProgramItem(cat, idx, { desc: e.target.value })}
                    />
                  </div>
                  <div className="admin-field">
                    <label>URL Foto Dokumentasi</label>
                    <span className="admin-hint">Tempel link gambar (boleh dari mana saja, asal bisa diakses publik). Kosongkan jika belum ada.</span>
                    <input
                      type="text"
                      value={item.img}
                      onChange={(e) => setProgramItem(cat, idx, { img: e.target.value })}
                      placeholder="https://"
                    />
                  </div>
                  <button type="button" className="admin-remove" onClick={() => removeProgramItem(cat, idx)}>
                    <i className="ph-bold ph-trash" /> Hapus item ini
                  </button>
                </div>
              ))}
              <button type="button" className="admin-add" onClick={() => addProgramItem(cat)}>
                <i className="ph-bold ph-plus" /> Tambah item {PROGRAM_LABELS[cat].toLowerCase()}
              </button>
            </div>
          ))}
        </section>

        {/* Divisi photos */}
        <section className="admin-card">
          <h2><i className="ph-bold ph-users" /> Foto Anggota Divisi</h2>
          <p className="admin-note">Nama dan peran anggota diatur langsung di kode (components/Divisi.tsx). Di sini hanya URL foto per anggota.</p>
          {["BPH", "PA", "MD", "DSM"].map((div) => (
            <div className="admin-subblock" key={div}>
              <h3>{div}</h3>
              {MEMBER_LIST.filter((m) => m.division === div).map((m) => (
                <div className="admin-field" key={m.key}>
                  <label>{m.name}</label>
                  <input
                    type="text"
                    value={form.members[m.key] || ""}
                    onChange={(e) => setMember(m.key, e.target.value)}
                    placeholder="https://"
                  />
                </div>
              ))}
            </div>
          ))}
        </section>

        <button className="admin-save" onClick={save} disabled={loading}>
          {loading ? "Menyimpan…" : "Simpan Semua Perubahan"}
        </button>

        {status.msg && <p className={`admin-status ${status.type}`}>{status.msg}</p>}

        <a className="admin-back" href="/">← Kembali ke situs</a>
      </div>
    </main>
  );
}
