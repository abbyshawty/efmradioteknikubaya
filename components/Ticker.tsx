"use client";
import { useEffect, useRef } from "react";

const MESSAGE = "Request lagu? Kirim melalui page Request Lagu";

export default function Ticker() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tr = ref.current;
    if (!tr) return;
    const base = tr.innerHTML;
    function fill() {
      tr!.innerHTML = base;
      let guard = 0;
      while (tr!.scrollWidth < window.innerWidth * 2.5 && guard < 30) {
        tr!.innerHTML += base;
        guard++;
      }
      tr!.innerHTML += tr!.innerHTML; // mirror for the seamless -50% loop
    }
    fill();
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fill, 200);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <a href="#request" className="ticker" aria-label="Buka halaman Request Lagu">
      <div className="ticker-track" ref={ref}>
        <span>{MESSAGE}</span>
        <span className="dot">·</span>
      </div>
    </a>
  );
}
