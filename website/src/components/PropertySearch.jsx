"use client";

import { useState, useRef, useEffect } from "react";

// =====================================================================
// STATIC DATA (kal isko CRM/API se replace karna hai — shape same rakhna)
// =====================================================================
const PROPERTY_TYPE_OPTIONS = [
  { id: "apartment", label: "Apartment" },
  { id: "hotel", label: "Hotel" },
  { id: "office", label: "Office" },
  { id: "plot", label: "Plot" },
  { id: "townhouse", label: "Townhouse" },
  { id: "villa", label: "Villa" },
];

const CITY_OPTIONS = [
  { id: "gurugram", label: "Gurugram" },
  { id: "lucknow", label: "Lucknow" },
  { id: "indore", label: "Indore" },
  { id: "jaipur", label: "Jaipur" },
  { id: "mohali", label: "Mohali" },
];

const PRICE_STEPS = [
  0, 500000, 1000000, 2000000, 3000000, 5000000, 7500000, 10000000,
  20000000, 50000000, 100000000,
];

const formatPrice = (val) =>
  val >= 10000000
    ? `${val / 10000000} Cr`
    : val >= 100000
    ? `${val / 100000} L`
    : val.toLocaleString("en-IN");

// Reusable Chevron — dono (desktop + mobile) yahi use karte hain
const ChevronIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    className={`w-4 transition-transform duration-300 ${
      isOpen ? "rotate-180" : "rotate-0"
    }`}
    fill="currentColor"
  >
    <path d="M241 369c-9.4 9.4-24.6 9.4-33.9 0L47 209c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l143 143L367 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L241 369z" />
  </svg>
);

// ---------------------------------------------------------------------
// Internal state hook — file ke andar hi hai (export nahi hoti), taaki
// state/logic sirf yahin ek jagah likha jaye. Desktop bar aur mobile
// sheet dono ISI function ko call karte hain — apna-apna independent
// state milta hai, par code ek hi baar likha gaya hai.
// ---------------------------------------------------------------------
function usePropertyFilters() {
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);
  const [minPrice, setMinPrice] = useState(PRICE_STEPS[0]);
  const [maxPrice, setMaxPrice] = useState(PRICE_STEPS[PRICE_STEPS.length - 1]);

  const togglePropertyType = (id) => {
    setPropertyTypes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleCity = (id) => {
    setCities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const resetPropertyTypes = () => setPropertyTypes([]);
  const resetCities = () => setCities([]);

  const propertyTypeLabel =
    propertyTypes.length === 0
      ? "PROPERTY TYPE"
      : propertyTypes.length === 1
      ? PROPERTY_TYPE_OPTIONS.find((o) => o.id === propertyTypes[0])?.label
      : `${propertyTypes.length} SELECTED`;

  const cityLabel =
    cities.length === 0
      ? "CITY"
      : cities.length === 1
      ? CITY_OPTIONS.find((c) => c.id === cities[0])?.label
      : `${cities.length} SELECTED`;

  const getPayload = () => ({ propertyTypes, cities, minPrice, maxPrice });

  return {
    propertyTypes,
    cities,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    togglePropertyType,
    toggleCity,
    resetPropertyTypes,
    resetCities,
    propertyTypeLabel,
    cityLabel,
    getPayload,
  };
}

// =======================================================================
// 1) DESKTOP — floating bar, lg aur upar. Dropdown neeche (top-full) khulta hai.
// =======================================================================
export default function PropertySearch() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const {
    propertyTypes,
    cities,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    togglePropertyType,
    toggleCity,
    resetPropertyTypes,
    resetCities,
    propertyTypeLabel,
    cityLabel,
    getPayload,
  } = usePropertyFilters();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) =>
    setOpenDropdown(openDropdown === name ? null : name);

  const handleSearch = () => {
    const payload = getPayload();
    console.log("Search Payload:", payload);
    alert(
      `Property Type: ${payload.propertyTypes.join(", ") || "All"}\nCity: ${
        payload.cities.join(", ") || "All"
      }\nPrice: ${formatPrice(payload.minPrice)} - ${formatPrice(payload.maxPrice)}`
    );
  };

  return (
    <div className="absolute bottom-[10%] left-1/2 z-1 hidden w-full max-w-6xl -translate-x-1/2 justify-center px-4 lg:flex">
      <div
        ref={dropdownRef}
        className="flex w-10/12 gap-12 rounded-4xl bg-white p-2"
      >
        <div className="flex flex-1 items-center justify-between px-2">
          {/* PROPERTY TYPE */}
          <div className="relative flex-1 flex justify-center">
            <button
              onClick={() => toggleDropdown("propertyType")}
              className="flex items-center gap-2 p-2"
            >
              <span className="border-b border-transparent text-sm tracking-widest uppercase transition-all duration-500">
                {propertyTypeLabel}
              </span>
              <ChevronIcon isOpen={openDropdown === "propertyType"} />
            </button>

            {openDropdown === "propertyType" && (
              <div className="absolute top-full mt-2 w-72 rounded-lg bg-white p-4 shadow-xl border border-gray-100 z-50">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {PROPERTY_TYPE_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={propertyTypes.includes(opt.id)}
                        onChange={() => togglePropertyType(opt.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-black"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <button
                  onClick={resetPropertyTypes}
                  className="mt-4 text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          <div className="h-8/12 w-px bg-gray-400"></div>

          {/* CITY */}
          <div className="relative flex-1 flex justify-center">
            <button
              onClick={() => toggleDropdown("city")}
              className="flex items-center gap-2 p-2"
            >
              <span className="border-b border-transparent text-sm tracking-widest uppercase transition-all duration-500">
                {cityLabel}
              </span>
              <ChevronIcon isOpen={openDropdown === "city"} />
            </button>

            {openDropdown === "city" && (
              <div className="absolute top-full mt-2 w-64 rounded-lg bg-white p-4 shadow-xl border border-gray-100 z-50">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {CITY_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={cities.includes(opt.id)}
                        onChange={() => toggleCity(opt.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-black"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                <button
                  onClick={resetCities}
                  className="mt-4 text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          <div className="h-8/12 w-px bg-gray-400"></div>

          {/* PRICE RANGE */}
          <div className="relative flex-1 flex justify-center">
            <button
              onClick={() => toggleDropdown("priceRange")}
              className="flex items-center gap-2 p-2"
            >
              <span className="border-b border-transparent text-sm tracking-widest uppercase transition-all duration-500">
                PRICE RANGE
              </span>
              <ChevronIcon isOpen={openDropdown === "priceRange"} />
            </button>

            {openDropdown === "priceRange" && (
              <div className="absolute top-full mt-2 w-80 rounded-lg bg-white p-4 shadow-xl border border-gray-100 z-50">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Min Price (₹)
                    </label>
                    <select
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="block w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm leading-tight outline-none"
                    >
                      {PRICE_STEPS.filter((v) => v < maxPrice).map((v) => (
                        <option key={v} value={v}>
                          {formatPrice(v)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="mt-5 text-sm text-gray-400">To</span>

                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Max Price (₹)
                    </label>
                    <select
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="block w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm leading-tight outline-none"
                    >
                      {PRICE_STEPS.filter((v) => v > minPrice).map((v) => (
                        <option key={v} value={v}>
                          {formatPrice(v)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="border-primary hover:text-primary ms-auto cursor-pointer rounded-[28px] border-2 bg-black px-4.5 py-2 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-white"
        >
          SEARCH PROPERTIES
        </button>
      </div>
    </div>
  );
}

// =======================================================================
// 2) MOBILE / TABLET — bottom sheet (neeche se slide hoke aati hai).
//    Dropdown yahan UPAR (bottom-full) khulta hai kyunki button screen
//    ke bottom ke paas hota hai — neeche khulega to screen se bahar jayega.
//    MobileHomeActions.jsx ke "Search" button se open/onClose control hota hai.
// =======================================================================
export function MobilePropertySearchSheet({ open, onClose }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const fieldsRef = useRef(null);

  const {
    propertyTypes,
    cities,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    togglePropertyType,
    toggleCity,
    resetPropertyTypes,
    resetCities,
    propertyTypeLabel,
    cityLabel,
    getPayload,
  } = usePropertyFilters();

  const toggleDropdown = (name) =>
    setOpenDropdown(openDropdown === name ? null : name);

  useEffect(() => {
    function handleClickOutside(event) {
      if (fieldsRef.current && !fieldsRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const payload = getPayload();
    console.log("Mobile Search Payload:", payload);
    onClose();
  };

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* BOTTOM SHEET */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[90] flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-500 ease-in-out lg:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* DRAG HANDLE */}
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1 w-10 rounded-full bg-gray-300"></span>
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pb-2 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-black">
            Search Properties
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="text-gray-500 transition-colors hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* FIELDS — popover UPAR khulta hai (bottom-full) */}
        <div ref={fieldsRef} className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="flex flex-col divide-y divide-gray-100">
            {/* PROPERTY TYPE */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("propertyType")}
                className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-widest text-black"
              >
                {propertyTypeLabel}
                <ChevronIcon isOpen={openDropdown === "propertyType"} />
              </button>

              {openDropdown === "propertyType" && (
                <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-lg border border-gray-100 bg-white p-4 shadow-xl">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {PROPERTY_TYPE_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={propertyTypes.includes(opt.id)}
                          onChange={() => togglePropertyType(opt.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-black"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={resetPropertyTypes}
                    className="mt-4 text-sm text-gray-500 transition-colors hover:text-black"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            {/* CITY */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("city")}
                className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-widest text-black"
              >
                {cityLabel}
                <ChevronIcon isOpen={openDropdown === "city"} />
              </button>

              {openDropdown === "city" && (
                <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-lg border border-gray-100 bg-white p-4 shadow-xl">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {CITY_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={cities.includes(opt.id)}
                          onChange={() => toggleCity(opt.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-black"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={resetCities}
                    className="mt-4 text-sm text-gray-500 transition-colors hover:text-black"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            {/* PRICE RANGE */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("priceRange")}
                className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-widest text-black"
              >
                PRICE RANGE
                <ChevronIcon isOpen={openDropdown === "priceRange"} />
              </button>

              {openDropdown === "priceRange" && (
                <div className="absolute bottom-full left-0 right-0 z-50 mb-1 rounded-lg border border-gray-100 bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">
                        Min Price (₹)
                      </label>
                      <select
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="block w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm leading-tight outline-none"
                      >
                        {PRICE_STEPS.filter((v) => v < maxPrice).map((v) => (
                          <option key={v} value={v}>
                            {formatPrice(v)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="mt-5 text-sm text-gray-400">To</span>

                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-gray-500">
                        Max Price (₹)
                      </label>
                      <select
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="block w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm leading-tight outline-none"
                      >
                        {PRICE_STEPS.filter((v) => v > minPrice).map((v) => (
                          <option key={v} value={v}>
                            {formatPrice(v)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER - SEARCH BUTTON */}
        <div
          className="px-6 py-4"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={handleSearch}
            className="w-full cursor-pointer rounded-[28px] border-2 border-black bg-black px-4.5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
          >
            Search Properties
          </button>
        </div>
      </div>
    </>
  );
}