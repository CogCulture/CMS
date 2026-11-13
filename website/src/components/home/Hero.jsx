import StageSection from "@/components/StageSection";

export default function Hero({ data, children }) {
  const { video, mobileVideo, poster, mobilePoster } = data;

  return (
    <StageSection id="top" aria-label={data.alt} className="h-svh">
      <h1 className="sr-only">{data.title}</h1>

      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: "translate3d(0, calc(var(--cover, 0) * 60px), 0) scale(calc(1.05 - var(--cover, 0) * 0.03))" }}
      >
        {/* Mobile video (sirf < 768px par dikhti hai) */}
        {mobileVideo && (
          <video
            className="h-full w-full object-cover md:hidden"
            src={mobileVideo}
            poster={mobilePoster ?? poster}
            autoPlay muted loop playsInline preload="auto"
          />
        )}

        {/* Desktop video (768px se upar; mobileVideo na ho to sab par) */}
        <video
          className={`h-full w-full object-cover ${mobileVideo ? "hidden md:block" : ""}`}
          src={video}
          poster={poster}
          autoPlay muted loop playsInline preload="auto"
        />
      </div>

      {children}
    </StageSection>
  );
}