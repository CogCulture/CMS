"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StageSection from "@/components/StageSection";

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 26 10" width="26" height="10" fill="none" aria-hidden="true">
    {dir === "next" ? (
      <path d="M1 5h24M20 1l5 4-5 4" stroke="currentColor" strokeWidth="1.1" />
    ) : (
      <path d="M25 5H1M6 1L1 5l5 4" stroke="currentColor" strokeWidth="1.1" />
    )}
  </svg>
);

const fmtDate = (iso) =>
  new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" })
    .toUpperCase();

export default function PressRail({ data }) {
  const { id = "press", eyebrow, title, lede, allLabel, allHref, items } = data;

  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  // progress bar (start se end tak) + arrows enable/disable
  useEffect(() => {
    const t = trackRef.current;
    const bar = barRef.current;
    if (!t || !bar) return;

    const update = () => {
      const max = t.scrollWidth - t.clientWidth;
      const visible = t.scrollWidth ? t.clientWidth / t.scrollWidth : 1;
      const progress = max > 0 ? Math.min(1, Math.max(0, t.scrollLeft / max)) : 0;
      bar.style.width = `${(visible * 100).toFixed(2)}%`;
      bar.style.left = `${(progress * (1 - visible) * 100).toFixed(2)}%`;

      const start = t.scrollLeft <= 2;
      const end = t.scrollLeft >= max - 2;
      setEdge((p) => (p.start === start && p.end === end ? p : { start, end }));
    };

    update();
    t.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(t);
    return () => {
      t.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [items.length]);

  const go = (dir) => {
    const t = trackRef.current;
    if (!t || !t.children.length) return;
    const step =
      t.children.length > 1
        ? t.children[1].offsetLeft - t.children[0].offsetLeft
        : t.children[0].offsetWidth;
    t.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <StageSection
      id={id}
      aria-labelledby="press-title"
      data-testid="press-rail"
      className="flex min-h-svh flex-col justify-center px-6 py-20 sm:px-10 lg:px-[4.5vw]"
      style={{ background: "#f6f3ec", color: "#1c1a17" }}
    >
      {/* Header */}
      <div
        className="flex flex-col gap-6 will-change-transform lg:flex-row lg:items-end lg:justify-between"
        style={{
          transform: "translate3d(0, calc((1 - var(--enter, 1)) * 50px), 0)",
          opacity: "min(1, calc(var(--enter, 1) * 2.2))",
        }}
      >
        <div className="w-full max-w-[730px]">
          <p className="m-0 font-nav text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1c1a17]/60">
            {eyebrow}
          </p>
          <h2
            id="press-title"
            className="mb-0 mt-4 font-serif text-[28px] font-light leading-[1.1] sm:text-[44px] lg:text-[48px]"
          >
            {title}
          </h2>
          <p className="mb-0 mt-5 text-[14px] leading-[1.8] text-[#1c1a17]/65">{lede}</p>
          <span className="mt-5 d-none d-md-block h-px w-full bg-[#1c1a17]/15" aria-hidden="true" />
        </div>

        <Link
          href={allHref}
          className="inline-flex items-center gap-2 self-start font-nav text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-60 lg:self-auto lg:pb-1"
        >
          {allLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Track + controls */}
      <div
        className="mt-8 will-change-transform lg:mt-10"
        style={{
          transform: "translate3d(0, calc((1 - var(--enter, 1)) * 90px), 0)",
          opacity: "min(1, calc((var(--enter, 1) - 0.15) * 2.2))",
        }}
      >
        <ul
          ref={trackRef}
          tabIndex={0}
          aria-label={title}
          data-testid="press-track"
          className="-mx-6 m-0 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-6 p-0 px-6 [scrollbar-width:none] sm:-mx-10 sm:scroll-px-10 sm:gap-4 sm:px-10 lg:-mx-[4.5vw] lg:scroll-px-[4.5vw] lg:gap-[1vw] lg:px-[4.5vw] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <li
              key={p.slug}
              data-testid="press-card"
              className="shrink-0 basis-[82%] snap-start sm:basis-[46%] lg:basis-[35%]"
            >
              <Link href={p.href} draggable={false} className="group block">
                <figure className="relative m-0 aspect-[16/9] overflow-hidden bg-black/5">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(max-width: 639px) 82vw, (max-width: 1023px) 46vw, 35vw"
                    quality={75}
                    draggable={false}
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                </figure>
                <time
                  dateTime={p.date}
                  className="mt-5 block font-nav text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1c1a17]/60"
                >
                  {fmtDate(p.date)}
                </time>
                <p className="mb-0 mt-3 max-w-[420px] text-[14px] leading-[1.6] text-[#1c1a17] transition-opacity group-hover:opacity-70">
                  {p.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center gap-6 lg:mt-10">
          <div className="relative h-px flex-1 bg-[#1c1a17]/15" aria-hidden="true">
            <span ref={barRef} className="absolute top-0 h-px bg-[#1c1a17]" style={{ width: "30%", left: 0 }} />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous press releases"
              disabled={edge.start}
              onClick={() => go(-1)}
              className="grid size-11 sm:size-12 place-items-center border border-[#1c1a17]/30 transition-colors enabled:hover:bg-[#1c1a17] enabled:hover:text-white disabled:opacity-30"
            >
              <Arrow dir="prev" />
            </button>
            <button
              type="button"
              aria-label="Next press releases"
              disabled={edge.end}
              onClick={() => go(1)}
              className="grid size-11 sm:size-12 place-items-center border border-[#1c1a17]/30 transition-colors enabled:hover:bg-[#1c1a17] enabled:hover:text-white disabled:opacity-30"
            >
              <Arrow dir="next" />
            </button>
          </div>
        </div>
      </div>
    </StageSection>
  );
}