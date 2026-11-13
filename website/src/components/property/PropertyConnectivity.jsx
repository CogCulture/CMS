const ICONS = {
  leaf: (
    <>
      <g id="Group_7664" data-name="Group 7664" transform="translate(0 -3.001)">
        <path id="Path_13219" data-name="Path 13219" d="M4.849,22.127C3.093,20.76,2.471,18.644,1.814,16.4,1.569,15.57,1.316,14.71,1,13.9a14.566,14.566,0,0,1,4.592.818.445.445,0,1,0,.31-.834A15.75,15.75,0,0,0,.671,13a.671.671,0,0,0-.619.928A26.341,26.341,0,0,1,.96,16.655c.668,2.277,1.36,4.63,3.343,6.173a.445.445,0,1,0,.547-.7Z" transform="translate(0 -5.552)" fill="#656565"/>
        <path id="Path_13220" data-name="Path 13220" d="M8.1,10.358a.445.445,0,0,0,.06.626c.235.194.479.415.745.676a.445.445,0,1,0,.623-.634c-.285-.28-.547-.518-.8-.729a.445.445,0,0,0-.626.06ZM25.678,3.3a.662.662,0,0,0-.562-.3c-5.953.065-10.395,1.78-12.847,4.961-2.082,2.7-2.62,6.395-1.559,10.685-.519.853-.983,1.661-1.364,2.381a.445.445,0,0,0,.786.416c.382-.721.847-1.53,1.369-2.387,9.653-.13,11.293-5.692,12.874-11.078a36.389,36.389,0,0,1,1.361-4.048.665.665,0,0,0-.058-.633ZM23.522,7.728C22,12.92,20.551,17.831,12.062,18.154A60.375,60.375,0,0,1,18.6,9.532a.445.445,0,0,0-.647-.611,61.19,61.19,0,0,0-6.569,8.646c-.722-3.645-.18-6.764,1.592-9.063,2.234-2.9,6.314-4.489,11.813-4.609-.5,1.231-.889,2.552-1.264,3.833Z" transform="translate(-4.442 0)" fill="#656565"/>
      </g>
    </>
  ),
  towers: (
    <>
      <g id="Group_7661" data-name="Group 7661" transform="translate(0.5 -2.5)">
        <path id="Path_13217" data-name="Path 13217" d="M1.12,19.418V8.864H7.843V19.418m0,0V3h5.6V19.418m0,0V6.518h6.723v12.9M0,19.418H21.289" fill="none" stroke="#656565" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"/>
      </g>
    </>
  ),
  building: (
    <>
      <g id="Group_7668" data-name="Group 7668" transform="translate(0.375 -1.625)">
        <path id="Path_13215" data-name="Path 13215" d="M.808,15.856V2.815A.718.718,0,0,1,1.617,2H9.7a.718.718,0,0,1,.808.815V15.856m0-8.151h3.234a.718.718,0,0,1,.808.815v7.336M0,15.856H15.36" fill="none" stroke="#656565" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75"/>
        <path id="Path_13216" data-name="Path 13216" d="M5,6h.808v.777H5ZM8.234,6h.808v.777H8.234ZM5,9.107h.808v.777H5Zm3.234,0h.808v.777H8.234ZM5,12.213h.808v.777H5Zm3.234,0h.808v.777H8.234Z" transform="translate(-1.362 -0.567)" fill="none" stroke="#656565" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.75"/>
      </g>
    </>
  ),
};

const Icon = ({ name }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="text-[#1c1a17]/55"
  >
    {ICONS[name] ?? ICONS.building}
  </svg>
);

export default function PropertyConnectivity({ data }) {
  const { title, text = [], stats = [] } = data;

  return (
    <section
      id="connectivity"
      aria-labelledby="connectivity-title"
      data-testid="property-connectivity"
      className="bg-[#F6F2EA] px-4 pb-12 pt-4 text-[#091B36] sm:px-[clamp(20px,4vw,64px)] md:pb-24"
    >
      <div className="grid items-start gap-3 md:gap-6 lg:grid-cols-[1fr_1.8fr] lg:gap-[5vw]">
        <h2
          id="connectivity-title"
          className="m-0 max-w-[620px] font-serif text-[28px] font-light leading-[1.15] sm:text-[36px] lg:text-[40px]"
        >
          {title}
        </h2>
        <div className="max-w-[1000px] text-[16px] leading-[1.6] text-[#5C5346] md:leading-[1.75]">
          {text.map((line) => (
            <p key={line} className="m-0">{line}</p>
          ))}
        </div>
      </div>

      {stats.length > 0 && (
        <dl
          data-testid="property-connectivity-stats"
          className="m-0 mt-6 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[#1c1a17]/15 pt-6 sm:grid-cols-3 sm:gap-10 sm:pt-10 md:mt-10 lg:mt-20"
        >
          {stats.map((s) => (
            <div key={s.label} data-testid="property-connectivity-stat" className="flex flex-col gap-3 md:gap-4">
              <Icon name={s.icon} />
              <dd className="m-0 font-serif text-[28px] font-light leading-none sm:text-[38px]">{s.value}</dd>
              <dt className="font-nav text-[11px] tracking-[0.22px] text-[#777575]">{s.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}