"use client";

import { useEffect, useRef } from "react";

const clamp = (v) => Math.min(1, Math.max(0, v));

export default function ScrollStage({ children, smooth = 0.14, ...rest }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const secs = [...root.querySelectorAll(":scope > [data-stage]")];
    if (!secs.length) return;

    const setVars = (el, e, c, p) => {
      el.style.setProperty("--enter", e.toFixed(4));
      el.style.setProperty("--cover", c.toFixed(4));
      el.style.setProperty("--p", p.toFixed(4));
    };

    secs.forEach((el, i) => (el.style.zIndex = String(10 + i)));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      secs.forEach((el) => setVars(el, 1, 0, 0));
      return;
    }

    const heights = secs.map(() => 0);
    const cur = secs.map(() => ({ e: 0, c: 0, p: 0 }));
    let raf = 0;
    let last = 0;
    let primed = false;

    const layout = () => {
      const vh = window.innerHeight;
      secs.forEach((el, i) => {
        heights[i] = el.offsetHeight;
        // lamba section apne bottom par ruke, chhota top par
        el.style.top = `${Math.min(0, vh - heights[i])}px`;
      });
    };

    const tick = (now) => {
      raf = 0;
      const dt = last ? Math.min(now - last, 50) : 16.7;
      last = now;
      const k = 1 - Math.pow(1 - smooth, dt / 16.7); // 60Hz/120Hz par same feel

      const vh = window.innerHeight;
      const t = secs.map((el, i) => {
        const top = el.getBoundingClientRect().top;
        const h = heights[i];
        return {
          e: clamp(1 - top / vh),
          p: h > vh + 1 ? clamp(-top / (h - vh)) : 0,
        };
      });

      let busy = false;
      const ease = (c, key, target) => {
        if (!primed) return (c[key] = target);
        c[key] += (target - c[key]) * k;
        if (Math.abs(target - c[key]) < 0.0005) c[key] = target;
        else busy = true;
      };

      secs.forEach((el, i) => {
        const c = cur[i];
        ease(c, "e", t[i].e);
        ease(c, "c", t[i + 1] ? t[i + 1].e : 0); // agla section jitna aaya = utna cover
        ease(c, "p", t[i].p);
        setVars(el, c.e, c.c, c.p);
      });

      primed = true;
      if (busy) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    layout();
    const ro = new ResizeObserver(() => {
      layout();
      kick();
    });
    secs.forEach((el) => ro.observe(el));

    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [smooth]);

  return (
    <main ref={rootRef} id="main-content" className="relative z-[1]" {...rest}>
      {children}
    </main>
  );
}