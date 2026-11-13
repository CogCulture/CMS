"use client";

import { useEffect, useRef, useState } from "react";
import SectionEyebrow from "./SectionEyebrow";

const MAP_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></svg>';
const CAR_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11a2 2 0 0 1 2 2v4h-2v1.5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V17H8v1.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V17H3v-4a2 2 0 0 1 2-2Zm2.2 0h9.6l-1-3H8.2l-1 3ZM6.5 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>';

const formatDistance = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);
const formatDuration = (s) => {
  const t = Math.max(1, Math.round(s / 60));
  return t >= 60 ? `${Math.floor(t / 60)} hr ${t % 60} min` : `${t} min`;
};

function row(icon, text, cls = "") {
  const el = document.createElement("div");
  el.className = `mlp-row ${cls}`;
  const i = document.createElement("span");
  i.innerHTML = icon; // static icon only
  const t = document.createElement("span");
  t.textContent = text;
  el.append(i, t);
  return el;
}

const FullIcon = ({ full }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {full ? (
      <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
    ) : (
      <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
    )}
  </svg>
);

export default function PropertyLocation({ data }) {
  const { eyebrow, mapTitle, openUrl, openLabel, note, origin, destinations = [] } = data;

  const wrapRef = useRef(null);
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const libRef = useRef(null);
  const destMarkerRef = useRef(null);
  const destPopupRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(null); // koi default selected nahi
  const [full, setFull] = useState(false); // custom fullscreen (iPhone par bhi chalta hai)

  // Map init (sirf ek baar)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const mod = await import("maplibre-gl");
      const maplibregl = mod.default ?? mod;
      if (cancelled || !mapElRef.current) return;
      libRef.current = maplibregl;

      const map = new maplibregl.Map({
        container: mapElRef.current,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: origin.coords,
        zoom: 11,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

      // Origin dot + label
      const dot = document.createElement("div");
      dot.style.cssText =
        "width:16px;height:16px;border-radius:50%;background:#111;border:2px solid #fff";
      new maplibregl.Marker({ element: dot }).setLngLat(origin.coords).addTo(map);

      const originBox = document.createElement("div");
      originBox.append(row(MAP_ICON, origin.name, "mlp-title"));
      new maplibregl.Popup({ closeOnClick: false, closeButton: false, offset: 14 })
        .setLngLat(origin.coords)
        .setDOMContent(originBox)
        .addTo(map);

      map.on("load", () => !cancelled && setReady(true));
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [origin.coords, origin.name]);

  // Fullscreen toggle: body scroll lock, Esc se band, map resize
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (full) document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setFull(false);
    if (full) document.addEventListener("keydown", onKey);

    const id = requestAnimationFrame(() => mapRef.current?.resize());
    const id2 = setTimeout(() => mapRef.current?.resize(), 250);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(id);
      clearTimeout(id2);
    };
  }, [full]);

  // Selected destination ka route
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = libRef.current;
    if (!ready || !map) return;

    // Koi destination selected nahi: route aur pin hatao
    if (active === null) {
      destMarkerRef.current?.remove();
      destPopupRef.current?.remove();
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route")) map.removeSource("route");
      map.flyTo({ center: origin.coords, zoom: 11, duration: 800 });
      return;
    }

    const dest = destinations[active];
    if (!dest) return;

    const controller = new AbortController();

    (async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${origin.coords.join(",")};${dest.coords.join(",")}` +
          `?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("OSRM request failed");
        const json = await res.json();
        if (json.code !== "Ok") throw new Error("Route not found");

        const route = json.routes[0];
        const line = { type: "Feature", geometry: route.geometry };

        if (map.getSource("route")) {
          map.getSource("route").setData(line);
        } else {
          map.addSource("route", { type: "geojson", data: line });
          map.addLayer({
            id: "route-line",
            type: "line",
            source: "route",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#111", "line-width": 4 },
          });
        }

        destMarkerRef.current?.remove();
        destPopupRef.current?.remove();

        destMarkerRef.current = new maplibregl.Marker({ color: "#111" })
          .setLngLat(dest.coords)
          .addTo(map);

        const box = document.createElement("div");
        box.append(
          row(MAP_ICON, dest.name, "mlp-title"),
          row(CAR_ICON, `${formatDistance(route.distance)} · ${formatDuration(route.duration)}`, "mlp-meta")
        );
        const link = document.createElement("a");
        link.className = "mlp-link";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.href =
          `https://www.google.com/maps/dir/?api=1&origin=${origin.coords[1]},${origin.coords[0]}` +
          `&destination=${dest.coords[1]},${dest.coords[0]}&travelmode=driving`;
        link.textContent = "Get directions →";
        box.append(link);

        destPopupRef.current = new maplibregl.Popup({
          closeOnClick: false,
          offset: 35,
          maxWidth: "240px",
        })
          .setLngLat(dest.coords)
          .setDOMContent(box)
          .addTo(map);

        const bounds = new maplibregl.LngLatBounds();
        route.geometry.coordinates.forEach((c) => bounds.extend(c));

        // Mobile par chhota padding, top mein chips + popup ke liye jagah
        map.resize();
        const small = map.getContainer().clientWidth < 640;
        map.fitBounds(bounds, {
          padding: small ? { top: 90, bottom: 50, left: 40, right: 40 } : 100,
          maxZoom: 16,
          duration: 800,
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    })();

    return () => controller.abort();
  }, [active, ready, destinations, origin.coords]);

  const onPick = (i) => {
    const next = active === i ? null : i;
    setActive(next);
    // Mobile par button dabate hi map screen par center aa jaye
    if (next !== null && !full && typeof window !== "undefined" && window.innerWidth < 768) {
      wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      id="location"
      aria-label={eyebrow}
      data-testid="property-location"
      className="bg-[#f6f3ec] px-4 pb-6 pt-6 text-[#F6F2EA] sm:px-[clamp(20px,4vw,64px)] md:pb-16 md:pt-8"
    >
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      <div
        ref={wrapRef}
        className={
          full
            ? "fixed inset-0 z-[100] h-full w-full overflow-hidden bg-[#e9e6df]"
            : "relative mt-5 aspect-square w-full overflow-hidden bg-black/5 sm:aspect-[16/8] md:mt-8 lg:aspect-[16/6.4]"
        }
      >
        {/* Destination chips: mobile par ek line mein side-scroll, desktop par wrap */}
        <div
          role="group"
          aria-label={mapTitle}
          className="absolute left-3 right-[60px] top-3 z-10 flex flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:right-[60px] md:flex-wrap md:overflow-visible"
        >
          {destinations.map((d, i) => (
            <button
              key={d.name}
              type="button"
              aria-pressed={active === i}
              onClick={() => onPick(i)}
              className={`flex-none whitespace-nowrap border border-[#111] px-3 py-2 font-nav text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors md:px-4 md:py-2.5 md:text-[11px] md:tracking-[0.12em] ${
                active === i ? "bg-[#111] text-white" : "bg-white text-[#111]"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Fullscreen button */}
        <button
          type="button"
          onClick={() => setFull((v) => !v)}
          aria-label={full ? "Exit fullscreen" : "View map fullscreen"}
          aria-pressed={full}
          className="absolute right-3 top-3 z-20 grid size-10 place-items-center bg-white text-[#111] shadow-md"
        >
          <FullIcon full={full} />
        </button>

        <div className="absolute inset-0">
          <div
            ref={mapElRef}
            data-testid="property-map"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:mt-5 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
        <p data-testid="property-map-note" className="m-0 max-w-[1000px] text-[12px] leading-[1.7] text-[#1c1a17]/65">
          {note}
        </p>
        
      </div>
    </section>
  );
}