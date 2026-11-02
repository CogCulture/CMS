"use client";

import { useState } from "react";
import { MobilePropertySearchSheet } from "./PropertySearch";
import GetInTouchModal from "./GetInTouchModal";

export default function MobileHomeActions() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <div className="flex w-full gap-4 p-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex-1 cursor-pointer rounded-xs border-2 border-primary bg-white px-4.5 py-3.5 text-xs font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary hover:text-white"
        >
          Search
        </button>

        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className="flex-1 cursor-pointer rounded-xs border-2 border-primary bg-primary px-4.5 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-primary"
        >
          Get in touch
        </button>
      </div>

      <MobilePropertySearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} />
      <GetInTouchModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}