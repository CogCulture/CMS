"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SectionEyebrow from "./SectionEyebrow";

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 26 10" width="26" height="10" fill="none" aria-hidden="true">
    {dir === "next" ? (
      <path d="M1 5h24M20 1l5 4-5 4" stroke="currentColor" strokeWidth="1.1" />
    ) : (
      <path d="M25 5H1M6 1L1 5l5 4" stroke="currentColor" strokeWidth="1.1" />
    )}
  </svg>
);

function Lightbox({ images, start, onClose }) {
  const [i, setI] = useState(start);
  const closeRef = useRef(null);
  const n = images.length;
  const prev = useCallback(() => setI((v) => (v - 1 + n) % n), [n]);
  const next = useCallback(() => setI((v) => (v + 1) % n), [n]);

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [onClose, prev, next]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Gallery" data-testid="gallery-lightbox" className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white">
      <div className="flex items-center justify-between px-5 py-4">
        <p className="m-0 font-nav text-[11px] tracking-[0.2em]" aria-live="polite">{i + 1} / {n}</p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close gallery" className="grid size-11 place-items-center border border-white/30 hover:bg-white/10">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
        </button>
      </div>

      <div className="relative flex-1">
        <Image key={images[i].src} src={images[i].src} alt={images[i].alt} fill sizes="100vw" quality={85} className="object-contain" />
      </div>

      <div className="flex justify-center gap-3 py-5">
        <button type="button" onClick={prev} aria-label="Previous image" className="grid size-12 place-items-center border border-white/30 hover:bg-white hover:text-black"><Arrow dir="prev" /></button>
        <button type="button" onClick={next} aria-label="Next image" className="grid size-12 place-items-center border border-white/30 hover:bg-white hover:text-black"><Arrow dir="next" /></button>
      </div>
    </div>
  );
}

export default function PropertyGallery({ data }) {
  const { eyebrow, tabs = [] } = data;
  const [active, setActive] = useState(0);
  const [box, setBox] = useState(null); // { start }
  const tabRefs = useRef([]);

  if (!tabs.length) return null;
  const tab = tabs[active];
  const imgs = tab.images;
  const extra = imgs.length - 3;

  const onTabKey = (e, idx) => {
    let to = null;
    if (e.key === "ArrowRight") to = (idx + 1) % tabs.length;
    if (e.key === "ArrowLeft") to = (idx - 1 + tabs.length) % tabs.length;
    if (to !== null) {
      e.preventDefault();
      setActive(to);
      tabRefs.current[to]?.focus();
    }
  };

  const shot = (idx, sizes, extraCls = "") => {
    const im = imgs[idx];
    if (!im) return null;
    const more = idx === 2 && extra > 0;
    return (
      <button
        type="button"
        data-testid="gallery-item"
        onClick={() => setBox({ start: idx })}
        aria-label={more ? `View all ${imgs.length} images` : `Open image ${idx + 1} of ${imgs.length}`}
        className={`group relative block overflow-hidden bg-black/5 ${extraCls}`}
      >
        <Image src={im.src} alt={im.alt} fill sizes={sizes} quality={80} className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]" />
        {more && (
          <span className="absolute inset-0 grid place-items-center bg-black/55 text-white" aria-hidden="true">
            <span className="text-center">
              <span className="block font-serif text-[32px] font-light">+{extra}</span>
              <span className="block font-nav text-[10px] font-semibold uppercase tracking-[0.22em]">View all {imgs.length}</span>
            </span>
          </span>
        )}
      </button>
    );
  };

  return (
    <section
      id="gallery"
      aria-label={eyebrow}
      data-testid="property-gallery"
      className="bg-[#F6F2EA] px-4 pb-6 pt-6 text-[#0e1f3a] sm:px-[clamp(20px,4vw,64px)] md:pb-16 md:pt-8"
    >
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      {/* Tabs: mobile par full width, desktop par content width */}
      <div
        role="tablist"
        aria-label={eyebrow}
        data-testid="gallery-tabs"
        className="mt-5 flex w-full border border-[#1c1a17]/15 md:mt-8 md:inline-flex md:w-auto"
      >
        {tabs.map((t, idx) => {
          const on = idx === active;
          return (
            <button
              key={t.key}
              ref={(el) => (tabRefs.current[idx] = el)}
              type="button"
              role="tab"
              id={`gt-${t.key}`}
              aria-selected={on}
              aria-controls={`gp-${t.key}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(idx)}
              onKeyDown={(e) => onTabKey(e, idx)}
              className={`flex-1 px-4 py-3.5 text-center font-nav text-[10px] font-bold uppercase tracking-[0.18em] transition-colors duration-300 md:flex-none md:px-8 md:py-[17px] md:tracking-[0.2em] ${
                on ? "bg-[#111] text-white" : "bg-white text-[#1c1a17] hover:bg-[#efe9dd]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`gp-${tab.key}`}
        aria-labelledby={`gt-${tab.key}`}
        key={tab.key}
        data-testid="gallery-panel"
        className="mt-6 md:mt-10"
      >
        <div className="grid items-start gap-3 lg:grid-cols-[1.1fr_1fr] lg:gap-[5vw]">
          <h2 className="m-0 font-serif text-[28px] font-light leading-[1.15] sm:text-[36px] lg:text-[40px]">
            {tab.title}
          </h2>
          <p className="m-0 max-w-[520px] text-[15px] leading-[1.6] text-[#5C5346] md:text-[16px] md:leading-[1.75]">
            {tab.text}
          </p>
        </div>

        <div className="mt-5 grid gap-2.5 md:mt-8 lg:grid-cols-[2fr_1fr] lg:grid-rows-2 lg:gap-3">
          {shot(0, "(max-width: 1023px) 92vw, 62vw", "aspect-[3/2] lg:row-span-2 lg:aspect-auto lg:min-h-[480px]")}
          <div className="grid grid-cols-2 gap-2.5 lg:contents">
            {shot(1, "(max-width: 1023px) 46vw, 32vw", "aspect-[3/2]")}
            {shot(2, "(max-width: 1023px) 46vw, 32vw", "aspect-[3/2]")}
          </div>
        </div>
      </div>

      {box && <Lightbox images={imgs} start={box.start} onClose={() => setBox(null)} />}
    </section>
  );
}