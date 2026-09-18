"use client";
import { useEffect, useRef } from "react";

const GLITCH_LINES = ["E-FM Radio Kampus", "Universitas Surabaya"];

export default function Hero() {
  const needleRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const tunerRef = useRef<HTMLDivElement>(null);
  const glitchRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- Needle settle to 107.9 ----
    const needle = needleRef.current;
    if (needle) {
      const pos = ((107.9 - 88) / (108 - 88)) * 100;
      if (REDUCE) {
        needle.style.left = pos + "%";
      } else {
        needle.style.left = "58%";
        requestAnimationFrame(() =>
          setTimeout(() => {
            needle.style.left = pos + "%";
          }, 240)
        );
      }
    }

    // ---- HUD spectrum: equalizer bars ----
    let waveRaf = 0;
    const waveCanvas = waveRef.current;
    if (waveCanvas) {
      const ctx = waveCanvas.getContext("2d");
      const css = getComputedStyle(document.documentElement);
      const violet = css.getPropertyValue("--violet").trim();
      const lilac = css.getPropertyValue("--lilac").trim();
      let w = 0, h = 0;
      const N = 46;
      let bars: { phase: number; speed: number; base: number }[] = [];

      function size() {
        const r = waveCanvas!.getBoundingClientRect();
        w = waveCanvas!.width = r.width * devicePixelRatio;
        h = waveCanvas!.height = r.height * devicePixelRatio;
        bars = Array.from({ length: N }, () => ({
          phase: Math.random() * Math.PI * 2,
          speed: 0.05 + Math.random() * 0.06,
          base: 0.15 + Math.random() * 0.15,
        }));
      }
      function frame(t: number) {
        ctx!.clearRect(0, 0, w, h);
        const gap = w / N;
        const bw = gap * 0.46;
        for (let i = 0; i < N; i++) {
          const b = bars[i];
          const centerBias = 1 - (Math.abs(i - N / 2) / (N / 2)) * 0.55;
          const amp = (b.base + 0.85 * Math.abs(Math.sin(t * 0.001 * b.speed * 20 + b.phase))) * centerBias;
          const bh = Math.max(h * 0.06, amp * h);
          const x = i * gap + (gap - bw) / 2;
          const y = h - bh;
          const grad = ctx!.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, lilac);
          grad.addColorStop(1, violet);
          ctx!.fillStyle = grad;
          const r = Math.min(3, bw / 2);
          ctx!.beginPath();
          ctx!.moveTo(x, h);
          ctx!.lineTo(x, y + r);
          ctx!.arcTo(x, y, x + r, y, r);
          ctx!.lineTo(x + bw - r, y);
          ctx!.arcTo(x + bw, y, x + bw, y + r, r);
          ctx!.lineTo(x + bw, h);
          ctx!.closePath();
          ctx!.globalAlpha = 0.85;
          ctx!.fill();
        }
        if (!REDUCE) waveRaf = requestAnimationFrame(frame);
      }
      size();
      window.addEventListener("resize", size);
      if (REDUCE) frame(0);
      else waveRaf = requestAnimationFrame(frame);
    }

    // ---- Radar sweep ----
    let radarRaf = 0;
    const radarCanvas = radarRef.current;
    if (radarCanvas && !REDUCE) {
      const ctx = radarCanvas.getContext("2d");
      const css = getComputedStyle(document.documentElement);
      const violet = css.getPropertyValue("--violet").trim();
      const line = css.getPropertyValue("--line").trim();
      let w = 0, h = 0, cx = 0, cy = 0, rad = 0, angle = 0;
      function size() {
        const r = radarCanvas!.getBoundingClientRect();
        w = radarCanvas!.width = r.width * devicePixelRatio;
        h = radarCanvas!.height = r.height * devicePixelRatio;
        cx = w / 2; cy = h / 2; rad = Math.min(w, h) / 2 - 2;
      }
      function ring(rr: number, a: number) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx!.strokeStyle = line;
        ctx!.globalAlpha = a;
        ctx!.lineWidth = 1 * devicePixelRatio;
        ctx!.stroke();
      }
      function frame() {
        ctx!.clearRect(0, 0, w, h);
        ring(rad, 0.9); ring(rad * 0.66, 0.7); ring(rad * 0.33, 0.5);
        const grad = (ctx as any).createConicGradient ? (ctx as any).createConicGradient(angle, cx, cy) : null;
        if (grad) {
          grad.addColorStop(0, "rgba(124,92,255,0)");
          grad.addColorStop(0.08, violet);
          grad.addColorStop(0.16, "rgba(124,92,255,0)");
          grad.addColorStop(1, "rgba(124,92,255,0)");
          ctx!.globalAlpha = 0.8;
          ctx!.beginPath();
          ctx!.moveTo(cx, cy);
          ctx!.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx!.closePath();
          ctx!.fillStyle = grad;
          ctx!.fill();
        }
        angle += 0.02;
        radarRaf = requestAnimationFrame(frame);
      }
      size();
      window.addEventListener("resize", size);
      radarRaf = requestAnimationFrame(frame);
    }

    // ---- Console glint tracks the cursor ----
    const tuner = tunerRef.current;
    function handlePointerMove(e: PointerEvent) {
      if (!tuner) return;
      const r = tuner.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width) * 100;
      const my = ((e.clientY - r.top) / r.height) * 100;
      requestAnimationFrame(() => {
        tuner.style.setProperty("--mx", mx + "%");
        tuner.style.setProperty("--my", my + "%");
      });
    }
    if (tuner && !REDUCE) tuner.addEventListener("pointermove", handlePointerMove);

    // ---- Hero decode: the one orchestrated reveal moment, on load only ----
    if (!REDUCE) {
      const CHARS = "01/\\|<>#$%_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      glitchRefs.current.forEach((el, idx) => {
        if (!el) return;
        const final = GLITCH_LINES[idx];
        let frame = 0;
        const totalFrames = 16;
        const startDelay = idx * 220;
        setTimeout(() => {
          const iv = setInterval(() => {
            frame++;
            const reveal = Math.floor((frame / totalFrames) * final.length);
            let out = "";
            for (let i = 0; i < final.length; i++) {
              if (i < reveal || final[i] === " ") out += final[i];
              else out += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            el.textContent = out;
            if (frame >= totalFrames) {
              el.textContent = final;
              clearInterval(iv);
            }
          }, 32);
        }, startDelay);
      });
    }

    return () => {
      cancelAnimationFrame(waveRaf);
      cancelAnimationFrame(radarRaf);
      if (tuner) tuner.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <section className="hero">
      <div className="wrap hero-in">
        <div>
          {/* ✏️ EDIT: nama & subjudul stasiun */}
          <h1 className="station">
            <span
              className="glitch"
              ref={(el) => { glitchRefs.current[0] = el; }}
            >
              {GLITCH_LINES[0]}
            </span>
            <br />
            <span
              className="glitch"
              ref={(el) => { glitchRefs.current[1] = el; }}
            >
              {GLITCH_LINES[1]}
            </span>
            <span className="thin">Fresh Your Mind with Edutainment Radio</span>
          </h1>
        </div>

        {/* the star: FM tuner console */}
        <div className="tuner" id="tuner" ref={tunerRef}>
          <div className="glint" aria-hidden="true" />
          <div className="tuner-top">
            <span className="onair">
              <span className="tally on" />
              ON AIR
            </span>
            <span className="readout">
              stereo · <b>128 kbps<canvas className="radar" ref={radarRef} aria-hidden="true" /></b>
            </span>
          </div>
          <div className="freq">
            107.9<span className="unit">MHz</span>
          </div>
          <div className="dial">
            <div className="labels">
              <span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span>
            </div>
            <div className="ticks" />
            <div className="ticks major" />
            <div className="needle" ref={needleRef} />
          </div>
          <canvas className="wave" ref={waveRef} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
