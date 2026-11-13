import Image from "next/image";
import SectionEyebrow from "./SectionEyebrow";

export default function PropertyHighlights({ data }) {
  const { eyebrow, items = [] } = data;

  return (
    <section
      id="highlights"
      aria-label={eyebrow}
      data-testid="property-highlights"
      className="bg-[#F6F2EA] px-[clamp(20px,4vw,64px)]  pb-6 md:pb-16  pt-8 text-[#091B36]"
    >
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      <div className="mt-6 mt-md-10 flex flex-col gap-12 lg:gap-20">
        {items.map((it, i) => {
          const reversed = i % 2 === 1;
          return (
            <article
              key={it.title}
              data-testid="property-highlight"
              className={`grid items-center gap-8 lg:gap-[3vw] ${
                reversed
                  ? "lg:grid-cols-[9fr_11fr]"
                  : "lg:grid-cols-[11fr_9fr]"
              }`}
            >
              <div
                className={`relative aspect-[16/10] w-full overflow-hidden bg-black/5 ${
                  reversed ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={it.image.src}
                  alt={it.image.alt}
                  fill
                  sizes="(max-width: 1023px) 92vw, 55vw"
                  quality={80}
                  className="object-cover"
                />
              </div>

              <div className={reversed ? "lg:order-1" : ""}>
                <h3 className="m-0 font-serif text-[28px] font-light leading-[1.15] sm:text-[40px]">
                  {it.title}
                </h3>
                <p className="mb-0 mt-4 mt-md-5 max-w-[620px] text-[16px] leading-[1.75] text-[#5C5346]">
                  {it.text}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}