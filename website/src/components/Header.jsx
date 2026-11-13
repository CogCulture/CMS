"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneIcon, WhatsappIcon } from "@/components/ui/icons";
import { useEnquiry } from "@/components/EnquiryModal";

const LABEL = "font-nav text-[11.5px] font-semibold uppercase tracking-[0.13em] whitespace-nowrap";

const Chevron = ({ open }) => (
  <svg
    width="9"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    aria-hidden="true"
    className={`flex-none transition-transform duration-300 ${open ? "rotate-180" : ""}`}
  >
    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Header({ data }) {
  const { logo, nav = [], contact } = data;
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/editor";
  const { openEnquiry } = useEnquiry();

  const [phase, setPhase] = useState("pre"); // pre -> intro -> done
  const [bg, setBg] = useState(isHome ? "top" : "solid"); // top | glass | solid
  const [mega, setMega] = useState(null);

  const logoRef = useRef(null);
  const headerRef = useRef(null);
  const closeTimer = useRef(null);

  // ---------- Logo intro: center -> top-left ----------
  useLayoutEffect(() => {
    const el = logoRef.current;
    const skip =
      !isHome ||
      sessionStorage.getItem("introDone") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!el || skip) {
      setPhase("done");
      return;
    }

    const r = el.getBoundingClientRect();
    const scale = Math.min(window.innerWidth * 0.6, 300) / r.width;
    const dx = window.innerWidth / 2 - (r.left + r.width / 2);
    const dy = window.innerHeight / 2 - (r.top + r.height / 2);

    el.style.transition = "none";
    el.style.transformOrigin = "center";
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    document.body.style.overflow = "hidden";
    setPhase("intro");

    const t1 = setTimeout(() => {
      el.style.transition = "transform 1.2s cubic-bezier(.77,0,.18,1)";
      el.style.transform = "none";
    }, 900);
    const t2 = setTimeout(() => {
      el.style.transition = "";
      el.style.transformOrigin = "";
      document.body.style.overflow = "";
      sessionStorage.setItem("introDone", "1");
      setPhase("done");
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Scroll: top -> glass -> solid ----------
  useEffect(() => {
    const update = () => {
      const hero = document.getElementById("top");
      if (!hero) return setBg("solid");
      const y = window.scrollY;
      const end = hero.offsetHeight - (headerRef.current?.offsetHeight ?? 0);
      setBg(y >= end ? "solid" : y > 8 ? "glass" : "top");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => setMega(null), [pathname]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMega(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const isEditorMode = () =>
    typeof window !== "undefined" &&
    (window.location.pathname === "/editor" ||
      window.location.pathname.startsWith("/editor") ||
      window.location.pathname.endsWith("/editor") ||
      window.location.pathname.includes("/editor/") ||
      new URLSearchParams(window.location.search).get("editor") === "true" ||
      document.body.classList.contains("cms-editor-active"));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const keepOpen = () => cancelClose();
    window.addEventListener("cms-keep-mega-open", keepOpen);
    return () => window.removeEventListener("cms-keep-mega-open", keepOpen);
  }, []);

  const scheduleClose = (e) => {
    cancelClose();
    if (isEditorMode()) {
      // 1. If user is currently editing or interacting with an element inside the header or mega panel, NEVER close
      const activeEl = document.querySelector('[contenteditable="true"], .visual-editor-active-text, [data-cms-active="true"]');
      if (
        activeEl &&
        (headerRef.current?.contains(activeEl) ||
          document.querySelector('[data-testid="site-header-mega-panel"][data-open="true"]')?.contains(activeEl) ||
          document.querySelector('.mega-panel[data-open="true"]')?.contains(activeEl))
      ) {
        return;
      }

      // 2. If the cursor is moving toward or into the visual editor toolbar, overlay, or studio bar
      const rel = e?.relatedTarget;
      if (
        rel &&
        (rel.closest?.("#dynamicTextPillBar") ||
          rel.closest?.("#activeElementBoxOverlay") ||
          rel.closest?.("#visualEditorStudioBar") ||
          rel.closest?.(".visual-editor-portal") ||
          rel.closest?.("#contextMenuPortal"))
      ) {
        return;
      }
    }

    const delay = isEditorMode() ? 600 : 120;
    closeTimer.current = setTimeout(() => {
      if (isEditorMode()) {
        const activeEl = document.querySelector('[contenteditable="true"], .visual-editor-active-text, [data-cms-active="true"]');
        if (
          activeEl &&
          (headerRef.current?.contains(activeEl) ||
            document.querySelector('[data-testid="site-header-mega-panel"][data-open="true"]')?.contains(activeEl) ||
            document.querySelector('.mega-panel[data-open="true"]')?.contains(activeEl))
        ) {
          return;
        }
        if (document.querySelector('#dynamicTextPillBar:hover, #activeElementBoxOverlay:hover, #visualEditorStudioBar:hover')) {
          return;
        }
      }
      setMega(null);
    }, delay);
  };
  const openMega = (label) => {
    cancelClose();
    setMega(label);
  };

  useEffect(() => {
    const handleScrollClose = () => {
      if (mega) setMega(null);
    };
    window.addEventListener("scroll", handleScrollClose, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollClose);
  }, [mega]);

  const state = mega ? "solid" : bg;
  const count = nav.length;

  return (
    <>
      <header
        ref={headerRef}
        data-testid="site-header"
        data-state={state}
        data-ready={phase === "done"}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className="site-header fixed inset-x-0 top-[var(--hdr-top,0px)] z-50 h-[var(--hdr-h)]"
      >
        <div className="mx-auto flex h-full items-center justify-between gap-[clamp(14px,2vw,34px)] px-[clamp(20px,4vw,64px)]">
          {/* LEFT: logo | rule | nav */}
          <div className="flex h-full items-center gap-[14px]">
            <Link
              ref={logoRef}
              href="/"
              aria-label={typeof logo === "string" ? "Emaar India" : (logo?.alt || "Emaar India")}
              data-testid="site-header-brand"
              className={`block shrink-0 will-change-transform ${phase === "pre" ? "invisible" : ""}`}
            >
              <Image
                src={typeof logo === "string" ? logo : (logo?.src || "/images/emaar-india-logo-en.svg")}
                alt={typeof logo === "string" ? "Emaar India" : (logo?.alt || "Emaar India")}
                width={120}
                height={40}
                priority
                className="hdr-logo h-[34px] w-auto object-contain lg:h-[38px]"
                style={{ width: "auto" }}
              />
            </Link>

            <span
              aria-hidden="true"
              style={{ "--i": 0 }}
              className="hdr-reveal mr-[14px] hidden h-5 w-px bg-current opacity-40 lg:block"
            />

            <nav
              aria-label="Primary"
              data-testid="site-header-nav"
              data-mega={mega ? "1" : "0"}
              className="hdr-nav hidden h-full items-center gap-[clamp(18px,1.9vw,30px)] lg:flex"
            >
              {nav.map((item, i) => {
                const base = `hdr-reveal hdr-link flex items-center gap-2 px-px pb-[7px] pt-1.5 ${LABEL}`;

                if (item.mega) {
                  const open = mega === item.label;
                  const props = {
                    "aria-expanded": open,
                    "aria-haspopup": "true",
                    "data-active": open,
                    "data-testid": "site-header-mega-trigger",
                    onMouseEnter: () => openMega(item.label),
                    onFocus: () => openMega(item.label),
                    style: { "--i": i + 1 },
                    className: base,
                  };
                  return item.href ? (
                    <Link key={item.label} href={item.href} {...props}>
                      {item.label}
                      <Chevron open={open} />
                    </Link>
                  ) : (
                    <button key={item.label} type="button" onClick={() => setMega(open ? null : item.label)} {...props}>
                      {item.label}
                      <Chevron open={open} />
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    data-testid="site-header-nav-link"
                    onMouseEnter={() => setMega(null)}
                    style={{ "--i": i + 1 }}
                    className={base}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: mobile = sirf call, desktop = sab */}
          <div className="flex items-center gap-[clamp(10px,1.3vw,20px)]" data-testid="site-header-actions">
            <a
              href={contact.phone}
              aria-label="Call us"
              data-testid="site-header-call"
              style={{ "--i": count + 1 }}
              className="hdr-reveal hdr-icon inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <PhoneIcon />
            </a>

            <a
              href={contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              data-testid="site-header-whatsapp"
              style={{ "--i": count + 2 }}
              className="hdr-reveal hdr-icon hidden min-h-[44px] min-w-[44px] items-center justify-center lg:inline-flex"
            >
              <WhatsappIcon />
            </a>

            <button
              type="button"
              aria-haspopup="dialog"
              data-testid="site-header-cta"
              onClick={() => openEnquiry("header")}
              style={{ "--i": count + 3 }}
              className={`hdr-reveal hdr-cta hidden min-h-[48px] items-center justify-center px-[17px] py-[9px] lg:inline-flex ${LABEL} tracking-[0.14em]`}
            >
              {contact.ctaLabel}
            </button>
          </div>
        </div>
      </header>

      {/* SCRIM */}
      <div
        aria-hidden="true"
        onClick={() => setMega(null)}
        className={`fixed inset-x-0 bottom-0 top-[calc(var(--hdr-h)+var(--hdr-top,0px))] z-40 bg-black/40 transition-opacity duration-300 ${
          mega ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* DESKTOP MEGA PANELS */}
      {nav
        .filter((n) => n.mega)
        .map((item) => {
          const m = item.mega;
          return (
            <div
              key={item.label}
              role="region"
              aria-label={item.label}
              data-testid="site-header-mega-panel"
              data-open={mega === item.label}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              className="mega-panel hidden lg:block"
            >
              <div className="mx-auto max-w-[1500px] px-[clamp(20px,4vw,64px)] pb-[clamp(40px,4.2vw,58px)] pt-[clamp(34px,3.6vw,50px)]">
                <div className="mb-[clamp(24px,2.6vw,34px)] flex items-baseline gap-5">
                  <p className="m-0 whitespace-nowrap font-nav text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
                    {m.eyebrow}
                  </p>
                  <span className="h-px flex-1 bg-white/15" aria-hidden="true" />
                  {m.meta && <p className="m-0 whitespace-nowrap text-[12.5px] text-white/55">{m.meta}</p>}
                </div>

                <div className="flex flex-nowrap gap-[clamp(30px,4vw,84px)]">
                  {m.columns.map((col, ci) => (
                    <div key={col.title} className="mega-item min-w-[11.25rem] shrink" style={{ "--i": ci }}>
                      <p className="mb-5 mt-0 font-nav text-[9.5px] font-semibold uppercase tracking-[0.26em] text-white/60">
                        {col.title}
                      </p>
                      <div className="flex flex-col items-start gap-[15px]">
                        {col.links.map((l) => (
                          <Link
                            key={l.href + l.label}
                            href={l.href}
                            className="mega-link flex flex-col items-start gap-1 text-[15.5px] leading-[1.2] text-white"
                          >
                            <span>{l.label}</span>
                            {l.sub && <span className="whitespace-nowrap text-[11px] text-white/50">{l.sub}</span>}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}

                  {m.feature && (
                    <div
                      className="mega-item ms-auto w-[min(22.5rem,100%)] min-w-[12.5rem] shrink"
                      style={{ "--i": m.columns.length }}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#26241f]">
                        <Image
                          src={m.feature.image}
                          alt={m.feature.alt || m.feature.title}
                          fill
                          sizes="360px"
                          className="object-cover"
                        />
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3.5">
                        <div>
                          <p className="m-0 font-nav text-[9.5px] font-semibold uppercase tracking-[0.22em] text-white/60">
                            {m.feature.eyebrow}
                          </p>
                          <p className="mb-0 mt-[5px] font-serif text-[20px] leading-[1.1] text-white">{m.feature.title}</p>
                          <p className="mb-0 mt-[3px] text-[12.5px] text-white/60">{m.feature.subtitle}</p>
                        </div>
                        <Link
                          href={m.feature.href}
                          className="mega-cta flex-none whitespace-nowrap border-b border-white/50 pb-[3px] font-nav text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white"
                        >
                          {m.feature.cta}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
    </>
  );
}