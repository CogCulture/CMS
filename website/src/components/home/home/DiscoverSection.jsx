import Image from "next/image";
import Link from "next/link";

const gridData = {
  walkthrough: {
    badge: "NEW",
    title: "PROJECT WALKTHROUGHS",
    subtitle:
      "EXPLORE EMAAR INDIA FROM WHEREVER YOU ARE IN DETAIL.",
    image: "/images/project-walkthrough.jpg",
    caption:
      "STEP INSIDE EMAAR INDIA'S PROPERTIES THROUGH IMMERSIVE WALKTHROUGHS AND EXPERIENCE THE SPACES BEFORE YOU ARRIVE.",
    link: "/walkthroughs",
  },

  blogs: {
    title: "DISCOVER OUR BLOGS",
    subtitle:
      "READ INSIGHTS ON REAL ESTATE, LIFESTYLE, INVESTMENT AND THE PLACES SHAPING INDIA.",
    viewAllLink: "/blogs",

    posts: [
      {
        id: 1,
        image: "/images/blog1.jpg",
        caption:
          "EMAAR INDIA: BESPOKE, LUXURIOUS & SUSTAINABLE LIVING",
        link: "/blogs/bespoke-living",
      },
      {
        id: 2,
        image: "/images/blog2.jpg",
        caption:
          "DIGI HOMES VS URBAN OASIS: SMART LUXURY IN SECTOR 62",
        link: "/blogs/digi-homes",
      },
    ],
  },
};

export default function DiscoverGrid() {
  return (
    <section className="container flex flex-col gap-4 px-4 2xl:px-24">

      {/* NEW */}
      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
        {gridData.walkthrough.badge}
        <span className="h-px max-w-28 flex-1 bg-gray-400"></span>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-8 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-[auto_auto]">

        {/* PROJECT WALKTHROUGHS TITLE */}
        <h2 className="flex flex-col font-[optima]! text-[34px] leading-10 uppercase lg:text-4xl">
          {gridData.walkthrough.title}

          <p className="text-sm font-light">
            {gridData.walkthrough.subtitle}
          </p>
        </h2>

        {/* PROJECT WALKTHROUGH */}
        <Link
          href={gridData.walkthrough.link}
          className="flex flex-col gap-2 lg:gap-4"
        >
          <div className="relative w-full">
            <Image
              src={gridData.walkthrough.image}
              alt={gridData.walkthrough.title}
              width={676}
              height={160}
              className="h-36 w-full object-cover lg:h-44"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <p className="text-xs leading-relaxed tracking-widest uppercase lg:text-sm">
            {gridData.walkthrough.caption}
          </p>
        </Link>

        {/* BLOG TITLE */}
        <div className="flex items-center justify-between gap-4">

          <h2 className="flex flex-col font-[optima]! text-[34px] leading-10 uppercase lg:text-4xl">
            {gridData.blogs.title}

            <p className="text-sm font-light">
              {gridData.blogs.subtitle}
            </p>
          </h2>

          <Link
            href={gridData.blogs.viewAllLink}
            className="hidden shrink-0 text-sm tracking-widest uppercase lg:block"
          >
            VIEW ALL
          </Link>

        </div>

        {/* BLOG LIST */}
        <div className="grid grid-cols-2 gap-4 lg:gap-8">

          {gridData.blogs.posts.map((post) => (
            <Link
              key={post.id}
              href={post.link}
              className="flex flex-col gap-4"
            >
              <Image
                src={post.image}
                alt={post.caption}
                width={1920}
                height={1080}
                className="h-24 w-full object-cover lg:h-44"
                sizes="200px"
              />

              <p className="text-xs leading-relaxed tracking-widest uppercase lg:text-sm">
                {post.caption}
              </p>
            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}

