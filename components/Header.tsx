"use client";
import { useState } from "react";

const links: [string, string][] = [
  ["#live", "Live Streaming"],
  ["#request", "Request"],
  ["#tentang", "About"],
  ["#program", "Program"],
  ["#tim", "Divisi"],
  ["#kontak", "Social Media"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="top">
      <div className="wrap top-in">
        <div className="idmark">
          <img className="efm" src="/assets/logo-efm.png" alt="107.9 E-FM" />
          <span className="sep" />
          <img className="uby" src="/assets/logo-ubaya.png" alt="Universitas Surabaya" />
        </div>
        <nav id="nav" className={open ? "open" : ""}>
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a href="#live" className="tune">
          <span className="tally on" />
          Live
        </a>
        <button className="burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          <i className="ph-bold ph-list" style={{ fontSize: 24 }} />
        </button>
      </div>
    </header>
  );
}
