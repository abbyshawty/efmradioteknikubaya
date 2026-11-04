import type { SiteConfig } from "@/lib/config";

export default function Footer({ logos, text }: { logos: SiteConfig["logos"]; text: string }) {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="wrap foot">
        <div className="lock">
          <img className="efm" src={logos.efm} alt="107.9 E-FM" />
          <span className="sep" />
          <img className="uby" src={logos.ubaya} alt="UBAYA" />
        </div>
        <div className="id">
          {text}
          <br />
          © {year} · seluruh hak dilindungi · <a href="/admin">Admin</a>
        </div>
      </div>
    </footer>
  );
}
