"use client";
import { useRef, useState } from "react";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
};

const MAX_BYTES = 2 * 1024 * 1024;

/** Unggah gambar apa adanya, tanpa crop -- untuk logo, supaya rasio asli
 *  dan latar transparan PNG tetap terjaga. */
export default function ImageUpload({ label, hint, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Format harus PNG, JPG, atau WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File terlalu besar (maksimal 2 MB).");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah.");
      onChange(data.url);
    } catch (e: any) {
      setError(e.message || "Gagal mengunggah.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
          if (f) upload(f);
        }}
      />

      <div className="crop-preview">
        <div className="crop-thumb logo-thumb">
          {value ? <img src={value} alt={label} /> : <i className="ph-bold ph-image" />}
        </div>
        <button type="button" className="admin-add" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <i className="ph-bold ph-upload-simple" /> {uploading ? "Mengunggah…" : value ? "Ganti gambar" : "Unggah gambar"}
        </button>
      </div>

      {error && <p className="admin-status err">{error}</p>}
    </div>
  );
}
