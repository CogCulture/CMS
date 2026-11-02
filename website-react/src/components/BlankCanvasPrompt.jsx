"use client";

export default function BlankCanvasPrompt() {
  const handleClick = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (typeof window !== "undefined") {
      if (typeof window.__cmsOpenSectionModal === "function") {
        window.__cmsOpenSectionModal();
      } else {
        window.dispatchEvent(new CustomEvent("cms-open-section-modal"));
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("editor") !== "true") {
        params.set("editor", "true");
        window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
        if (typeof window.__cmsOpenSectionModal !== "function") {
          window.location.href = `${window.location.pathname}?editor=true&openSection=true`;
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        id="canvasAddSectionBtn"
        onClick={handleClick}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Add Section / Grid Layout</span>
      </button>
      <span className="text-[11px] text-slate-400">
        Or right-click anywhere to add a section layout
      </span>
    </div>
  );
}
