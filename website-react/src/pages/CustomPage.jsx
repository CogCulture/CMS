import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import BlankCanvasPrompt from "@/components/BlankCanvasPrompt";
import NotFoundPage from "@/pages/NotFoundPage";

export default function CustomPage({ cmsData }) {
  const { slug } = useParams();
  const location = useLocation();
  const rawPath = location.pathname;
  const currentSlug = slug || rawPath.replace(/^\//, "") || "";
  const targetSlug = currentSlug.startsWith("/") ? currentSlug : `/${currentSlug}`;

  const page = cmsData?.pages?.find(
    (p) =>
      p.slug === targetSlug ||
      p.slug === currentSlug ||
      p.slug === rawPath ||
      p.slug === `/${rawPath.replace(/^\//, "")}`
  );

  useEffect(() => {
    if (page?.title) {
      document.title = `${page.title} | Emaar India`;
    }
  }, [page]);

  if (!page) {
    return <NotFoundPage message={`Page "${rawPath}" not found`} />;
  }

  const isBlank = page.template === "blank" || (!page.hero_banner && !page.hero_title && !page.content);
  const heroBanner = page.hero_banner || "";
  const heroTitle = page.hero_title || page.title || "Emaar India";
  const heroSubtitle = page.hero_subtitle || "";
  const content = page.content || "";
  const pageSections = Array.isArray(page.sections) ? page.sections : [];

  return (
    <div className="pt-[70px] min-h-screen w-full bg-white">
      <main className="relative flex min-h-screen w-full flex-col items-center gap-0 pb-16">
        {/* If standard template with banner */}
        {!isBlank && heroBanner && (
          <div className="relative w-full h-[380px] md:h-[460px] flex items-center justify-center bg-black overflow-hidden">
            {heroBanner.endsWith(".mp4") || heroBanner.endsWith(".webm") ? (
              <video
                src={heroBanner}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            ) : (
              <img
                src={heroBanner}
                alt={heroTitle}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-wide uppercase mb-3">
                {heroTitle}
              </h1>
              {heroSubtitle && (
                <p className="text-base md:text-xl text-neutral-200 max-w-2xl mx-auto font-light">
                  {heroSubtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content Section (if present) */}
        {!isBlank && content && (
          <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-neutral-100 text-neutral-700 leading-relaxed text-base">
              {content}
            </div>
          </div>
        )}

        {/* Blank Canvas Initial Workspace (When Page is Empty) */}
        {isBlank && pageSections.length === 0 && (
          <div className="container mx-auto px-4 py-24 min-h-[65vh] flex flex-col items-center justify-center text-center">
            <div className="max-w-md p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">Empty Page Canvas</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                This page is ready for custom content. Click the button below or right-click to insert responsive table grids, image galleries, background videos, or presets.
              </p>
              <BlankCanvasPrompt />
            </div>
          </div>
        )}

        {/* Custom Layout Sections (Rendered on both editor and live) */}
        {pageSections.map((sec, idx) => (
          <section
            key={sec.id || idx}
            className="custom-added-section w-full py-12"
            dangerouslySetInnerHTML={{ __html: sec.html }}
          />
        ))}
      </main>
    </div>
  );
}
