import Image from "next/image";
import Link from "next/link";
import StageSection from "@/components/StageSection";
import LaunchVideo from "@/components/LaunchVideo";

export default function LaunchStack({ data }) {
  const { kicker, title, lede, cue, nextId, exploreLabel = "Explore", items = [] } = data;

  // cue ka link: data me nextId ho to wahi, warna pehla project panel
  const cueTarget = nextId ?? (items.length ? "launch-first" : undefined);

  return (
    <>
      {/* INTRO */}
      <StageSection aria-label={title} className="h-svh">
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div className="max-w-[820px]">
            <p className="m-0 font-nav text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">{kicker}</p>
            <h2 className="mb-0 mt-5 font-serif text-[28px] font-light leading-[1.1] sm:text-[48px] lg:text-[48px]">{title}</h2>
            <p className="mx-auto mb-0 mt-6 max-w-[560px] text-[14px] leading-[1.7] text-white/75 sm:text-[14px]">{lede}</p>
            {cueTarget && (
              <a
                href={`#${cueTarget}`}
                className="mt-12 inline-flex flex-col items-center gap-4 font-nav text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40 transition-colors hover:text-white"
              >
                {cue}
                <span className="relative block h-10 w-px overflow-hidden bg-white/10" aria-hidden="true">
                  <span className="launch-cue-line absolute inset-0 bg-white/15" />
                </span>
              </a>
            )}
          </div>
        </div>
      </StageSection>

      {/* PROJECT PANELS (items na ho to kuch nahi banega) */}
      {items.map((p, i) => (
        <StageSection
          as="article"
          key={p.slug}
          id={i === 0 ? "launch-first" : undefined}
          aria-label={p.name}
          data-testid="launch-panel"
          className="h-svh"
        >
          <div className="absolute inset-0">
            {p.video ? (
              <LaunchVideo src={p.video} poster={p.image} label={`${p.name} film`} />
            ) : (
              <Image
                src={p.image}
                alt={`${p.name}, ${p.city}`}
                fill
                sizes="100vw"
                quality={80}
                priority={i === 0}
                draggable={false}
                className="object-cover"
              />
            )}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/55 lg:via-black/15 lg:to-transparent" />

          <div className="absolute inset-0 flex items-end px-6 pb-[calc(var(--dock-h,64px)+3.5rem)] sm:px-12 lg:items-center lg:px-[6vw] lg:pb-0">
            <div>
              <h3 className="m-0 font-serif text-[28px] font-light leading-[1.05] sm:text-[52px] lg:text-[60px]">{p.name}</h3>
              <span className="my-4 block h-px w-10 bg-white/50 md:my-5" aria-hidden="true" />
              <p className="m-0 font-nav text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85">{p.city}</p>
              <p className="m-0 mt-3 text-[15px] tracking-[1.57px] text-white/90">
                {p.type}
                {p.config ? ` / ${p.config}` : ""}
              </p>
              <Link
                href={p.href}
                data-testid="launch-explore"
                className="mt-8 inline-flex h-12 items-center border border-white/60 px-7 font-nav text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 hover:bg-white hover:text-black"
              >
                {exploreLabel}
                <span className="sr-only"> {p.name}</span>
              </Link>
            </div>
          </div>
        </StageSection>
      ))}
    </>
  );
}