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

/*
  Scroll parallax (--enter / --cover) ScrollStage engine deta hai.
  Is component me sirf horizontal track, progress bar aur arrows ka logic hai.
*/
export default function DevelopmentsRail({ data }) {
  const { id = "developments", kicker, title, lede, allLabel, allHref, exploreLabel = "Explore", items } = data;

  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  // Progress bar + arrow enable/disable
  useEffect(() => {
    const t = trackRef.current;
    const bar = barRef.current;
    if (!t || !bar) return;

    const update = () => {
      const max = t.scrollWidth - t.clientWidth;
      const visible = t.scrollWidth ? t.clientWidth / t.scrollWidth : 1;
      const pos = max > 0 ? t.scrollLeft / t.scrollWidth : 0;
      bar.style.width = `${(visible * 100).toFixed(2)}%`;
      bar.style.left = `${(pos * 100).toFixed(2)}%`;

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
      id="developments"
      aria-labelledby="developments-title"
      data-testid="developments-rail"
      className="flex h-[calc(100svh+140px)] flex-col justify-start px-6 pt-10 sm:px-10 lg:px-[4.5vw]"
    >
      {/* Header */}
      <div
        className="flex flex-col gap-6 will-change-transform lg:flex-row lg:items-end lg:justify-between"
        style={{
          transform: "translate3d(0, calc((1 - var(--enter, 1)) * 50px), 0)",
          opacity: "min(1, calc(var(--enter, 1) * 2.2))",
        }}
      >
        <div className="max-w-[660px]">
          <p className="m-0 font-nav text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
            {kicker}
          </p>
          <h2
            id="developments-title"
            className="mb-0 mt-4 font-serif text-[28px] font-light leading-[1.1] sm:text-[44px] lg:text-[48px]"
          >
            {title}
          </h2>
          <p className="mb-0 mt-5 text-[14px] leading-[1.8] text-white/70 sm:text-[16px]">{lede}</p>
        </div>

        <Link
          href={allHref}
          className="inline-flex items-center gap-2 self-start font-nav text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:text-white lg:self-auto lg:pb-1"
        >
          {allLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <span className="mt-5 hidden h-px w-full bg-white/15 md:block" aria-hidden="true" />

      {/* Track + controls */}
      <div
        className="mt-5 will-change-transform"
        style={{
          transform: "translate3d(0, calc((1 - var(--enter, 1)) * 90px), 0)",
          opacity: "min(1, calc((var(--enter, 1) - 0.15) * 2.2))",
        }}
      >
        <ul
          ref={trackRef}
          tabIndex={0}
          aria-label={title}
          data-testid="developments-track"
          className="-mx-6 m-0 flex list-none snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 p-0 px-6 [scrollbar-width:none] sm:-mx-10 sm:scroll-px-10 sm:px-10 lg:-mx-[4.5vw] lg:scroll-px-[4.5vw] lg:px-[4.5vw] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <li
              key={p.slug}
              data-testid="developments-card"
              className="shrink-0 basis-[78%] snap-start sm:basis-[44%] lg:basis-[27.5%]"
            >
              <figure className="group relative m-0 aspect-[16/10] overflow-hidden bg-white/5">
                <Image
                  src={p.image}
                  alt={`${p.name}, ${p.city}`}
                  fill
                  sizes="(max-width: 639px) 78vw, (max-width: 1023px) 44vw, 28vw"
                  quality={75}
                  draggable={false}
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </figure>

              <p className="m-0 mt-5 font-nav text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
                {p.city}
              </p>
              <h3 className="mb-0 mt-3 font-serif text-[19px] font-light leading-[1.15] md:text-[24px]">
                {p.name}
              </h3>
              <p className="m-0 mt-3 text-[12px] tracking-[0.04em] text-white/80">
                {p.type}
                {p.config ? ` / ${p.config}` : ""}
              </p>
              <Link
                href={p.href}
                draggable={false}
                className="mt-6 inline-flex h-10 items-center border border-white/40 px-5 font-nav text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 hover:bg-white hover:text-black"
              >
                {exploreLabel}
                <span className="sr-only"> {p.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-6">
          <div className="relative h-px flex-1 bg-white/15" aria-hidden="true">
            <span ref={barRef} className="absolute top-0 h-px bg-white" style={{ width: "30%", left: 0 }} />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous developments"
              disabled={edge.start}
              onClick={() => go(-1)}
              className="grid size-12 place-items-center border border-white/25 transition-colors enabled:hover:bg-white enabled:hover:text-black disabled:opacity-30"
            >
              <Arrow dir="prev" />
            </button>
            <button
              type="button"
              aria-label="Next developments"
              disabled={edge.end}
              onClick={() => go(1)}
              className="grid size-12 place-items-center border border-white/25 transition-colors enabled:hover:bg-white enabled:hover:text-black disabled:opacity-30"
            >
              <Arrow dir="next" />
            </button>
          </div>
        </div>
      </div>
    </StageSection>
  );
}