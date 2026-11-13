"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StageSection from "@/components/StageSection";

const COVER_MS = 1400; // video itni der poora grid dhake rakhta hai

const PlayIcon = ({ playing }) =>
  playing ? (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="2" y="1.5" width="2.6" height="9" rx="0.8" fill="currentColor" />
      <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.8" fill="currentColor" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3.2 1.8v8.4L10.4 6z" fill="currentColor" />
    </svg>
  );

const SoundIcon = ({ muted }) => (
  <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M2 5h2.4L8 2v10L4.4 9H2z" fill="currentColor" />
    {muted ? (
      <path d="M10 5.5l3 3M13 5.5l-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    ) : (
      <path d="M10 4.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    )}
  </svg>
);

const ctrl =
  "grid size-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/80";

function Block({ item, index, flip, discoverLabel, onActive }) {
  const blockRef = useRef(null);
  const gridRef = useRef(null);
  const slotRef = useRef(null);
  const videoRef = useRef(null);
  const revealed = useRef(false);

  const [covered, setCovered] = useState(true);
  const [rest, setRest] = useState(null); // video ka final clip-path (slot ke hisaab se)
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isEd = window.location.pathname.startsWith("/editor") ||
        new URLSearchParams(window.location.search).get("editor") === "true";
      setIsEditor(isEd);
      if (isEd) {
        setCovered(false);
        revealed.current = true;
      }
    }
  }, []);

  // slot ki jagah measure karo (resize par bhi)
  useEffect(() => {
    const grid = gridRef.current;
    const slot = slotRef.current;
    if (!grid || !slot) return;
    const measure = () => {
      const g = grid.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      setRest(
        `inset(${s.top - g.top}px ${g.right - s.right}px ${g.bottom - s.bottom}px ${s.left - g.left}px)`
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  // view me aate hi: active dot, video play, 1.4s baad slot me
  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer;

    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (entry.isIntersecting) {
          onActive(index);
          v?.play().then(() => setPlaying(true)).catch(() => {});
          if (!revealed.current) {
            revealed.current = true;
            timer = setTimeout(() => setCovered(false), reduce ? 0 : COVER_MS);
          }
        } else if (v) {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [index, onActive]);

  const togglePlay = (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  // Autoplay video in editor mode once mounted
  useEffect(() => {
    if (isEditor && videoRef.current) {
      const v = videoRef.current;
      v.muted = muted;
      v.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [isEditor]);

  const [a, b, c] = item.images;
  const tile = "relative overflow-hidden bg-black/5";

  return (
    <article
      ref={blockRef}
      aria-label={item.name}
      data-testid="communities-block"
      className={`grid min-h-svh items-center gap-10 px-5 py-18 py-md-24 sm:px-10 lg:gap-[5vw] lg:px-[4vw] ${
        flip ? "lg:grid-cols-[1fr_1.9fr]" : "lg:grid-cols-[1.9fr_1fr]"
      }`}
    >
      {/* GRID: 3 images + video slot */}
      <div
        ref={gridRef}
        className={`relative grid aspect-[640/433] grid-cols-[175fr_190fr_264fr] grid-rows-[160fr_265fr] gap-2 ${
          flip ? "lg:order-2" : ""
        }`}
      >
        <figure className={`${tile} col-span-2 row-start-1 m-0`}>
          <Image src={a.src} alt={a.alt} fill sizes="(max-width: 1023px) 94vw, 40vw" className="object-cover" />
        </figure>
        <figure className={`${tile} col-start-3 row-start-1 m-0`}>
          <Image src={b.src} alt={b.alt} fill sizes="(max-width: 1023px) 50vw, 20vw" className="object-cover" />
        </figure>
        <figure className={`${tile} col-start-1 row-start-2 m-0`}>
          <Image src={c.src} alt={c.alt} fill sizes="(max-width: 1023px) 40vw, 14vw" className="object-cover" />
        </figure>

        {isEditor ? (
          /* Editor Mode: Video is placed cleanly in its own grid cell with zero overlapping overlays */
          <div ref={slotRef} className={`relative col-span-2 col-start-2 row-start-2 overflow-hidden bg-black ${tile}`}>
            <video
              ref={videoRef}
              src={item.video.src}
              poster={item.video.poster}
              aria-label={item.video.label}
              className="size-full object-cover pointer-events-auto cursor-pointer"
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="auto"
            />
            <div className="absolute bottom-3 right-3 z-[1000005] flex gap-2 pointer-events-auto">
              <button
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); }}
                onClick={togglePlay}
                data-media-control="true"
                aria-label={playing ? "Pause video" : "Play video"}
                className={`${ctrl} pointer-events-auto cursor-pointer`}
              >
                <PlayIcon playing={playing} />
              </button>
              <button
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); }}
                onClick={toggleMute}
                data-media-control="true"
                aria-label={muted ? "Unmute video" : "Mute video"}
                className={`${ctrl} pointer-events-auto cursor-pointer`}
              >
                <SoundIcon muted={muted} />
              </button>
            </div>
          </div>
        ) : (
          /* Live Website: Cinematic expanding video overlay with 1.4s cover reveal */
          <>
            <div ref={slotRef} className="relative col-span-2 col-start-2 row-start-2" aria-hidden={covered}>
              <div
                className={`absolute bottom-3 right-3 z-20 flex gap-2 transition-opacity duration-500 ${
                  covered ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
              >
                <button
                  type="button"
                  onPointerDown={(e) => { e.stopPropagation(); }}
                  onClick={togglePlay}
                  aria-label={playing ? "Pause video" : "Play video"}
                  className={ctrl}
                >
                  <PlayIcon playing={playing} />
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => { e.stopPropagation(); }}
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  className={ctrl}
                >
                  <SoundIcon muted={muted} />
                </button>
              </div>
            </div>

            <div
              className="pointer-events-auto absolute inset-0 z-10 overflow-hidden bg-black"
              style={{
                clipPath: covered || !rest ? "inset(0px)" : rest,
                transition: "clip-path 1.2s cubic-bezier(.77,0,.18,1)",
              }}
            >
              <video
                ref={videoRef}
                src={item.video.src}
                poster={item.video.poster}
                aria-label={item.video.label}
                className="size-full object-cover pointer-events-auto cursor-pointer"
                muted
                loop
                playsInline
                preload="none"
              />
            </div>
          </>
        )}
      </div>

      {/* TEXT */}
      <div className={flip ? "lg:order-1" : ""}>
        <p className="m-0 font-nav text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1c1a17]/60">
          {item.eyebrow}
        </p>
        <h3 className="mb-0 mt-4 font-serif text-[28px] font-light leading-[1.1] sm:text-[44px]">{item.name}</h3>
        <p className="mb-0 mt-4 mt-md-6 max-w-[440px] text-[14px] leading-[1.9] text-[#1c1a17]/70">{item.blurb}</p>
        <Link
          href={item.href}
          className="group mt-10 inline-flex items-center gap-4 font-nav text-[11px] font-bold uppercase tracking-[0.2em]"
        >
          <span className="h-px w-10 bg-[#1c1a17]/60 transition-all duration-300 group-hover:w-14" aria-hidden="true" />
          {discoverLabel}
          <span className="sr-only"> {item.name}</span>
        </Link>
      </div>
    </article>
  );
}

export default function CommunitiesCollage({ data }) {
  const { id = "communities", items, allLabel, allHref, discoverLabel = "Discover More" } = data;
  const [active, setActive] = useState(0);

  return (
    <StageSection
      id={id}
      aria-label="Communities"
      data-testid="communities-collage"
      style={{ background: "#f6f3ec", color: "#1c1a17" }}
    >
      {/* dots: section ke andar sticky */}
      <div className="pointer-events-none sticky top-0 z-30 hidden h-0 lg:block" aria-hidden="true">
        <ol className="absolute right-6 top-[50svh] m-0 flex -translate-y-1/2 list-none flex-col gap-3 p-0">
          {items.map((it, i) => (
            <li
              key={it.slug}
              className={`size-1.5 rounded-full bg-[#1c1a17] transition-opacity duration-300 ${
                active === i ? "opacity-90" : "opacity-25"
              }`}
            />
          ))}
        </ol>
      </div>

      {items.map((item, i) => (
        <Block
          key={item.slug}
          item={item}
          index={i}
          flip={i % 2 === 1}
          discoverLabel={discoverLabel}
          onActive={setActive}
        />
      ))}

      <div className="grid place-items-center px-6 pb-44 pb-md-24 pt-2 pt-md-8">
        <Link
          href={allHref}
          data-testid="communities-all-link"
          className="border border-[#1c1a17]/50 px-10 py-5 font-nav text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 hover:bg-[#1c1a17] hover:text-white"
        >
          {allLabel}
        </Link>
      </div>
    </StageSection>
  );
}