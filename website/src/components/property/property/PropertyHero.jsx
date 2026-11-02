"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function PropertyHero({ images = [], name = "" }) {
  const [swiper, setSwiper] = useState(null);
  const [active, setActive] = useState(0);

  if (!images.length) return null;

  return (
    <section
      data-testid="property-hero"
      id="property-hero-section"
      className="relative h-[calc(100vh-96px)] w-full"
    >
      <Swiper
        modules={[Autoplay]}
        onSwiper={setSwiper}
        onSlideChange={(s) => setActive(s.realIndex)}
        loop={images.length > 1}
        speed={1200}
        allowTouchMove={images.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="h-full w-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i} className="relative">
            <Image
              src={img.src}
              alt={img.alt || `${name} image ${i + 1}`}
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* RERA Disclaimer */}
      <div className="absolute bottom-4 left-4 z-20 max-w-[90%] text-[9px] leading-[1.35] text-white sm:bottom-5 sm:left-8 sm:text-[10px] md:bottom-6 md:left-16 md:max-w-[520px] md:text-[10px]">
        <p>
          PROMOTION | RERA Registration No.: RC/REP/HARERA/GGM/993/725/2025/96
          DATED: 16.10.2025
        </p>

        <p>
          PROMOTION | THERA Registration No.: RC/REP/HARERA/GGM/994/726/2025/97
          DATED: 16.10.2025
        </p>

        <p>
          (website:{" "}
          <a
            href="https://www.haryanarera.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            www.haryanarera.gov.in
          </a>
          )
        </p>
      </div>

      {/* Custom pagination */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 z-20 flex w-full justify-center">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => swiper?.slideToLoop(i)}
              className={`mx-1.5 mb-4 size-3 cursor-pointer rounded-[1px] transition-all ${
                active === i ? "bg-primary" : "bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}