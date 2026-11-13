import StageSection from "@/components/StageSection";

export default function CommunitiesIntro({ data }) {
  const { kicker, title, lede, cue, nextId } = data;

  return (
    <StageSection
      id="communities-intro"
      aria-labelledby="communities-intro-title"
      data-testid="communities-intro"
      className="h-svh"
    >
      <div
        className="absolute inset-0 grid place-items-center px-6 text-center will-change-transform"
        style={{
          transform: "translate3d(0, calc((1 - var(--enter, 1)) * 60px - var(--cover, 0) * 50px), 0)",
          opacity: "min(1, calc(var(--enter, 1) * 2), calc(1 - var(--cover, 0) * 1.1))",
        }}
      >
        <div className="max-w-[780px]">
          <p className="m-0 font-nav text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">
            {kicker}
          </p>
          <h2
            id="communities-intro-title"
            className="mb-0 mt-6 font-serif text-[34px] font-light leading-[1.1] sm:text-[48px] lg:text-[56px]"
          >
            {title}
          </h2>
          <p className="mx-auto mb-0 mt-7 max-w-[560px] text-[14px] leading-[1.8] text-white/85 sm:text-[15px]">
            {lede}
          </p>

          {nextId && (
            <a
              href={`#${nextId}`}
              className="mt-14 inline-flex flex-col items-center gap-4 font-nav text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60 transition-colors hover:text-white"
            >
              {cue}
              <span className="relative block h-10 w-px overflow-hidden bg-white/15" aria-hidden="true">
                <span className="launch-cue-line absolute inset-0 bg-white/80" />
              </span>
            </a>
          )}
        </div>
      </div>
    </StageSection>
  );
}