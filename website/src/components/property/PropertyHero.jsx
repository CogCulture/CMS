"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EnquiryButton } from "@/components/EnquiryModal";

const BTN =
  "inline-flex h-[51px] w-full items-center justify-center px-8 font-nav text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 sm:w-auto";
const SOLID = `${BTN} border border-[#111112] bg-[#111112] text-white hover:bg-transparent hover:text-[#111112]`;
const OUTLINE = `${BTN} border border-[#111112]/35 bg-transparent text-[#111112] hover:bg-[#111112] hover:text-white`;

export default function PropertyHero({ name, breadcrumb, hero }) {
  const { image, eyebrow, title, disclaimer = [], ctas = [] } = hero;
  const pad = "px-[clamp(20px,4vw,64px)]";
  const [rera, setRera] = useState(false);

  return (
    <>
      {/* BREADCRUMB */}
      <div className={`bg-[#f6f3ec] ${pad} py-8 sm:py-10`}>
        <nav aria-label="Breadcrumb" data-testid="property-breadcrumb">
          <ol className="m-0 flex list-none flex-wrap items-center gap-3 p-0 font-nav text-[11px] font-semibold uppercase tracking-[1.2px] text-[#78787A]/60">
            <li>
              <Link href={breadcrumb.homeHref} className="transition-colors hover:text-[#78787A]">
                <span aria-hidden="true">← </span>
                {breadcrumb.homeLabel}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-[#78787A]/80">{name}</li>
          </ol>
        </nav>
      </div>

      {/* HERO IMAGE */}
      <section
        aria-label={name}
        data-testid="property-hero"
        className="relative h-[275px] w-full overflow-hidden bg-black sm:h-[400px]"
      >
        {image.mobile && (
          <Image
            src={image.mobile}
            alt={image.alt}
            fill
            priority
            quality={85}
            sizes="(max-width: 639px) 100vw, 1px"
            className="object-cover sm:hidden"
          />
        )}
        <Image
          src={image.desktop}
          alt={image.alt}
          fill
          priority
          quality={85}
          sizes="100vw"
          className={`object-cover ${image.mobile ? "max-sm:hidden" : ""}`}
        />

        {disclaimer.length > 0 && (
          <>
            {/* Tablet / desktop: text hamesha dikhta hai */}
            <p className={`absolute bottom-5 left-0 right-0 m-0 hidden ${pad} text-[11px] leading-[1.7] text-white/80 sm:block`}>
              {disclaimer.map((line) => (
                <span key={line} className="block">{line}</span>
              ))}
            </p>

            {/* Mobile: button, click par panel */}
            <div className="sm:hidden">
              {!rera && (
                <button
                  type="button"
                  onClick={() => setRera(true)}
                  aria-expanded={false}
                  aria-controls="rera-panel"
                  data-testid="property-rera-toggle"
                  className="absolute bottom-0 left-0 bg-[#111112] px-4 py-[14px] font-nav text-[11px] font-bold uppercase tracking-[0.18em] text-white"
                >
                  + RERA Details
                </button>
              )}

              {rera && (
                <div
                  id="rera-panel"
                  role="region"
                  aria-label="RERA details"
                  data-testid="property-rera-panel"
                  className="absolute bottom-0 left-0 right-6 bg-[#111112] px-[14px] pb-4 pt-[14px] text-white"
                >
                  <button
                    type="button"
                    onClick={() => setRera(false)}
                    aria-label="Close RERA details"
                    aria-expanded
                    className="absolute right-3 top-3 grid size-5 place-items-center border border-white/60"
                  >
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </button>
                  <p className="m-0 pr-8 text-[11px] leading-[1.75] tracking-[0.04em]">
                    {disclaimer.map((line) => (
                      <span key={line} className="block">{line}</span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* CONTENT BAND */}
      <div className={`bg-[#F6F2EA] ${pad} pb-16 pt-8 sm:pb-20 sm:pt-12`}>
        {eyebrow && (
          <p className="m-0 font-nav text-[11px] font-semibold uppercase tracking-[1.65px] text-[#4D4D4F]">
            {eyebrow}
          </p>
        )}
        <h1 className="mb-0 mt-4 font-serif text-[36px] font-light leading-[1.05] text-[#091B36] sm:mt-5 sm:text-[60px]">
          {title}
        </h1>

        {ctas.length > 0 && (
          <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
            {ctas.map((c) => {
              const cls = c.variant === "solid" ? SOLID : OUTLINE;
              return c.type === "enquire" ? (
                <EnquiryButton key={c.label} source={`property-${name}`} className={cls}>
                  {c.label}
                </EnquiryButton>
              ) : (
                <a
                  key={c.label}
                  href={c.href}
                  className={cls}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {c.label}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}