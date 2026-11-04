"use client";
import { useEffect, useState } from "react";
import ImageCropUpload from "@/components/admin/ImageCropUpload";
import ImageUpload from "@/components/admin/ImageUpload";
import type {
  AboutFact,
  Division,
  Member,
  ProgramItem,
  ProgramKerja as ProgramKerjaType,
  SiteConfig,
} from "@/lib/config";

const EMPTY_ITEM: ProgramItem = { title: "", desc: "", img: "" };
const EMPTY_MEMBER: Member = { name: "", nick: "", role: "Anggota", photo: "" };
const EMPTY_DIVISION: Division = { name: "", code: "", desc: "", members: [] };
const EMPTY_FACT: AboutFact = { label: "", value: "", sub: "" };

const PROGRAM_LABELS: Record<keyof ProgramKerjaType, string> = {
  harian: "Harian",
  bulanan: "Bulanan",
  tahunan: "Tahunan",
};

const TABS = [
  { id: "umum", label: "Umum", icon: "ph-gear" },
  { id: "hero", label: "Hero", icon: "ph-radio" },
  { id: "visimisi", label: "Visi Misi", icon: "ph-target" },
  { id: "live", label: "Live", icon: "ph-broadcast" },
  { id: "request", label: "Request Lagu", icon: "ph-music-notes" },
  { id: "about", label: "About", icon: "ph-info" },
  { id: "program", label: "Program Kerja", icon: "ph-calendar-check" },
  { id: "divisi", label: "Divisi", icon: "ph-users" },
  { id: "kontak", label: "Kontak", icon: "ph-share-network" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ---------- helper array: dipakai untuk semua daftar yang bisa diurutkan ----------
function moveItem<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const to = idx + dir;
  if (to < 0 || to >= arr.length) return arr;
  const out = [...arr];
  [out[idx], out[to]] = [out[to], out[idx]];
  return out;
}
function replaceItem<T>(arr: T[], idx: number, value: T): T[] {
  return arr.map((v, i) => (i === idx ? value : v));
}
function removeItem<T>(arr: T[], idx: number): T[] {
  return arr.filter((_, i) => i !== idx);
}

// ---------- komponen form kecil ----------
function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {hint && <span className="admin-hint">{hint}</span>}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function ItemTools({
  idx,
  total,
  onMove,
  onRemove,
  removeLabel = "Hapus",
}: {
  idx: number;
  total: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  removeLabel?: string;
}) {
  return (
    <div className="admin-item-tools">
      <button type="button" className="admin-icon-btn" onClick={() => onMove(-1)} disabled={idx === 0} aria-label="Naikkan">
        <i className="ph-bold ph-arrow-up" />
      </button>
      <button type="button" className="admin-icon-btn" onClick={() => onMove(1)} disabled={idx === total - 1} aria-label="Turunkan">
        <i className="ph-bold ph-arrow-down" />
      </button>
      <button type="button" className="admin-remove" onClick={onRemove}>
        <i className="ph-bold ph-trash" /> {removeLabel}
      </button>
    </div>
  );
}

/** Daftar teks bernomor (visi, misi, aturan, paragraf). */
function StringList({
  label,
  hint,
  items,
  onChange,
  addLabel,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
}) {
  return (
    <div className="admin-subblock">
      <h3>{label}</h3>
      {hint && <p className="admin-note">{hint}</p>}
      {items.map((text, idx) => (
        <div className="admin-list-row" key={idx}>
          <span className="admin-list-num">{idx + 1}</span>
          <textarea value={text} onChange={(e) => onChange(replaceItem(items, idx, e.target.value))} />
          <ItemTools
            idx={idx}
            total={items.length}
            onMove={(dir) => onChange(moveItem(items, idx, dir))}
            onRemove={() => onChange(removeItem(items, idx))}
          />
        </div>
      ))}
      <button type="button" className="admin-add" onClick={() => onChange([...items, ""])}>
        <i className="ph-bold ph-plus" /> {addLabel}
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [form, setForm] = useState<SiteConfig | null>(null);
  const [tab, setTab] = useState<TabId>("umum");
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err" | ""; msg: string }>({ type: "", msg: "" });
  const [saving, setSaving] = useState(false);

  async function loadAdminConfig() {
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setForm(data);
        setDirty(false);
        setAuthed(true);
      } else {
        setAuthed(false);
      }
    } catch {
      setAuthed(false);
    } finally {
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    loadAdminConfig();
  }, []);

  // peringatkan sebelum menutup tab kalau masih ada perubahan yang belum disimpan
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Gagal login.");
        return;
      }
      setLoginPassword("");
      await loadAdminConfig();
    } catch {
      setLoginError("Tidak bisa menghubungi server.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    if (dirty && !confirm("Ada perubahan yang belum disimpan. Tetap keluar?")) return;
    await fetch("/api/admin-logout", { method: "POST" }).catch(() => {});
    setAuthed(false);
    setForm(null);
    setDirty(false);
  }

  function set<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setDirty(true);
  }

  /** Ubah sebagian field di dalam objek bersarang, mis. patch("hero", { tagline }) */
  function patch<K extends keyof SiteConfig>(key: K, value: Partial<SiteConfig[K]>) {
    setForm((f) => (f ? { ...f, [key]: { ...(f[key] as object), ...value } } : f));
    setDirty(true);
  }

  /** Pakai updater fungsional: callback upload foto selesai secara async,
   *  jadi harus berangkat dari state terbaru, bukan dari closure saat klik. */
  function setProgramItems(cat: keyof ProgramKerjaType, update: (items: ProgramItem[]) => ProgramItem[]) {
    setForm((f) =>
      f
        ? {
            ...f,
            programKerja: {
              ...f.programKerja,
              [cat]: { ...f.programKerja[cat], items: update(f.programKerja[cat].items) },
            },
          }
        : f
    );
    setDirty(true);
  }

  function setProgramTitle(cat: keyof ProgramKerjaType, title: string) {
    setForm((f) =>
      f ? { ...f, programKerja: { ...f.programKerja, [cat]: { ...f.programKerja[cat], title } } } : f
    );
    setDirty(true);
  }

  function updateDivisions(update: (divisions: Division[]) => Division[]) {
    setForm((f) => (f ? { ...f, divisions: update(f.divisions) } : f));
    setDirty(true);
  }

  function updateDivision(idx: number, update: (div: Division) => Division) {
    updateDivisions((divs) => divs.map((d, i) => (i === idx ? update(d) : d)));
  }

  function setDivision(idx: number, value: Partial<Division>) {
    updateDivision(idx, (d) => ({ ...d, ...value }));
  }

  function updateMembers(divIdx: number, update: (members: Member[]) => Member[]) {
    updateDivision(divIdx, (d) => ({ ...d, members: update(d.members) }));
  }

  function setMember(divIdx: number, memIdx: number, value: Partial<Member>) {
    updateMembers(divIdx, (ms) => ms.map((m, i) => (i === memIdx ? { ...m, ...value } : m)));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setStatus({ type: "", msg: "" });
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAuthed(false);
          setStatus({ type: "err", msg: "Sesi berakhir, silakan login ulang." });
        } else {
          setStatus({ type: "err", msg: data.error || "Gagal menyimpan." });
        }
      } else {
        setDirty(false);
        const where = data.storage === "redis" ? "Upstash Redis" : "file lokal";
        setStatus({ type: "ok", msg: `Tersimpan ke ${where}. Perubahan langsung tampil di halaman utama.` });
      }
    } catch {
      setStatus({ type: "err", msg: "Tidak bisa menghubungi server." });
    } finally {
      setSaving(false);
    }
  }

  if (!authChecked) {
    return (
      <main className="admin-shell">
        <div className="admin-wrap">
          <p className="admin-loading">Memuat…</p>
        </div>
      </main>
    );
  }

  if (!authed || !form) {
    return (
      <main className="admin-login-shell">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-login-icon"><i className="ph-bold ph-lock-key" /></div>
          <h1>Panel Admin E-FM</h1>
          <p>Masuk untuk mengatur konten situs 107.9 E-FM.</p>
          <div className="admin-field">
            <input
              type="text"
              placeholder="Username admin"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="admin-field">
            <input
              type="password"
              placeholder="Password admin"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="admin-save" disabled={loginLoading}>
            {loginLoading ? "Memeriksa…" : "Masuk"}
          </button>
          {loginError && <p className="admin-status err">{loginError}</p>}
          {status.type === "err" && <p className="admin-status err">{status.msg}</p>}
          <a className="admin-back" href="/">← Kembali ke situs</a>
        </form>
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
          <button className="admin-logout" onClick={handleLogout} style={{ marginTop: 10 }}>
            <i className="ph-bold ph-sign-out" /> Keluar dari sesi admin
          </button>
        </header>

        <nav className="admin-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              <i className={`ph-bold ${t.icon}`} /> {t.label}
            </button>
          ))}
        </nav>

        {tab === "umum" && (
          <>
            <section className="admin-card">
              <h2><i className="ph-bold ph-image" /> Logo</h2>
              <p className="admin-note">Tampil di header dan footer. Gunakan PNG berlatar transparan agar menyatu dengan tampilan gelap.</p>
              <ImageUpload label="Logo E-FM" value={form.logos.efm} onChange={(url) => patch("logos", { efm: url })} />
              <ImageUpload label="Logo Ubaya" value={form.logos.ubaya} onChange={(url) => patch("logos", { ubaya: url })} />
            </section>
            <section className="admin-card">
              <h2><i className="ph-bold ph-rows" /> Footer</h2>
              <Field
                label="Baris identitas stasiun"
                hint="Tahun hak cipta dan link Admin ditambahkan otomatis di bawahnya."
                value={form.footer.text}
                onChange={(v) => patch("footer", { text: v })}
              />
            </section>
          </>
        )}

        {tab === "hero" && (
          <>
            <section className="admin-card">
              <h2><i className="ph-bold ph-radio" /> Hero</h2>
              <Field label="Judul baris 1" value={form.hero.line1} onChange={(v) => patch("hero", { line1: v })} />
              <Field label="Judul baris 2" value={form.hero.line2} onChange={(v) => patch("hero", { line2: v })} />
              <Field label="Tagline" value={form.hero.tagline} onChange={(v) => patch("hero", { tagline: v })} />
            </section>
            <section className="admin-card">
              <h2><i className="ph-bold ph-text-aa" /> Teks Berjalan (Ticker)</h2>
              <Field
                label="Pesan"
                hint="Diulang terus di pita berjalan di bawah hero. Mengklik pita membuka bagian Request Lagu."
                value={form.ticker.message}
                onChange={(v) => patch("ticker", { message: v })}
              />
            </section>
          </>
        )}

        {tab === "visimisi" && (
          <section className="admin-card">
            <h2><i className="ph-bold ph-target" /> Visi & Misi</h2>
            <Field label="Judul bagian" value={form.visiMisi.title} onChange={(v) => patch("visiMisi", { title: v })} />
            <StringList label="Visi" items={form.visiMisi.visi} onChange={(visi) => patch("visiMisi", { visi })} addLabel="Tambah poin visi" />
            <StringList label="Misi" items={form.visiMisi.misi} onChange={(misi) => patch("visiMisi", { misi })} addLabel="Tambah poin misi" />
          </section>
        )}

        {tab === "live" && (
          <section className="admin-card">
            <h2><i className="ph-bold ph-broadcast" /> Live Streaming</h2>
            <Field label="Judul bagian" value={form.liveSection.title} onChange={(v) => patch("liveSection", { title: v })} />
            <Field
              label="ID Video Live YouTube"
              hint="Dari link youtube.com/watch?v=ABC123, isi: ABC123. Kosongkan jika belum ada siaran."
              value={form.youtubeVideoId}
              onChange={(v) => set("youtubeVideoId", v)}
              placeholder="ABC123xyz"
            />
            <Field
              label="Domain Hosting (untuk live chat)"
              hint="Tanpa https://, mis. efm.ubaya.ac.id. Kosongkan untuk otomatis pakai domain saat ini."
              value={form.liveChatDomain}
              onChange={(v) => set("liveChatDomain", v)}
              placeholder="efm.ubaya.ac.id"
            />
            <Field
              label="Link Channel YouTube"
              value={form.channelUrl}
              onChange={(v) => set("channelUrl", v)}
              placeholder="https://www.youtube.com/@efmftubaya"
            />
          </section>
        )}

        {tab === "request" && (
          <>
            <section className="admin-card">
              <h2><i className="ph-bold ph-music-notes" /> Request Lagu</h2>
              <Field label="Judul bagian" value={form.requestSection.title} onChange={(v) => patch("requestSection", { title: v })} />
              <Field label="Deskripsi" multiline value={form.requestSection.desc} onChange={(v) => patch("requestSection", { desc: v })} />
              <StringList
                label="Aturan singkat"
                items={form.requestSection.rules}
                onChange={(rules) => patch("requestSection", { rules })}
                addLabel="Tambah aturan"
              />
              <div className="admin-subblock">
                <h3>Catatan di bawah aturan</h3>
                <Field label="Teks" value={form.requestSection.noteText} onChange={(v) => patch("requestSection", { noteText: v })} />
                <Field
                  label="Teks link Instagram"
                  hint="Mengarah ke link Instagram di tab Kontak. Kosongkan untuk menyembunyikan link."
                  value={form.requestSection.noteLinkText}
                  onChange={(v) => patch("requestSection", { noteLinkText: v })}
                />
              </div>
            </section>
            <section className="admin-card">
              <h2><i className="ph-bold ph-table" /> Google Sheets</h2>
              <Field
                label="URL Google Apps Script (webhook Sheets)"
                hint="Lihat langkah deploy lengkap di file SETUP-REQUEST-LAGU.md. URL ini tidak pernah dikirim ke browser pengunjung, hanya dipakai server saat memproses form Request Lagu."
                value={form.sheetWebhookUrl}
                onChange={(v) => set("sheetWebhookUrl", v)}
                placeholder="https://script.google.com/macros/s/.../exec"
              />
            </section>
          </>
        )}

        {tab === "about" && (
          <section className="admin-card">
            <h2><i className="ph-bold ph-info" /> About</h2>
            <Field label="Judul bagian" value={form.about.title} onChange={(v) => patch("about", { title: v })} />
            <StringList
              label="Paragraf"
              items={form.about.paragraphs}
              onChange={(paragraphs) => patch("about", { paragraphs })}
              addLabel="Tambah paragraf"
            />
            <div className="admin-subblock">
              <h3>Fakta singkat</h3>
              {form.about.facts.map((fact, idx) => (
                <div className="admin-item" key={idx}>
                  <Field
                    label="Label"
                    value={fact.label}
                    placeholder="Sejak"
                    onChange={(v) => patch("about", { facts: replaceItem(form.about.facts, idx, { ...fact, label: v }) })}
                  />
                  <Field
                    label="Nilai"
                    value={fact.value}
                    placeholder="1990-an"
                    onChange={(v) => patch("about", { facts: replaceItem(form.about.facts, idx, { ...fact, value: v }) })}
                  />
                  <Field
                    label="Keterangan (opsional)"
                    value={fact.sub}
                    placeholder="tahun mengudara"
                    onChange={(v) => patch("about", { facts: replaceItem(form.about.facts, idx, { ...fact, sub: v }) })}
                  />
                  <ItemTools
                    idx={idx}
                    total={form.about.facts.length}
                    onMove={(dir) => patch("about", { facts: moveItem(form.about.facts, idx, dir) })}
                    onRemove={() => patch("about", { facts: removeItem(form.about.facts, idx) })}
                  />
                </div>
              ))}
              <button
                type="button"
                className="admin-add"
                onClick={() => patch("about", { facts: [...form.about.facts, { ...EMPTY_FACT }] })}
              >
                <i className="ph-bold ph-plus" /> Tambah fakta
              </button>
            </div>
          </section>
        )}

        {tab === "program" && (
          <>
            <section className="admin-card">
              <h2><i className="ph-bold ph-text-h" /> Judul Bagian</h2>
              <Field label="Judul" value={form.programSection.title} onChange={(v) => patch("programSection", { title: v })} />
              <Field label="Deskripsi" value={form.programSection.desc} onChange={(v) => patch("programSection", { desc: v })} />
            </section>
            <section className="admin-card">
              <h2><i className="ph-bold ph-calendar-check" /> Program Kerja</h2>
              {(Object.keys(form.programKerja) as (keyof ProgramKerjaType)[]).map((cat) => {
                const items = form.programKerja[cat].items;
                return (
                  <div className="admin-subblock" key={cat}>
                    <h3>{PROGRAM_LABELS[cat]}</h3>
                    <Field
                      label="Judul kategori"
                      value={form.programKerja[cat].title}
                      onChange={(v) => setProgramTitle(cat, v)}
                    />
                    {items.map((item, idx) => (
                      <div className="admin-item" key={idx}>
                        <Field
                          label="Judul"
                          value={item.title}
                          onChange={(v) => setProgramItems(cat, (its) => replaceItem(its, idx, { ...its[idx], title: v }))}
                        />
                        <Field
                          label="Deskripsi"
                          multiline
                          value={item.desc}
                          onChange={(v) => setProgramItems(cat, (its) => replaceItem(its, idx, { ...its[idx], desc: v }))}
                        />
                        <ImageCropUpload
                          label="Foto Dokumentasi"
                          hint="Rasio dikunci 16:10, atur posisi & zoom sebelum diunggah."
                          aspect={16 / 10}
                          value={item.img}
                          onChange={(url) => setProgramItems(cat, (its) => replaceItem(its, idx, { ...its[idx], img: url }))}
                        />
                        <ItemTools
                          idx={idx}
                          total={items.length}
                          onMove={(dir) => setProgramItems(cat, (its) => moveItem(its, idx, dir))}
                          onRemove={() => setProgramItems(cat, (its) => removeItem(its, idx))}
                          removeLabel="Hapus item ini"
                        />
                      </div>
                    ))}
                    <button type="button" className="admin-add" onClick={() => setProgramItems(cat, (its) => [...its, { ...EMPTY_ITEM }])}>
                      <i className="ph-bold ph-plus" /> Tambah item {PROGRAM_LABELS[cat].toLowerCase()}
                    </button>
                  </div>
                );
              })}
            </section>
          </>
        )}

        {tab === "divisi" && (
          <>
            <section className="admin-card">
              <h2><i className="ph-bold ph-text-h" /> Judul Bagian</h2>
              <Field label="Judul" value={form.divisiSection.title} onChange={(v) => patch("divisiSection", { title: v })} />
            </section>
            {form.divisions.map((div, di) => (
              <section className="admin-card" key={di}>
                <h2><i className="ph-bold ph-users" /> {div.name || `Divisi ${di + 1}`}</h2>
                <Field label="Nama divisi" value={div.name} onChange={(v) => setDivision(di, { name: v })} placeholder="Music Director" />
                <Field label="Kode singkat" value={div.code} onChange={(v) => setDivision(di, { code: v })} placeholder="MD" />
                <Field label="Deskripsi" multiline value={div.desc} onChange={(v) => setDivision(di, { desc: v })} />

                <div className="admin-subblock">
                  <h3>Anggota</h3>
                  {div.members.map((m, mi) => (
                    <div className="admin-item" key={mi}>
                      <Field label="Nama lengkap" value={m.name} onChange={(v) => setMember(di, mi, { name: v })} />
                      <Field label="Nama panggilan" value={m.nick} onChange={(v) => setMember(di, mi, { nick: v })} />
                      <Field label="Peran" value={m.role} onChange={(v) => setMember(di, mi, { role: v })} placeholder="Koordinator / Anggota" />
                      <ImageCropUpload
                        label="Foto"
                        hint="Rasio dikunci 1:1."
                        aspect={1}
                        value={m.photo}
                        onChange={(url) => setMember(di, mi, { photo: url })}
                      />
                      <ItemTools
                        idx={mi}
                        total={div.members.length}
                        onMove={(dir) => updateMembers(di, (ms) => moveItem(ms, mi, dir))}
                        onRemove={() => {
                          if (confirm(`Hapus anggota ${m.name || "ini"}?`)) {
                            updateMembers(di, (ms) => removeItem(ms, mi));
                          }
                        }}
                        removeLabel="Hapus anggota"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    className="admin-add"
                    onClick={() => updateMembers(di, (ms) => [...ms, { ...EMPTY_MEMBER }])}
                  >
                    <i className="ph-bold ph-user-plus" /> Tambah anggota
                  </button>
                </div>

                <div className="admin-subblock">
                  <ItemTools
                    idx={di}
                    total={form.divisions.length}
                    onMove={(dir) => updateDivisions((ds) => moveItem(ds, di, dir))}
                    onRemove={() => {
                      if (confirm(`Hapus divisi ${div.name || "ini"} beserta seluruh anggotanya?`)) {
                        updateDivisions((ds) => removeItem(ds, di));
                      }
                    }}
                    removeLabel="Hapus divisi"
                  />
                </div>
              </section>
            ))}
            <button
              type="button"
              className="admin-add admin-add-block"
              onClick={() => updateDivisions((ds) => [...ds, { ...EMPTY_DIVISION, members: [] }])}
            >
              <i className="ph-bold ph-plus" /> Tambah divisi
            </button>
          </>
        )}

        {tab === "kontak" && (
          <>
            <section className="admin-card">
              <h2><i className="ph-bold ph-text-h" /> Teks Bagian</h2>
              <Field label="Judul" value={form.kontak.title} onChange={(v) => patch("kontak", { title: v })} />
              <Field label="Deskripsi" multiline value={form.kontak.desc} onChange={(v) => patch("kontak", { desc: v })} />
            </section>
            <section className="admin-card">
              <h2><i className="ph-bold ph-share-network" /> Media Sosial</h2>
              <Field label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} />
              <Field label="YouTube" value={form.youtube} onChange={(v) => set("youtube", v)} />
              <Field label="Spotify" value={form.spotify} onChange={(v) => set("spotify", v)} />
              <Field label="TikTok" value={form.tiktok} onChange={(v) => set("tiktok", v)} />
              <Field
                label="Email Kontak"
                hint="Ditampilkan lewat popup saat tombol Email di situs diklik."
                value={form.email}
                onChange={(v) => set("email", v)}
              />
            </section>
          </>
        )}

        <div className="admin-savebar">
          {status.msg && <p className={`admin-status ${status.type}`}>{status.msg}</p>}
          <button className="admin-save" onClick={save} disabled={saving}>
            {saving ? "Menyimpan…" : dirty ? "Simpan Semua Perubahan •" : "Simpan Semua Perubahan"}
          </button>
        </div>

        <a className="admin-back" href="/">← Kembali ke situs</a>
      </div>
    </main>
  );
}
