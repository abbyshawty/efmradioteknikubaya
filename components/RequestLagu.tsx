"use client";
import { useRef, useState } from "react";
import SigIcon from "./SigIcon";
import type { SiteConfig } from "@/lib/config";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function RequestLagu({
  section,
  instagram,
}: {
  section: SiteConfig["requestSection"];
  instagram: string;
}) {
  const [day, setDay] = useState("");
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [showOk, setShowOk] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const okTimer = useRef<ReturnType<typeof setTimeout>>();

  function submitRequest(data: Record<string, string>) {
    // Dikirim ke endpoint kita sendiri, bukan langsung ke webhook Google
    // Sheets -- supaya URL webhook itu tidak pernah terlihat di browser
    // pengunjung (lihat app/api/request-lagu/route.ts).
    return fetch("/api/request-lagu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const el = form.elements as any;
    const values = {
      nama: (el.nama.value || "").trim(),
      lagu: (el.lagu.value || "").trim(),
      link: (el.link.value || "").trim(),
      hari: day,
      pesan: (el.pesan.value || "").trim(),
    };
    const nextInvalid: Record<string, boolean> = {};
    (["nama", "lagu", "link", "hari"] as const).forEach((name) => {
      if (!values[name]) nextInvalid[name] = true;
    });
    setInvalid(nextInvalid);
    if (Object.keys(nextInvalid).length > 0) return;

    submitRequest(values).then(() => {
      setShowOk(true);
      form.reset();
      setDay("");
      clearTimeout(okTimer.current);
      okTimer.current = setTimeout(() => setShowOk(false), 6000);
    });
  }

  return (
    <section className="band" id="request">
      <div className="wrap">
        <div className="head">
          <SigIcon />
          <h2>{section.title}</h2>
          {section.desc && <p>{section.desc}</p>}
        </div>

        <div className="req-grid">
          <div className="list-panel">
            <h3><i className="ph-bold ph-list-checks" style={{ color: "var(--violet)" }} />Aturan singkat</h3>
            <ol>
              {section.rules.map((rule, i) => (
                <li key={i}><b>{i + 1}</b>{rule}</li>
              ))}
            </ol>
            {(section.noteText || section.noteLinkText) && (
              <p className="note">
                {section.noteText}
                {section.noteLinkText && (
                  <>
                    {" "}
                    <a href={instagram} target="_blank" rel="noopener noreferrer">{section.noteLinkText}</a>.
                  </>
                )}
              </p>
            )}
          </div>

          <form className="req-form" ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className={`field${invalid.nama ? " invalid" : ""}`}>
              <label htmlFor="reqNama">Nama kamu</label>
              <span className="hint">Boleh nama asli atau nama samaran.</span>
              <input type="text" id="reqNama" name="nama" />
              <span className="field-error">Nama wajib diisi.</span>
            </div>

            <div className={`field${invalid.lagu ? " invalid" : ""}`}>
              <label htmlFor="reqLagu">Judul dan nama artis</label>
              <span className="hint">Format: Judul - Nama Artis.</span>
              <input type="text" id="reqLagu" name="lagu" placeholder="Contoh: Frekuensi - Nama Band" />
              <span className="field-error">Judul dan nama artis wajib diisi.</span>
            </div>

            <div className={`field${invalid.link ? " invalid" : ""}`}>
              <label htmlFor="reqLink">Link musik</label>
              <span className="hint">Tautan Spotify, YouTube, atau lainnya.</span>
              <input type="url" id="reqLink" name="link" placeholder="https://" />
              <span className="field-error">Link musik wajib diisi.</span>
            </div>

            <div className={`field${invalid.hari ? " invalid" : ""}`}>
              <label>Mau diputarkan hari apa?</label>
              <span className="hint">Pilih salah satu.</span>
              <div className="day-picker">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={day === d ? "active" : ""}
                    onClick={() => setDay(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <span className="field-error">Pilih salah satu hari.</span>
            </div>

            <div className="field">
              <label htmlFor="reqPesan">Pesan <span className="hint" style={{ fontWeight: 400 }}>(opsional)</span></label>
              <span className="hint">Kesan atau pesan sebelum lagunya diputar. Tanpa kata-kata kasar, ya.</span>
              <textarea id="reqPesan" name="pesan" />
            </div>

            <button type="submit" className="btn btn-solid req-submit">Kirim request</button>
            <div className={`req-ok${showOk ? " show" : ""}`}>
              <i className="ph-bold ph-check-circle" style={{ fontSize: 18 }} />
              Request diterima. Terima kasih sudah kirim lagu.
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
