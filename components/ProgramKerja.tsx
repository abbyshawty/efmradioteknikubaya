"use client";
import SigIcon from "./SigIcon";
import { useModal } from "./Modal";
import type { ProgramKerja as ProgramKerjaType } from "@/lib/config";

const ICONS: Record<string, string> = {
  harian: "ph-calendar-check",
  bulanan: "ph-calendar-dots",
  tahunan: "ph-calendar-star",
};

export default function ProgramKerja({ programKerja }: { programKerja: ProgramKerjaType }) {
  const { openDetail, openList } = useModal();

  function handleClick(key: keyof ProgramKerjaType) {
    const cat = programKerja[key];
    if (!cat) return;
    if (cat.items.length === 1) openDetail(cat.items[0]);
    else openList(cat.title, cat.items);
  }

  return (
    <section className="band" id="program">
      <div className="wrap">
        <div className="head">
          <SigIcon />
          <h2>Program Kerja E-FM</h2>
          <p>Pilih kategori untuk melihat dokumentasi foto dan detail program kerja kami.</p>
        </div>
        <div className="wp-grid">
          {(Object.keys(programKerja) as (keyof ProgramKerjaType)[]).map((key) => (
            <button key={key} type="button" className="wp-card" onClick={() => handleClick(key)}>
              <i className={`ph-bold ${ICONS[key]}`} />
              <h3>{programKerja[key].title}</h3>
              <span className="wp-open">Lihat detail <i className="ph-bold ph-arrow-right" /></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
