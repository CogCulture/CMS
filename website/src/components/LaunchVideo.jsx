"use client";

import { useEffect, useRef } from "react";

export default function LaunchVideo({ src, poster, label }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true; // autoplay ke liye zaroori (React ka muted attr kabhi miss ho jata hai)

    // reduced-motion wale user ko sirf poster dikhega
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      preload="none"
      draggable={false}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}