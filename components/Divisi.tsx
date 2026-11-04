import SigIcon from "./SigIcon";
import type { Division } from "@/lib/config";

export default function Divisi({ title, divisions }: { title: string; divisions: Division[] }) {
  return (
    <section className="band" id="tim">
      <div className="wrap">
        <div className="head">
          <SigIcon />
          <h2>{title}</h2>
        </div>
        <div className="div-list">
          {divisions.map((div, di) => (
            <div className="div-panel" key={di}>
              <div className="div-head">
                <h3>{div.name}</h3>
                {div.code && <span className="div-code">{div.code}</span>}
              </div>
              {div.desc && <p>{div.desc}</p>}
              <div className="member-grid">
                {div.members.map((m, mi) => (
                  <div className="member" key={mi}>
                    {m.photo ? (
                      <div className="photo filled">
                        <img src={m.photo} alt={m.name} />
                      </div>
                    ) : (
                      <div className="photo">
                        <i className="ph-bold ph-camera" />
                        <span>Foto menyusul</span>
                      </div>
                    )}
                    <b>{m.name}</b>
                    {m.nick && <span className="nick">({m.nick})</span>}
                    <span className="role">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
