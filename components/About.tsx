import SigIcon from "./SigIcon";
import type { SiteConfig } from "@/lib/config";

export default function About({ about }: { about: SiteConfig["about"] }) {
  return (
    <section className="band" id="tentang">
      <div className="wrap">
        <div className="head" style={{ marginBottom: 34 }}>
          <SigIcon />
          <h2>{about.title}</h2>
        </div>
        <div className="about">
          <div className="body">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <dl className="facts">
            {about.facts.map((f, i) => (
              <div className="row" key={i}>
                <dt>{f.label}</dt>
                <dd>
                  {f.value}
                  {f.sub && <span>{f.sub}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
