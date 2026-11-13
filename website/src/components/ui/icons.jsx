export const PhoneIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true">
    <path
      d="M4.6 2.2h2.1l1.1 2.7-1.4 1a7.8 7.8 0 0 0 3.7 3.7l1-1.4 2.7 1.1v2.1a1.4 1.4 0 0 1-1.5 1.4A11 11 0 0 1 3.2 3.7 1.4 1.4 0 0 1 4.6 2.2Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

export const WhatsappIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 448 512" width={size} height={size} aria-hidden="true" fill="currentColor">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
);

const SOCIAL = {
  facebook: <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.6 2.1 15.6 2 14.5 2 12 2 10.3 3.5 10.3 6.3v2.2H8V12h2.3v10H14V12h2.6l.4-3.5z" fill="currentColor" />,
  youtube: <path d="M23 12s0-3.4-.4-5c-.3-1-1-1.7-2-2C18.9 4.5 12 4.5 12 4.5s-6.9 0-8.6.5c-1 .3-1.7 1-2 2C1 9.6 1 12 1 12s0 3.4.4 5c.3 1 1 1.7 2 2 1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5c1-.3 1.7-1 2-2 .4-1.6.4-5 .4-5zM9.8 15.3V8.7l5.7 3.3z" fill="currentColor" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </>
  ),
  linkedin: <path d="M4.98 3.5A2.5 2.5 0 002.5 6 2.5 2.5 0 005 8.5 2.5 2.5 0 007.5 6 2.5 2.5 0 004.98 3.5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.75-1.95C21.4 8.75 22 11 22 14.1V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4z" fill="currentColor" />,
};

export const SocialIcon = ({ name, size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
    {SOCIAL[name]}
  </svg>
);

const DOCK = {
  home: (
    <>
      <path d="M4 11.5L12 4.5l8 7" />
      <path d="M6.5 10.5V19h11v-8.5" />
    </>
  ),
  launches: <path d="M12 3.4c.55 4.7 3.9 8.05 8.6 8.6-4.7.55-8.05 3.9-8.6 8.6-.55-4.7-3.9-8.05-8.6-8.6 4.7-.55 8.05-3.9 8.6-8.6Z" />,
  communities: (
    <>
      <circle cx="12" cy="10" r="2.9" />
      <path d="M19 10c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 14 0Z" />
    </>
  ),
  enquire: <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H9l-4 4v-4h-.5A2.5 2.5 0 0 1 4 13.5v-7Z" />,
  more: (
    <>
      <rect x="4.6" y="4.6" width="6.3" height="6.3" />
      <rect x="13.1" y="4.6" width="6.3" height="6.3" />
      <rect x="4.6" y="13.1" width="6.3" height="6.3" />
      <rect x="13.1" y="13.1" width="6.3" height="6.3" />
    </>
  ),
};

export const DockIcon = ({ name }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {DOCK[name]}
  </svg>
);