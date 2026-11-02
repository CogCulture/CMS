"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";

const defaultLandmarks = [
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

export default function LandmarkSlider({ landmarks: propLandmarks }) {
  const [items, setItems] = useState((propLandmarks && propLandmarks.length > 0) ? propLandmarks : defaultLandmarks);
  const [isEditor, setIsEditor] = useState(false);
  const [activeDragIndex, setActiveDragIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const swiperRef = useRef(null);
  const cardRefs = useRef({});
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const dragInfoRef = useRef({
    isDragging: false,
    activeIdx: null,
    startX: 0,
    startY: 0,
    originSlotLeft: 0,
    currentDx: 0,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      setIsEditor(p.get("editor") === "true");
    }
  }, []);

  useEffect(() => {
    if (propLandmarks && propLandmarks.length > 0) {
      setItems(propLandmarks);
    }
  }, [propLandmarks]);

  const persistLandmarks = async (currentItems) => {
    const updated = currentItems.map((item, idx) => ({ ...item, sort_order: idx + 1 }));
    try {
      await fetch("http://localhost:5000/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landmarks: updated })
      }).catch(() => {
        return fetch("/api/site-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ landmarks: updated })
        });
      });
      try {
        const bc = new BroadcastChannel("cms_live_sync");
        bc.postMessage({ type: "STAGED_CHANGE", timestamp: Date.now() });
      } catch (e) {}
    } catch (e) {
      console.error("Failed to persist landmarks swap:", e);
    }
  };

  const handlePointerDown = (e, idx) => {
    if (!isEditor || e.button !== 0) return;
    if (e.target.isContentEditable) return;

    const cardEl = cardRefs.current[idx];
    if (!cardEl) return;
    const rect = cardEl.getBoundingClientRect();

    dragInfoRef.current = {
      isDragging: false,
      activeIdx: idx,
      startX: e.clientX,
      startY: e.clientY,
      originSlotLeft: rect.left,
      currentDx: 0,
    };

    const handlePointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragInfoRef.current.startX;
      const dy = moveEvent.clientY - dragInfoRef.current.startY;

      if (!dragInfoRef.current.isDragging) {
        if (Math.hypot(dx, dy) > 5) {
          dragInfoRef.current.isDragging = true;
          setActiveDragIndex(dragInfoRef.current.activeIdx);
        } else {
          return;
        }
      }

      dragInfoRef.current.currentDx = dx;
      setDragOffset({ x: dx, y: 0 });

      const currentIdx = dragInfoRef.current.activeIdx;
      const currentEl = cardRefs.current[currentIdx];
      if (!currentEl) return;

      const heldRect = currentEl.getBoundingClientRect();
      const currentItems = itemsRef.current;

      for (let i = 0; i < currentItems.length; i++) {
        if (i === currentIdx) continue;
        const targetEl = cardRefs.current[i];
        if (!targetEl) continue;

        const targetRect = targetEl.getBoundingClientRect();
        const overlapWidth = Math.max(0, Math.min(heldRect.right, targetRect.right) - Math.max(heldRect.left, targetRect.left));
        const overlapPct = overlapWidth / targetRect.width;

        // Visual swap when moving image reaches >= 70% overlap
        if (overlapPct >= 0.70) {
          const newItems = [...currentItems];
          const temp = newItems[currentIdx];
          newItems[currentIdx] = newItems[i];
          newItems[i] = temp;

          const slotShift = targetRect.left - dragInfoRef.current.originSlotLeft;
          dragInfoRef.current.startX += slotShift;
          dragInfoRef.current.originSlotLeft = targetRect.left;
          dragInfoRef.current.activeIdx = i;

          const updatedDx = moveEvent.clientX - dragInfoRef.current.startX;
          dragInfoRef.current.currentDx = updatedDx;
          setDragOffset({ x: updatedDx, y: 0 });
          setActiveDragIndex(i);
          setItems(newItems);
          break;
        }
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      if (dragInfoRef.current.isDragging) {
        persistLandmarks(itemsRef.current);
      }

      dragInfoRef.current.isDragging = false;
      dragInfoRef.current.activeIdx = null;
      setActiveDragIndex(null);
      setDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  return (
    <div className="w-full">
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        modules={[Navigation]}
        navigation={{
          prevEl: ".landmark-prev",
          nextEl: ".landmark-next",
        }}
        loop={!isEditor}
        allowTouchMove={!isEditor}
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
        {items.map((landmark, idx) => {
          const isHeld = activeDragIndex === idx;

          return (
            <SwiperSlide
              key={landmark.id || landmark.slug || idx}
              className="select-none"
              style={{
                zIndex: isHeld ? 60 : 1,
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onPointerDown={(e) => handlePointerDown(e, idx)}
                style={{
                  transform: isHeld ? `translate3d(${dragOffset.x}px, 0, 0) scale(1.02)` : "translate3d(0, 0, 0) scale(1)",
                  transition: isHeld ? "none" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
                  touchAction: isEditor ? "none" : "auto",
                  cursor: isEditor ? (isHeld ? "grabbing" : "grab") : "default",
                  boxShadow: isHeld ? "0 20px 30px -10px rgba(0, 0, 0, 0.25)" : "none",
                }}
                className="group relative flex flex-col items-center rounded-xl"
              >
                <Link
                  href={`/properties/${landmark.slug}`}
                  draggable={false}
                  onClick={(e) => {
                    if (isEditor) e.preventDefault();
                  }}
                  className="flex w-full flex-col items-center pointer-events-auto"
                >
                  {/* IMAGE */}
                  <div className="group aspect-2/1 w-full overflow-hidden lg:aspect-video rounded-md">
                    <Image
                      src={landmark.image}
                      alt={landmark.name}
                      width={1200}
                      height={700}
                      draggable={false}
                      className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                      sizes="(max-width: 1023px) 82vw, 24vw"
                    />
                  </div>

                  {/* TITLE */}
                  <h3
                    contentEditable={isEditor}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      if (!isEditor) return;
                      const newTitle = e.currentTarget.innerText?.trim();
                      if (newTitle && newTitle !== landmark.name) {
                        const updated = items.map((it, i) => i === idx ? { ...it, name: newTitle } : it);
                        setItems(updated);
                        persistLandmarks(updated);
                      }
                    }}
                    className="mt-2 w-11/12 text-center font-[optima]! text-lg text-[22px] uppercase lg:mt-6 lg:w-10/12 lg:text-2xl lg:text-[24px] cursor-text"
                  >
                    {landmark.name}
                  </h3>
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}