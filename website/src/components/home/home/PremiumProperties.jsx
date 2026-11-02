import React from "react";
const sectionData = {
  intro: {
    title: "BUILT ON LEGACY, DESIGNED FOR LIFE",
    description:
      "For decades, Emaar has shaped some of the world’s most recognisable landmarks through visionary architecture, thoughtful design and a commitment to excellence. Building on this global legacy, Emaar India continues to create distinctive spaces across residential and commercial destinations. Each development reflects a shared belief in creating places that are designed to endure and inspire generations to come.",
  }  
};

export default function PremiumProperties() {
  return (
    <section>
      <div className="container mx-auto px-4 2xl:px-24">
        <div>
          <h2 className="font-[optima]! text-[28px] leading-tight text-inherit! uppercase md:text-[46px]">
            {sectionData.intro.title}
          </h2>
          <p className="font-light lg:text-lg">
            {sectionData.intro.description}
          </p>
        </div>
      </div>
    </section>
  );
}