import SigIcon from "./SigIcon";
import type { SiteConfig } from "@/lib/config";

export default function VisiMisi({ visiMisi }: { visiMisi: SiteConfig["visiMisi"] }) {
  return (
    <section className="band" id="visi-misi" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div className="head">
          <SigIcon />
          <h2>{visiMisi.title}</h2>
        </div>
        <div className="vm-grid">
          <div className="list-panel">
            <h3><i className="ph-bold ph-target" style={{ color: "var(--violet)" }} />VISI</h3>
            <ol>
              {visiMisi.visi.map((text, i) => (
                <li key={i}><b>{i + 1}</b>{text}</li>
              ))}
            </ol>
          </div>
          <div className="list-panel">
            <h3><i className="ph-bold ph-flag-pennant" style={{ color: "var(--violet)" }} />MISI</h3>
            <ol>
              {visiMisi.misi.map((text, i) => (
                <li key={i}><b>{i + 1}</b>{text}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
