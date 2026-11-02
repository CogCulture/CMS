import React from "react";
import Hero from "@/components/home/Hero";
import PremiumProperties from "@/components/home/PremiumProperties";
import DiscoverSection from "@/components/home/DiscoverSection";
import LandmarkDevelopments from "@/components/home/LandmarkDevelopments";
import MobileHomeActions from "@/components/MobileHomeActions";

export default function HomePage({ cmsData }) {
  return (
    <main className="flex min-h-screen w-full flex-col items-center gap-8 py-0 lg:gap-12">
      <Hero data={cmsData?.settings} />
      <MobileHomeActions />
      <PremiumProperties data={cmsData?.sections?.legacy_intro} /> 
      <DiscoverSection data={cmsData?.sections} />
      <LandmarkDevelopments landmarks={cmsData?.landmarks} />

      {/* RENDER ANY CUSTOM CMS SECTIONS */}
      {Array.isArray(cmsData?.sections?.custom_sections) &&
        cmsData.sections.custom_sections.map((sec, idx) => (
          <section
            key={sec.id || idx}
            className="custom-added-section container flex w-full flex-col items-center justify-center py-12 px-4 2xl:px-24"
            dangerouslySetInnerHTML={{
              __html:
                sec.html ||
                `<div style="max-width: 800px; width: 100%; text-align: center;"><h2 style="font-size: 32px; font-weight: 300; margin-bottom: 14px; font-family: 'Playfair Display', Georgia, serif;">${sec.title || ""}</h2><p style="font-size: 15px; color: #64748b; line-height: 1.7; max-width: 580px; margin: 0 auto;">${sec.content || ""}</p></div>`
            }}
          />
        ))}
    </main>
  );
}
