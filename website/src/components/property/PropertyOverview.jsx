import SectionEyebrow from "./SectionEyebrow";

const ICONS = {
  diamond: <path d="M12 3 20.4 12 12 21 3.6 12z" />,
  building: (
    <>
      <path d="M4 21V5.6A1.6 1.6 0 0 1 5.6 4h8.8A1.6 1.6 0 0 1 16 5.6V21" />
      <path d="M16 10.5h3.9A1.6 1.6 0 0 1 21.5 12v9" />
      <path d="M2.5 21h19" />
      <path d="M7 8h2M11 8h2M7 12h2M11 12h2M7 16h2M11 16h2" />
    </>
  ),
};

const Icon = ({ name }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="flex-none text-[#777675]"
  >
    {ICONS[name] ?? ICONS.diamond}
  </svg>
);

export default function PropertyOverview({ data }) {
  const { eyebrow, title, lede, keyFactsLabel, keyFacts = [] } = data;

  return (
    <section
      id="overview"
      aria-labelledby="overview-title"
      data-testid="property-overview"
      className="bg-[#F6F2EA] px-[clamp(20px,4vw,64px)] pb-6 md:pb-16 pt-4 text-[#0e1f3a]"
    >
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      <h2
        id="overview-title"
        className="mb-0 mt-6 mt-md-8 max-w-[1100px] font-serif text-[28px] font-light leading-[1.15] sm:text-[40px] lg:text-[40px] text-[#111112]"
      >
        {title}
      </h2>

      <p className="mb-0 mt-7 max-w-[770px] text-[16px] leading-[1.75] text-[#0A0A0A] sm:text-[16px]">{lede}</p>

      {keyFacts.length > 0 && (
        <div className="mt-8 max-w-[650px]">
          <p className="m-0 mb-3 font-nav text-[10px] font-semibold uppercase tracking-[1.12px] text-[#6F6553]/60">
            {keyFactsLabel}
          </p>
          <ul data-testid="property-key-facts" className="m-0 list-none border-t border-[#D5D2CB] p-0">
            {keyFacts.map((f) => (
              <li
                key={f.text}
                className="flex items-center gap-5 border-b border-[#D5D2CB] py-[12px] font-serif text-[14px] text-[#091B36]"
              >
                <Icon name={f.icon} />
                {f.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}