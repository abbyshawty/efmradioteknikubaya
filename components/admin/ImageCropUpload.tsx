"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  /** width / height, mis. 1 untuk persegi (anggota), 16/10 untuk dokumentasi program kerja */
  aspect: number;
  /** resolusi output dalam px pada sisi terpanjang */
  outputSize?: number;
};

export default function ImageCropUpload({ label, hint, value, onChange, aspect, outputSize = 800 }: Props) {
  const [editing, setEditing] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const frameRef = useRef<HTMLDivElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0, offX: 0, offY: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const frameW = 280;
  const frameH = Math.round(frameW / aspect);

  const clampOffset = useCallback(
    (off: { x: number; y: number }, s: number) => {
      const dispW = naturalSize.w * s;
      const dispH = naturalSize.h * s;
      const minX = Math.min(0, frameW - dispW);
      const minY = Math.min(0, frameH - dispH);
      return {
        x: Math.max(minX, Math.min(0, off.x)),
        y: Math.max(minY, Math.min(0, off.y)),
      };
    },
    [naturalSize, frameW, frameH]
  );

  function onFileSelected(file: File) {
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Format harus PNG, JPG, atau WebP.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("File terlalu besar (maksimal 15 MB sebelum dipotong).");
      return;
    }
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    setEditing(true);
  }

  function handleImgLoad() {
    const img = imgElRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNaturalSize({ w, h });
    const initialScale = Math.max(frameW / w, frameH / h);
    setMinScale(initialScale);
    setScale(initialScale);
    setOffset(
      clampOffset(
        { x: (frameW - w * initialScale) / 2, y: (frameH - h * initialScale) / 2 },
        initialScale
      )
    );
  }

  useEffect(() => {
    // re-clamp saat scale berubah (mis. dari slider) supaya gambar tidak lepas dari frame
    setOffset((prev) => clampOffset(prev, scale));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, offX: offset.x, offY: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(clampOffset({ x: dragStart.current.offX + dx, y: dragStart.current.offY + dy }, scale));
  }
  function onPointerUp() {
    setDragging(false);
  }

  async function confirmCrop() {
    if (!imgElRef.current) return;
    setUploading(true);
    setError("");
    try {
      const sx = -offset.x / scale;
      const sy = -offset.y / scale;
      const sw = frameW / scale;
      const sh = frameH / scale;

      const outW = aspect >= 1 ? outputSize : Math.round(outputSize * aspect);
      const outH = aspect >= 1 ? Math.round(outputSize / aspect) : outputSize;

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.drawImage(imgElRef.current, sx, sy, sw, sh, 0, 0, outW, outH);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.9);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "image/jpeg" },
        body: blob,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah.");

      onChange(data.url);
      setEditing(false);
      if (imgSrc) URL.revokeObjectURL(imgSrc);
      setImgSrc(null);
    } catch (e: any) {
      setError(e.message || "Gagal memproses gambar.");
    } finally {
      setUploading(false);
    }
  }

  function cancelCrop() {
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setImgSrc(null);
    setEditing(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="crop-field">
      <label>{label}</label>
      {hint && <span className="admin-hint">{hint}</span>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelected(f);
        }}
      />

      {!editing && (
        <div className="crop-preview">
          <div className="crop-thumb" style={{ aspectRatio: aspect }}>
            {value ? <img src={value} alt={label} /> : <i className="ph-bold ph-image" />}
          </div>
          <button type="button" className="admin-add" onClick={() => fileInputRef.current?.click()}>
            <i className="ph-bold ph-upload-simple" /> {value ? "Ganti foto" : "Unggah foto"}
          </button>
        </div>
      )}

      {editing && imgSrc && (
        <div className="crop-editor">
          <div
            className="crop-frame"
            ref={frameRef}
            style={{ width: frameW, height: frameH }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgElRef}
              src={imgSrc}
              alt=""
              onLoad={handleImgLoad}
              draggable={false}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: naturalSize.w * scale,
                height: naturalSize.h * scale,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                maxWidth: "none",
              }}
            />
          </div>
          <div className="crop-controls">
            <i className="ph-bold ph-magnifying-glass-minus" />
            <input
              type="range"
              min={minScale}
              max={minScale * 4}
              step={minScale / 100}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
            />
            <i className="ph-bold ph-magnifying-glass-plus" />
          </div>
          <div className="crop-actions">
            <button type="button" className="admin-remove" onClick={cancelCrop} disabled={uploading}>
              Batal
            </button>
            <button type="button" className="admin-save crop-confirm" onClick={confirmCrop} disabled={uploading}>
              {uploading ? "Mengunggah…" : "Gunakan Foto Ini"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="admin-status err">{error}</p>}
    </div>
  );
}
