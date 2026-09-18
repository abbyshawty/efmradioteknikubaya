"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ModalItem = {
  title: string;
  desc?: string | null;
  img?: string;
  /** Custom node to render in the photo slot instead of the image/placeholder. */
  customPhoto?: React.ReactNode;
  /** Extra content rendered after the description (e.g. the email + copy box). */
  extra?: React.ReactNode;
};

type BackCtx = { title: string; items: ModalItem[] } | null;

type ModalState = {
  open: boolean;
  mode: "detail" | "list";
  title: string;
  desc?: string | null;
  img?: string;
  customPhoto?: React.ReactNode;
  extra?: React.ReactNode;
  items: ModalItem[];
  backCtx: BackCtx;
};

const initialState: ModalState = {
  open: false,
  mode: "detail",
  title: "",
  items: [],
  backCtx: null,
};

type ModalApi = {
  openDetail: (item: ModalItem, backCtx?: BackCtx) => void;
  openList: (title: string, items: ModalItem[]) => void;
  close: () => void;
};

const ModalContext = createContext<ModalApi | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>(initialState);
  const lastFocus = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const openDetail = useCallback((item: ModalItem, backCtx: BackCtx = null) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setState({
      open: true,
      mode: "detail",
      title: item.title,
      desc: item.desc,
      img: item.img,
      customPhoto: item.customPhoto,
      extra: item.extra,
      items: [],
      backCtx,
    });
  }, []);

  const openList = useCallback((title: string, items: ModalItem[]) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setState({ open: true, mode: "list", title, items, backCtx: null });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    lastFocus.current?.focus();
  }, []);

  const goBack = useCallback(() => {
    if (state.backCtx) openList(state.backCtx.title, state.backCtx.items);
  }, [state.backCtx, openList]);

  useEffect(() => {
    if (state.open) closeBtnRef.current?.focus();
  }, [state.open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <ModalContext.Provider value={{ openDetail, openList, close }}>
      {children}
      <div
        className={`modal-overlay${state.open ? " open" : ""}`}
        aria-hidden={!state.open}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="wpModalTitle">
          <button type="button" className="modal-close" aria-label="Tutup" ref={closeBtnRef} onClick={close}>
            <i className="ph-bold ph-x" />
          </button>

          {state.mode === "detail" ? (
            <>
              <div className="modal-photo">
                {state.customPhoto ? (
                  state.customPhoto
                ) : state.img ? (
                  <img src={state.img} alt={state.title} />
                ) : (
                  <>
                    <i className="ph-bold ph-image" />
                    <b>Dokumentasi menyusul</b>
                    <span>Foto kegiatan ini sedang disiapkan tim, mampir lagi nanti.</span>
                  </>
                )}
              </div>
              {state.backCtx && (
                <button type="button" className="modal-back" onClick={goBack}>
                  <i className="ph-bold ph-arrow-left" /> Kembali ke {state.backCtx.title}
                </button>
              )}
              <h3 id="wpModalTitle">{state.title}</h3>
              {typeof state.desc === "string" && <p>{state.desc}</p>}
              {state.extra}
            </>
          ) : (
            <>
              <div className="modal-photo">
                <i className="ph-bold ph-squares-four" />
                <span>Pilih salah satu untuk melihat detail</span>
              </div>
              <h3 id="wpModalTitle">{state.title}</h3>
              <div className="modal-list">
                {state.items.map((it) => (
                  <button key={it.title} type="button" onClick={() => openDetail(it, { title: state.title, items: state.items })}>
                    <span>{it.title}</span>
                    <i className="ph-bold ph-arrow-right" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ModalContext.Provider>
  );
}
