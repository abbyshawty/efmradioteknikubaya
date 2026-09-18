"use client";
import { useEffect, useRef } from "react";

export default function ParticleNet() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0;
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const DENSITY = 18000; // px^2 per node, sparse and ambient, not busy
    const dpr = () => window.devicePixelRatio || 1;

    function size() {
      const d = dpr();
      w = c!.width = window.innerWidth * d;
      h = c!.height = window.innerHeight * d;
      c!.style.width = window.innerWidth + "px";
      c!.style.height = window.innerHeight + "px";
      const n = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / DENSITY));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15 * d,
        vy: (Math.random() - 0.5) * 0.15 * d,
      }));
    }

    let raf = 0;
    function frame() {
      const LINK = 150 * dpr();
      ctx!.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx!.strokeStyle = `rgba(124,92,255,${(1 - d / LINK) * 0.22})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.6 * dpr(), 0, 7);
        ctx!.fillStyle = "rgba(185,174,247,0.55)";
        ctx!.fill();
      }
      if (!REDUCE) raf = requestAnimationFrame(frame);
    }

    size();
    window.addEventListener("resize", size);
    if (REDUCE) frame();
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, []);

  return <canvas ref={ref} id="net" aria-hidden="true" />;
}
