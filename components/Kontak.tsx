"use client";
import { useState } from "react";
import { useModal } from "./Modal";

type KontakConfig = {
  instagram: string;
  youtube: string;
  spotify: string;
  tiktok: string;
  email: string;
};

function CopyEmailBox({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="modal-email">
      <span>{email}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(email).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          });
        }}
      >
        <i className={`ph-bold ${copied ? "ph-check" : "ph-copy"}`} /> {copied ? "Tersalin" : "Salin"}
      </button>
    </div>
  );
}

export default function Kontak({ config }: { config: KontakConfig }) {
  const { openDetail } = useModal();

  function handleEmailClick() {
    openDetail({
      title: "Hubungi lewat email",
      desc: null,
      customPhoto: (
        <>
          <i className="ph-bold ph-envelope-simple" />
          <span>Kirim pertanyaan atau ajakan kolaborasi</span>
        </>
      ),
      extra: <CopyEmailBox email={config.email} />,
    });
  }

  return (
    <section className="band" id="kontak">
      <div className="wrap">
        <div className="cta">
          <h2>Temukan kami di social media E-FM</h2>
          <p>Follow Social Media kami untuk informasi acara, event, dan request lagu. Mau kolaborasi siaran atau paid promote hubungi kami melalui email.</p>
          <div className="socials">
            <a href={config.instagram} target="_blank" rel="noopener noreferrer">
              <img className="soc-ic" src="/assets/social-instagram.png" alt="" />Instagram
            </a>
            <a href={config.youtube} target="_blank" rel="noopener noreferrer">
              <img className="soc-ic" src="/assets/social-youtube.png" alt="" />YouTube
            </a>
            <a href={config.spotify} target="_blank" rel="noopener noreferrer">
              <img className="soc-ic" src="/assets/social-spotify.png" alt="" />Spotify
            </a>
            <a href={config.tiktok} target="_blank" rel="noopener noreferrer">
              <img className="soc-ic" src="/assets/social-tiktok.png" alt="" />TikTok
            </a>
            <button type="button" onClick={handleEmailClick}>
              <img className="soc-ic" src="/assets/social-email.png" alt="" />Email
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
