"use client";

import { useEffect, useRef, useState } from "react";
import StageSection from "@/components/StageSection";

const DURATION = 1800; // ms
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

export default function LegacyStats({ data }) {
  const { id = "legacy", title, lede, stats } = data;
  const sectionRef = useRef(null);
  const [vals, setVals] = useState(null); // null = final values (SSR / no-JS / reduced motion)

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let done = false;

    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / DURATION);
        const k = easeOut(t);
        setVals(stats.map((s) => s.value * k));
        if (t < 1) raf = requestAnimationFrame(tick);
        else setVals(null);
      };
      raf = requestAnimationFrame(tick);
    };

    // section screen ka aadha hissa cover kare tab shuru, sirf ek baar
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done) {
          done = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    // IO se pehle dikhne wale frame me final number flash na ho
    setVals(stats.map(() => 0));
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stats]);

  return (
    <StageSection
      ref={sectionRef}
      id={id}
      aria-labelledby="legacy-title"
      data-testid="legacy-stats"
      className="h-svh"
      style={{ background: "#f6f3ec", color: "#1c1a17" }}
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        style={{
          transform: "translate3d(0, calc((1 - var(--enter, 1)) * 60px - var(--cover, 0) * 50px), 0)",
          opacity: "min(1, calc(var(--enter, 1) * 2), calc(1 - var(--cover, 0) * 1.1))",
        }}
      >
        <h2
          id="legacy-title"
          className="m-0 font-serif text-[28px] font-light leading-[1.1] sm:text-[44px] lg:text-[52px]"
        >
          {title}
        </h2>
        <p className="mx-auto mb-0 mt-6 max-w-[620px] text-[14px] leading-[1.8] text-[#1c1a17]/65 sm:text-[14px]">
          {lede}
        </p>

       <dl
  data-testid="legacy-stat-list"
  className="m-0 mt-12 grid w-full max-w-[1280px] grid-cols-2 gap-y-10 lg:mt-20 lg:grid-cols-4 lg:gap-y-0"
>
  {stats.map((s, i) => {
    const final = `${fmt(s.value)}${s.suffix ?? ""}`;
    const live = vals ? `${fmt(vals[i])}${s.suffix ?? ""}` : final;
    // mobile (2 col): 2nd aur 4th par line | desktop (4 col): 2nd, 3rd, 4th par line
    const divider = i === 0 ? "" : i % 2 === 1 ? "border-l" : "lg:border-l";
    return (
      <div
        key={s.label}
        data-testid="legacy-stat"
        className={`flex min-w-0 flex-col items-center border-[#1c1a17]/15 px-2 lg:px-4 ${divider}`}
      >
        <dd className="relative m-0 whitespace-nowrap font-serif text-[24px] font-light leading-none sm:text-[34px] lg:text-[clamp(34px,3.4vw,52px)]">
          {/* ghost: final width reserve karta hai, layout kabhi hilta nahi */}
          <span className="invisible" aria-hidden="true">{final}</span>
          <span className="absolute inset-0 tabular-nums" aria-hidden="true">{live}</span>
          <span className="sr-only">{final}</span>
        </dd>
        <dt className="mt-5 text-center font-nav text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1c1a17]/55 sm:text-[10px] sm:tracking-[0.22em] lg:mt-8">
          {s.label}
        </dt>
      </div>
    );
  })}
</dl>
      </div>
    </StageSection>
  );
}