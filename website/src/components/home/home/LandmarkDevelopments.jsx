"use client";

import dynamic from "next/dynamic";

const LandmarkSlider = dynamic(() => import("./LandmarkSlider"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] w-full lg:h-[360px]" /> // placeholder, layout shift na ho isliye
  ),
});

export default function LandmarkDevelopments() {
  return (
    <section className="container flex flex-col gap-4 px-4 2xl:px-24">
      {/* SECTION LABEL + LINE */}
      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
       PROJECTS
        <span className="h-px max-w-28 flex-1 bg-gray-400"></span>
      </div>

      {/* HEADING + ARROWS */}
      <div className="flex items-center justify-between">
        <h2 className="flex flex-col font-[optima]! text-[34px] leading-10 uppercase lg:text-4xl">
         OUR LANDMARK DEVELOPMENTS
        </h2>

        {/* NAVIGATION */}
        <div className="hidden items-center lg:flex">
          <button
            type="button"
            className="landmark-prev py-4 ps-4"
            aria-label="Previous"
          >
            <svg
              width="48"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              className="rotate-180"
            >
              <path
                d="M.562 9.438h44.961L36.831.745l.708-.707 9.9 9.9-9.9 9.899-.708-.708 8.692-8.691H.562v-1Z"
                fill="#071C35"
                fillRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            className="landmark-next py-4 ps-4"
            aria-label="Next"
          >
            <svg width="48" height="20" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M.562 9.438h44.961L36.831.745l.708-.707 9.9 9.9-9.9 9.899-.708-.708 8.692-8.691H.562v-1Z"
                fill="#071C35"
                fillRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* LANDMARK SLIDER (client-only) */}
      <LandmarkSlider />
    </section>
  );
}