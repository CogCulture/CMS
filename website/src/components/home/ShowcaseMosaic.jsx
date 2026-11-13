import Image from "next/image";
import Link from "next/link";
import StageSection from "@/components/StageSection";

/*
  Slot = video ka final position (viewport ke hisaab se insets).
  Desktop: left bada area, right me 2 tiles. Mobile: upar video, neeche 2 tiles.
  Timing badalni ho to sirf --e wali line (0.15 start, 0.55 duration) badlo.
*/
export default function ShowcaseMosaic({ data }) {
  const { id = "destinations", title, video, tiles } = data;

  return (
    <StageSection
      id={id}
      height="320svh"
      aria-label={title}
      data-testid="showcase-mosaic"
    >
     <div
  className="
    sticky top-0 h-svh overflow-clip bg-black
    [--t:calc(var(--hdr-h)_+_16px)]
    [--r:4vw]
    [--b:calc(var(--dock-h)_+_25svh_+_16px)]
    [--l:4vw]
    lg:[--t:calc(var(--hdr-h)_+_20px)]
    lg:[--r:25.2vw]
    lg:[--b:20px]
    lg:[--l:0.6vw]
  "
  style={{ "--e": "clamp(0, calc((var(--p, 0) - 0.15) / 0.55), 1)" }}
>
        {/* TILES (video ke peeche, video simatne par khulte hain) */}
        <ul
  className="absolute bottom-[calc(var(--dock-h)_+_16px)] left-[4vw] right-[4vw] m-0 grid h-[23svh] list-none grid-cols-2 gap-[2vw] p-0
             lg:bottom-[20px] lg:left-auto lg:right-[0.6vw] lg:top-[calc(var(--hdr-h)_+_20px)] lg:h-auto lg:w-[24vw] lg:grid-cols-1 lg:grid-rows-2 lg:gap-[0.6vw]"
>
          {tiles.map((t) => (
            <li key={t.label} className="relative overflow-hidden">
              <Link href={t.href} data-testid="showcase-tile" className="group absolute inset-0 block">
                <Image
                  src={t.image}
                  alt={t.label}
                  fill
                  sizes="(max-width: 1023px) 46vw, 24vw"
                  quality={80}
                  draggable={false}
                  className="object-cover transition-transform duration-[900ms] ease-out will-change-transform group-hover:scale-[1.04]"
                  style={{ transform: "scale(calc(1.18 - var(--e, 1) * 0.18))" }}
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span
                  className="absolute bottom-[1.1rem] left-[1.1rem] right-3 will-change-transform"
                  style={{
                    opacity: "clamp(0, calc((var(--e, 1) - 0.55) * 2.5), 1)",
                    transform: "translate3d(0, calc((1 - var(--e, 1)) * 16px), 0)",
                  }}
                >
                  <span className="mb-2 block h-px w-5 bg-white/70" aria-hidden="true" />
                  <span className="font-serif text-[15px] font-light sm:text-[18px] lg:text-[20px]">{t.label}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* VIDEO: pehle poori screen, phir clip-path se slot me */}
        <div
          className="pointer-events-auto absolute inset-0 z-10 overflow-hidden bg-black will-change-[clip-path]"
          style={{
            clipPath:
              "inset(calc(var(--t) * var(--e, 1)) calc(var(--r) * var(--e, 1)) calc(var(--b) * var(--e, 1)) calc(var(--l) * var(--e, 1)))",
          }}
        >
          <video
            className="size-full object-cover will-change-transform pointer-events-auto cursor-pointer"
            style={{ transform: "scale(calc(1.12 - var(--e, 1) * 0.12))" }}
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
      </div>
    </StageSection>
  );
}