import Image from "next/image";
import Link from "next/link";

const defaultGridData = {
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
export default function DiscoverGrid({ data }) {
  const rawWalkImg = data?.walkthrough?.image || defaultGridData.walkthrough.image;
  const walkImg =
    typeof rawWalkImg === "string" && rawWalkImg.includes("/_next/image") && rawWalkImg.includes("url=")
      ? decodeURIComponent((rawWalkImg.match(/[?&]url=([^&]+)/) || [])[1] || rawWalkImg)
      : rawWalkImg;

  const walkthrough = {
    badge: data?.walkthrough?.badge || defaultGridData.walkthrough.badge,
    title: data?.walkthrough?.title || defaultGridData.walkthrough.title,
    subtitle: data?.walkthrough?.subtitle || defaultGridData.walkthrough.subtitle,
    image: walkImg,
    caption: data?.walkthrough?.content || data?.walkthrough?.caption || defaultGridData.walkthrough.caption,
    link: data?.walkthrough?.cta_link || defaultGridData.walkthrough.link,
  };

  const blogs = {
    title: data?.blogs?.title || defaultGridData.blogs.title,
    subtitle: data?.blogs?.subtitle || defaultGridData.blogs.subtitle,
    viewAllLink: data?.blogs?.view_all_link || defaultGridData.blogs.viewAllLink,
    viewAllText: data?.blogs?.view_all_text || "VIEW ALL",
    posts: (data?.blogs?.posts && data.blogs.posts.length > 0) ? data.blogs.posts : defaultGridData.blogs.posts,
  };

  return (
    <section className="container flex flex-col gap-4 px-4 2xl:px-24">

      {/* NEW */}
      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
        {walkthrough.badge}
        <span className="h-px max-w-28 flex-1 bg-gray-400"></span>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-8 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-[auto_auto]">

        {/* PROJECT WALKTHROUGHS TITLE */}
        <h2 className="flex flex-col font-[optima]! text-[34px] leading-10 lg:text-4xl">
          <span dangerouslySetInnerHTML={{ __html: walkthrough.title }} />

          <p className="text-sm font-light" dangerouslySetInnerHTML={{ __html: walkthrough.subtitle }} />
        </h2>

        {/* PROJECT WALKTHROUGH */}
        <Link
          href={walkthrough.link}
          className="flex flex-col gap-2 lg:gap-4"
        >
          <div className="relative w-full">
            <Image
              src={walkthrough.image}
              alt="Walkthrough Preview"
              width={676}
              height={160}
              className="h-36 w-full object-cover lg:h-44"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="text-xs leading-relaxed tracking-widest lg:text-sm" dangerouslySetInnerHTML={{ __html: walkthrough.caption }} />
        </Link>

        {/* BLOG TITLE */}
        <div className="flex items-center justify-between gap-4">

          <h2 className="flex flex-col font-[optima]! text-[34px] leading-10 lg:text-4xl">
            <span dangerouslySetInnerHTML={{ __html: blogs.title }} />

            <p className="text-sm font-light" dangerouslySetInnerHTML={{ __html: blogs.subtitle }} />
          </h2>

          <Link
            href={blogs.viewAllLink}
            className="hidden shrink-0 text-sm tracking-widest uppercase lg:block"
          >
            {blogs.viewAllText || "VIEW ALL"}
          </Link>

        </div>

        {/* BLOG LIST */}
        <div className="grid grid-cols-2 gap-4 lg:gap-8">

          {blogs.posts.map((post) => (
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

              <p className="text-xs leading-relaxed tracking-widest lg:text-sm">
                {post.caption}
              </p>
            </Link>
          ))}

        </div>

      </div>
    </section>
  );
}
