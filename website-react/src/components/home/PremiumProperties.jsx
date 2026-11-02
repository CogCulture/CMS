import React from "react";

const defaultSectionData = {
  intro: {
    title: "BUILT ON LEGACY, DESIGNED FOR LIFE",
    description:
      "For decades, Emaar has shaped some of the world’s most recognisable landmarks through visionary architecture, thoughtful design and a commitment to excellence. Building on this global legacy, Emaar India continues to create distinctive spaces across residential and commercial destinations. Each development reflects a shared belief in creating places that are designed to endure and inspire generations to come.",
  }  
};

export default function PremiumProperties({ data }) {
  const title = data?.title || defaultSectionData.intro.title;
  const description = data?.content || data?.description || defaultSectionData.intro.description;

  return (
    <section className="container flex w-full flex-col gap-4 px-4 2xl:px-24">
      <div className="w-full text-left">
        <h2 className="font-[optima]! text-[28px] leading-tight text-inherit! md:text-[46px] text-left" dangerouslySetInnerHTML={{ __html: title }} />
        <div className="font-light lg:text-lg text-left" dangerouslySetInnerHTML={{ __html: description }} />
      </div>
    </section>
  );
}