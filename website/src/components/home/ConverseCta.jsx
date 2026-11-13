import Link from "next/link";
import StageSection from "@/components/StageSection";
import { WhatsappIcon } from "@/components/ui/icons";

export default function ConverseCta({ data }) {
  const { id = "converse", title, lede, video, cta } = data;

  return (
    <StageSection
      id={id}
      aria-labelledby="converse-title"
      data-testid="converse"
      className="h-svh"
    >
      {/* Background video: enter ke saath halka zoom-out */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: "scale(calc(1.12 - var(--enter, 1) * 0.12))" }}
      >
        <video
          className="size-full object-cover"
          src={video.src}
          poster={video.poster}
          aria-label={video.label}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>

      {/* Wash: text readable rakhne ke liye */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/60" />

      {/* Content */}
      <div
        className="absolute inset-0 grid place-items-center px-6 text-center will-change-transform"
        style={{
          transform: "translate3d(0, calc((1 - var(--enter, 1)) * 60px), 0)",
          opacity: "min(1, calc((var(--enter, 1) - 0.1) * 2))",
        }}
      >
        <div className="max-w-[640px]">
          <h2
            id="converse-title"
            className="m-0 font-serif text-[34px] font-light leading-[1.1] sm:text-[48px] lg:text-[54px]"
          >
            {title}
          </h2>
          <p className="mx-auto mb-0 mt-7 max-w-[560px] text-[14px] leading-[1.8] text-white/85 sm:text-[15px]">
            {lede}
          </p>

          <Link
            href={cta.href}
            data-testid="converse-cta"
            {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="mt-10 inline-flex h-12 items-center gap-3 border border-white/60 px-7 font-nav text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 hover:bg-white hover:text-black"
          >
            {cta.icon === "whatsapp" && <WhatsappIcon size={14} />}
            {cta.label}
          </Link>
        </div>
      </div>
    </StageSection>
  );
}