"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";

const landmarks = [
  {
    id: 1,
    name: "SERENITY HILLS, GURUGRAM",
    image: "/images/landmarks/Serenity-hills-big.webp",
    slug: "emaar-serenity-hills",
  },
  {
    id: 2,
    name: "EMAAR INDIA BUSINESS CENTRE, GURUGRAM",
    image: "/images/landmarks/business-centre.jpg",
    slug: "emaar-india-business-centre",
  },
  {
    id: 3,
    name: "ELITE OASIS, LUCKNOW",
    image: "/images/landmarks/elite-oasis.jpg",
    slug: "elite-oasis",
  },
  {
    id: 4,
    name: "URBAN ASCENT, GURUGRAM",
    image: "/images/landmarks/urban-ascent.jpg",
    slug: "urban-ascent",
  },
  {
    id: 5,
    name: "MOHALI HILLS RESIDENTIAL PLOTS, MOHALI",
    image: "/images/landmarks/mohali-hills.jpg",
    slug: "mohali-hills",
  },
  {
    id: 6,
    name: "URBAN OASIS PHASE-4, GURUGRAM",
    image: "/images/landmarks/property-main-image-706x385.jpg",
    slug: "urban-oasis-phase-4",
  },
];

export default function LandmarkSlider() {
  return (
    <Swiper
      modules={[Navigation]}
      navigation={{
        prevEl: ".landmark-prev",
        nextEl: ".landmark-next",
      }}
      loop={true}
      spaceBetween={15}
      slidesPerView={1.15}
      breakpoints={{
        640: {
          slidesPerView: 1.2,
          spaceBetween: 15,
        },
        1024: {
          slidesPerView: 4.3,
          spaceBetween: 20,
        },
        1280: {
          slidesPerView: 4.3,
          spaceBetween: 20,
        },
      }}
      className="w-full"
    >
      {landmarks.map((landmark) => (
        <SwiperSlide key={landmark.id} className="select-none">
          <Link
            href={`/properties/${landmark.slug}`}
            className="flex flex-col items-center"
          >
            {/* IMAGE */}
            <div className="group aspect-2/1 w-full overflow-hidden lg:aspect-video">
              <Image
                src={landmark.image}
                alt={landmark.name}
                width={1200}
                height={700}
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                sizes="(max-width: 1023px) 82vw, 24vw"
              />
            </div>

            {/* TITLE */}
            <h3 className="mt-2 w-11/12 text-center font-[optima]! text-lg text-[22px] uppercase lg:mt-6 lg:w-10/12 lg:text-2xl lg:text-[24px]">
              {landmark.name}
            </h3>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}