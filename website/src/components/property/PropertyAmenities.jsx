import SectionEyebrow from "./SectionEyebrow";

const ICONS = {
  cycling: (
    <>
      <circle cx="5.5" cy="16" r="3.5" />
      <circle cx="18.5" cy="16" r="3.5" />
      <path d="M5.5 16 9 8h5l4.5 8M9 8l3.5 8M14 8l-1.5-3h-2" />
    </>
  ),
  olympic: (
    <>
      <path d="M3 9c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
      <path d="M3 14c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
      <path d="M3 19c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
    </>
  ),
  spa: (
    <>
      <path d="M12 5c1.8 2 1.8 4.5 0 6.5C10.2 9.5 10.2 7 12 5z" />
      <path d="M12 11.5c-1-3-4-4-7-3.5 0 3.5 2.5 6.5 7 6.5M12 11.5c1-3 4-4 7-3.5 0 3.5-2.5 6.5-7 6.5" />
      <path d="M5 19h14" />
    </>
  ),
  deck: (
    <>
      <path d="M3 14h18M5 14v-3h14v3" />
      <path d="M3 17c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" />
    </>
  ),
  meditation: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7.5v4M7 17c1-3 3-5.5 5-5.5s4 2.5 5 5.5M4 19h16" />
    </>
  ),
  slide: (
    <>
      <path d="M5 4v16M5 6h4c5 0 7 6 10 12" />
      <path d="M3 20h18" />
    </>
  ),
  event: (
    <>
      <path d="M3 20h18" />
      <path d="M13 4a5 5 0 0 1 5 5H8a5 5 0 0 1 5-5zM13 9v11" />
      <path d="M4 17l2-3 2 3" />
    </>
  ),
  sports: (
    <>
      <rect x="3" y="6" width="18" height="12" />
      <path d="M12 6v12M3 12h18M7.5 6v12M16.5 6v12" />
    </>
  ),
  pet: (
    <>
      <path d="M5 11c0-3 2-5 5-5l3 1c3 0 5 2 5 5v1H5z" />
      <path d="M7 12v6M12 12v6M17 12v6" />
    </>
  ),
  trail: (
    <>
      <circle cx="17" cy="5" r="2" />
      <path d="M17 7v2c0 3-3 3-6 3H8c-2 0-3 1.5-3 3s1 3 3 3h11" />
    </>
  ),
  lake: (
    <>
      <path d="M12 4 8 12h8z" />
      <path d="M3 16c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0M3 20c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" />
    </>
  ),
  party: (
    <>
      <path d="M3 6h18" />
      <path d="M5 6l1.5 4L8 6M10 6l1.5 4L13 6M15 6l1.5 4L18 6" />
      <path d="M3 20h18M6 20v-5M12 20v-5M18 20v-5" />
    </>
  ),
};

const Icon = ({ name }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="flex-none text-[#1c1a17]/70"
  >
    {/* ICONS.lawn exist nahi karta tha, isliye fallback event icon rakha hai */}
    {ICONS[name] ?? ICONS.event}
  </svg>
);

export default function PropertyAmenities({ data }) {
  const { eyebrow, title, text, items = [] } = data;

  return (
    <section
      id="amenities"
      aria-labelledby="amenities-title"
      data-testid="property-amenities"
      className="bg-[#F6F2EA] px-4 pb-6 pt-6 text-[#091B36] sm:px-[clamp(20px,4vw,64px)] md:pb-16 md:pt-8"
    >
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      <div className="mt-5 grid items-start gap-5 md:mt-8 md:gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-[5vw]">
        <div>
          <h2
            id="amenities-title"
            className="m-0 font-serif text-[28px] font-light leading-[1.15] text-[#111] sm:text-[36px] lg:text-[40px]"
          >
            {title}
          </h2>
          <p className="mb-0 mt-3 max-w-[560px] text-[16px] leading-[1.6] text-[#5C5346] md:mt-6 md:leading-[1.85]">
            {text}
          </p>
        </div>

        <ul
          data-testid="property-amenities-list"
          className="m-0 grid list-none grid-cols-1 gap-x-10 p-0 sm:grid-cols-2 md:mt-8 lg:mt-0 lg:grid-cols-3"
        >
          {items.map((a) => (
            <li
              key={a.label}
              data-testid="property-amenity"
              className="flex items-center gap-2.5 border-b border-[#E6E2DA] py-3.5 text-[15px] text-[#5C5346] md:gap-4 md:py-3"
            >
              <Icon name={a.icon} />
              <span>{a.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}