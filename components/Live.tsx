"use client";
import { useEffect, useRef, useState } from "react";
import SigIcon from "./SigIcon";

type LiveConfig = {
  youtubeVideoId: string;
  liveChatDomain: string;
  channelUrl: string;
};

export default function Live({ config }: { config: LiveConfig }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showEmptyScreen, setShowEmptyScreen] = useState(true);
  const [showChatNote, setShowChatNote] = useState(true);
  const [sendEnabled, setSendEnabled] = useState(false);
  const [note, setNote] = useState("");
  const chatTargetUrl = useRef(config.channelUrl || "https://www.youtube.com");
  const noteTimer = useRef<ReturnType<typeof setTimeout>>();

  const vid = (config.youtubeVideoId || "").trim();

  useEffect(() => {
    if (!vid) return;
    setShowEmptyScreen(false);
    const scr = screenRef.current;
    if (scr) {
      const f = document.createElement("iframe");
      f.src = "https://www.youtube.com/embed/" + encodeURIComponent(vid) + "?rel=0";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.title = "Live Streaming";
      scr.appendChild(f);
    }
    chatTargetUrl.current = "https://www.youtube.com/watch?v=" + encodeURIComponent(vid);

    const domain = (config.liveChatDomain || "").trim() || window.location.hostname;
    const local = !domain || domain === "localhost" || domain === "127.0.0.1" || window.location.protocol === "file:";
    if (!local && chatBodyRef.current) {
      setShowChatNote(false);
      const c = document.createElement("iframe");
      c.src = "https://www.youtube.com/live_chat?v=" + encodeURIComponent(vid) + "&embed_domain=" + encodeURIComponent(domain);
      c.title = "Live chat";
      chatBodyRef.current.appendChild(c);
    }
  }, [vid, config.liveChatDomain]);

  function sendMessage() {
    const input = inputRef.current;
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    const finish = () => {
      window.open(chatTargetUrl.current, "_blank", "noopener");
      setNote("Pesan disalin. Tempel di kolom live chat YouTube yang baru terbuka.");
      input.value = "";
      setSendEnabled(false);
      clearTimeout(noteTimer.current);
      noteTimer.current = setTimeout(() => setNote(""), 6000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(msg).then(finish).catch(finish);
    } else {
      finish();
    }
  }

  return (
    <section className="band" id="live">
      <div className="wrap">
        <div className="head">
          <SigIcon />
          <h2>Live Streaming</h2>
        </div>

        <div className="live-grid">
          <div className="console">
            <div className="console-bar">
              <span className="tally on" />
              Live Streaming<span className="rw">CH 01 · YouTube</span>
            </div>
            <div className="screen" ref={screenRef}>
              {showEmptyScreen && (
                <div className="scr-empty">
                  <div>
                    <div className="ic"><i className="ph-bold ph-monitor-play" style={{ fontSize: 24 }} /></div>
                    <b style={{ fontFamily: "var(--font-d)" }}>Frekuensi belum mengudara</b>
                    <small>Siaran otomatis tampil di sini begitu ID video live YouTube dimasukkan lewat halaman admin.</small>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="console chat">
            <div className="console-bar">
              <i className="ph-bold ph-chat-circle-text" style={{ fontSize: 16 }} />
              Live chat<span className="rw">terhubung</span>
            </div>
            <div className="body" ref={chatBodyRef}>
              {showChatNote && (
                <div className="note">
                  <div>
                    <b>Live chat menyala saat siaran dimulai</b>
                    Chat akan muncul otomatis begitu ID video diisi dan situs diakses lewat domainmu (bukan file lokal).
                  </div>
                </div>
              )}
            </div>
            <div className="compose">
              <input
                type="text"
                ref={inputRef}
                placeholder="Titip pesan atau request lagu…"
                autoComplete="off"
                onChange={(e) => setSendEnabled(e.target.value.trim().length > 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && sendEnabled) sendMessage();
                }}
              />
              <button type="button" disabled={!sendEnabled} onClick={sendMessage}>
                Kirim<i className="ph-bold ph-paper-plane-tilt" />
              </button>
            </div>
            <div className="compose-note" aria-live="polite">{note}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
