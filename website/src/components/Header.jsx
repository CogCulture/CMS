"use client";

import { useState } from "react";
import Image from "next/image";

// Defined outside to prevent recreating on every render
const sidebarCategories = [
  {
    name: "Master Developments",
    items: [
      { name: "Gomti Greens", href: "/gomti-greens" },
      { name: "Savana by Indore Greens", href: "/savana-indore" },
      { name: "Savana by Jaipur Greens", href: "/savana-jaipur" },
    ],
  },
  {
    name: "Apartments",
    items: [
      { name: "Urban Oasis", href: "/urban-oasis" },
      { name: "Urban Oasis - Phase - 4", href: "/urban-oasis-phase-4" },
      { name: "Gurgaon Greens", href: "/gurgaon-greens" },
      { name: "Imperial Gardens", href: "/imperial-gardens" },
      { name: "The Views", href: "/the-views" },
    ],
  },
  {
    name: "Commercial Plots",
    href: "/commercial-plots",
    items: [], // No sub-links, behaves as a direct link
  },
  {
    name: "Residential Plots",
    items: [
      { name: "Emaar Continental City - Phase II", href: "/emaar-continental-city-phase-2" },
      { name: "Emaar Continental City - Phase I", href: "/emaar-continental-city-phase-1" },
      { name: "Jaipur Greens Savana", href: "/jaipur-greens-savana" },
      { name: "Gomti Greens – Plots", href: "/gomti-greens-plots" },
    ],
  },
  {
    name: "Offices",
    items: [
      { name: "Emaar India Business Centre", href: "/emaar-india-business-centre" },
      { name: "Emaar Business District 83", href: "/emaar-business-district-83" },
      { name: "Emaar Business District 114 NXT", href: "/emaar-business-district-114-nxt" },
      { name: "Emaar Business District 75A", href: "/emaar-business-district-75a" },
      { name: "Emaar Business District 89 NXT", href: "/emaar-business-district-89-nxt" },
      { name: "Emaar Business District 114", href: "/emaar-business-district-114" },
      { name: "Emaar Business District 65NXT", href: "/emaar-business-district-65nxt" },
      { name: "Emaar Business District 65", href: "/emaar-business-district-65" },
      { name: "The Palm Square", href: "/the-palm-square" },
    ],
  },
  {
    name: "Villas",
    items: [
      { name: "Casa Venero", href: "/casa-venero" },
      { name: "The Villas", href: "/the-villas" },
      { name: "Marbella Villas", href: "/marbella-villas" },
      { name: "Emerald Floors", href: "/emerald-floors" },
    ],
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [sidebarDropdown, setSidebarDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleSidebarDropdown = (name) => {
    setSidebarDropdown(sidebarDropdown === name ? null : name);
  };

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 z-30 flex h-[70px] w-full flex-col justify-center border-b border-gray-200/50">
        <div className="container mx-auto flex flex-1 items-center justify-between px-4 2xl:px-12">

          {/* LEFT: Menu & Logo */}
          <div className="flex g33 md:w-1/4 items-center gap-4">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-8 flex-col items-start h-auto gap-[5px]"
              aria-label="Open menu"
            >
              <span className="block h-[2px] w-6 bg-black"></span>
              <span className="block h-[2px] w-6 bg-black"></span>
              <span className="block h-[2px] w-6 bg-black"></span>
            </button>

            {/* EMAAR Logo Placeholder */}
            <a href="/" className="flex items-center justify-center">
              <Image
                src="/images/emaar-india-logo-en.svg"
                alt="Emaar India"
                width={120}
                height={40}
                className="object-contain h-[35px] w-auto"
                priority
              />
            </a>
          </div>

          {/* CENTER NAVIGATION */}
          <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-12">
            {/* ABOUT US */}
            <a
              href="/about"
              className="border-b border-transparent py-3 text-center text-[11px] uppercase tracking-widest whitespace-nowrap text-black transition-all hover:border-black xl:text-[12px]"
            >
              ABOUT US
            </a>

            {/* LATEST LAUNCHES */}
            <a
              href="/latest-launches"
              className="border-b border-transparent py-3 text-center text-[11px] uppercase tracking-widest whitespace-nowrap text-black transition-all hover:border-black xl:text-[12px]"
            >
              LATEST LAUNCHES
            </a>

            {/* PROJECTS DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("projects")}
                className="flex items-center gap-2 border-b border-transparent py-3 text-center text-[11px] uppercase tracking-widest whitespace-nowrap text-black transition-all hover:border-black xl:text-[12px]"
              >
                PROJECTS

                <svg
                  className={`mt-[1px] h-3 w-3 transition-transform duration-300 ${
                    openDropdown === "projects" ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2.5 4.5L6 8L9.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </button>

              {openDropdown === "projects" && (
                <div className="absolute left-1/2 top-full mt-1 w-48 -translate-x-1/4 border border-gray-100 bg-white shadow-lg">
                  <a
                    href="/projects/residential"
                    className="block px-5 py-3 tracking-widest whitespace-nowrap text-[11px] xl:text-[12px] uppercase text-black hover:bg-gray-50"
                  >
                    Residential
                  </a>
                  <a
                    href="/projects/commercial"
                    className="block px-5 py-3 tracking-widest whitespace-nowrap text-[11px] xl:text-[12px] uppercase text-black hover:bg-gray-50"
                  >
                    Commercial
                  </a>
                  <a
                    href="/projects"
                    className="block px-5 py-3 tracking-widest whitespace-nowrap text-[11px] xl:text-[12px] uppercase text-black hover:bg-gray-50"
                  >
                    All Projects
                  </a>
                </div>
              )}
            </div>

            {/* SUSTAINABILITY */}
            <a
              href="/sustainability"
              className="border-b border-transparent py-3 text-center text-[11px] uppercase tracking-widest whitespace-nowrap text-black transition-all hover:border-black xl:text-[12px]"
            >
              SUSTAINABILITY
            </a>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-6 md:w-1/4">
            {/* CALL ICON */}
            <a
              href="tel:+911234567890"
              aria-label="Call us"
              className="flex items-center justify-center transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/call.svg"
                alt="Call Us"
                width={14}
                height={14}
                className="h-[14px] w-[14px] object-contain"
              />
            </a>

            {/* WHATSAPP ICON */}
            <a
              href="https://wa.me/911234567890"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex items-center justify-center transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/whatsapp.svg"
                alt="WhatsApp"
                width={16}
                height={16}
                className="h-[16px] w-[16px] object-contain"
              />
            </a>

            {/* GET IN TOUCH */}
            <a
              href="/contact"
              className="hidden cursor-pointer rounded-xs border-2 border-primary bg-primary px-4.5 py-3.5 text-xs font-bold tracking-widest uppercase text-white transition-all hover:bg-white hover:text-primary lg:inline-block"
            >
              GET IN TOUCH
            </a>
          </div>
        </div>
      </header>

      {/* DARK OVERLAY */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* LEFT SLIDE MENU */}
      <aside
        className={`fixed left-0 top-0 z-[70] flex h-screen w-[85vw] max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between px-8">
          <div className="flex w-full items-center justify-between border-b border-gray-200 py-4 mb-4">
            {/* LOGO */}
            <a href="/" className="flex items-center justify-center">
              <Image
                src="/images/emaar-india-logo-en.svg"
                alt="Emaar India"
                width={96}
                height={32}
                className="w-auto object-contain"
              />
            </a>

            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-end justify-center text-gray-500 transition-colors hover:text-black"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x size-5 cursor-pointer text-black"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* SIDEBAR MENU */}
        <nav className="flex flex-col gap-2 overflow-y-auto px-8">
          {/* MOBILE/TABLET ONLY TOP NAV LINKS */}
          <div className="mt-lg-4 flex flex-col items-start gap-2 border-b border-gray-200 pb-4 lg:hidden">
            <a
              href="/about"
              className="py-2 text-sm uppercase tracking-widest text-black transition-all duration-500"
            >
              About Us
            </a>
            <a
              href="/latest-launches"
              className="py-2 text-sm uppercase tracking-widest text-black transition-all duration-500"
            >
              Latest Launches
            </a>

            {/* PROJECTS DROPDOWN (mobile) */}
            <div className="flex w-full flex-col">
              <button
                type="button"
                onClick={() => toggleSidebarDropdown("PROJECTS")}
                className="flex w-full items-center justify-between py-2 text-left text-sm uppercase tracking-widest text-black transition-all duration-500"
              >
                Projects
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-4 w-4 transition-transform duration-300 ${
                    sidebarDropdown === "PROJECTS" ? "rotate-90" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  sidebarDropdown === "PROJECTS"
                    ? "max-h-40 pt-1 pb-2 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-2 pl-2">
                  <a
                    href="/projects/residential"
                    className="text-sm uppercase tracking-widest text-gray-600 transition-all duration-500 hover:text-black"
                  >
                    Residential
                  </a>
                  <a
                    href="/projects/commercial"
                    className="text-sm uppercase tracking-widest text-gray-600 transition-all duration-500 hover:text-black"
                  >
                    Commercial
                  </a>
                  <a
                    href="/projects"
                    className="text-sm uppercase tracking-widest text-gray-600 transition-all duration-500 hover:text-black"
                  >
                    All Projects
                  </a>
                </div>
              </div>
            </div>

            <a
              href="/sustainability"
              className="py-2 text-sm uppercase tracking-widest text-black transition-all duration-500"
            >
              Sustainability
            </a>
          </div>

          {/* DYNAMIC CATEGORIES FOR MASTER DEVELOPMENTS & OTHER CATEGORIES */}
          {sidebarCategories.map((category, index) => (
            <div key={index} className="flex flex-col">
              
              {category.items.length > 0 ? (
                <>
                  {/* MENU TITLE WITH DROPDOWN */}
                  <button
                    type="button"
                    onClick={() => toggleSidebarDropdown(category.name)}
                    className="flex w-full items-center justify-between py-2 text-left text-sm uppercase tracking-widest text-black transition-all duration-500"
                  >
                    {category.name}

                    {/* RIGHT / DOWN ARROW */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-4 w-4 transition-transform duration-300 ${
                        sidebarDropdown === category.name ? "rotate-90" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  {/* DROPDOWN CONTENT */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      sidebarDropdown === category.name
                        ? "max-h-[800px] pt-1 pb-2 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-2 pl-2">
                      {category.items.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.href}
                          className="text-sm uppercase tracking-widest text-gray-600 transition-all duration-500 hover:text-black"
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* MENU TITLE AS DIRECT LINK (For empty categories like Commercial Plots) */
                <a
                  href={category.href}
                  className="flex w-full items-center justify-between py-2 text-left text-sm uppercase tracking-widest text-black transition-all duration-500"
                >
                  {category.name}
                </a>
              )}
            </div>
          ))}

        </nav>

        {/* SIDEBAR FOOTER */}
        <div className="p-8 pb-12 mt-auto">
          <a
            href="/contact"
            className="block w-full cursor-pointer rounded-xs border-2 border-primary bg-primary px-4.5 py-3.5 text-center text-xs font-bold tracking-widest uppercase text-white transition-all hover:bg-white hover:text-primary"
          >
            GET IN TOUCH
          </a>
        </div>
      </aside>
    </>
  );
}