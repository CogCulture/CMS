export const header = {
  logo: { src: "/images/emaar-india-logo-en.svg", alt: "Emaar India" },
  nav: [
    {
      label: "Latest Launches",
      href: "/latest-launches",
      mega: {
        eyebrow: "Latest Launches",
        meta: "14 new launches · 6 cities",
        columns: [
          {
            title: "Newly launched",
            links: [
              { label: "Elara", sub: "Lucknow", href: "/properties/elara/" },
              { label: "Serenity Hills", sub: "Gurugram", href: "/properties/emaar-serenity-hills/" },
              { label: "India Business Centre", sub: "Gurugram", href: "/properties/india-business-centre/" },
              { label: "Elite Oasis", sub: "Lucknow", href: "/elite-oasis" },
              { label: "Casa Venero", sub: "Alibag", href: "/casa-venero" },
              { label: "All latest launches", sub: "View all", href: "/latest-launches" },
            ],
          },
          {
            title: "By city",
            links: [
              { label: "Delhi NCR", sub: "31 projects", href: "/latest-launches?city=delhi-ncr" },
              { label: "Lucknow", sub: "2 projects", href: "/latest-launches?city=lucknow" },
              { label: "Mohali", sub: "4 projects", href: "/latest-launches?city=mohali" },
              { label: "Jaipur", sub: "1 projects", href: "/latest-launches?city=jaipur" },
              { label: "Indore", sub: "2 projects", href: "/latest-launches?city=indore" },
              { label: "Alibag", sub: "1 projects", href: "/latest-launches?city=alibag" },
            ],
          },
        ],
        feature: {
          image: "/images/elara.jpg",
          alt: "Elara",
          eyebrow: "Newly launched",
          title: "Elara",
          subtitle: "Lucknow · Residential",
          href: "/properties/elara/",
          cta: "Explore",
        },
      },
    },
    {
      label: "Projects",
      mega: {
        eyebrow: "Projects",
        meta: "Residential & Commercial",
        columns: [
          {
            title: "Residential",
            links: [
              { label: "Ongoing", sub: "Now selling", href: "/projects/residential/ongoing" },
              { label: "Completed", sub: "Delivered homes", href: "/projects/residential/completed" },
            ],
          },
          {
            title: "Commercial",
            links: [
              { label: "Ongoing", sub: "Under development", href: "/projects/commercial/ongoing" },
              { label: "Completed", sub: "Delivered spaces", href: "/projects/commercial/completed" },
            ],
          },
        ],
        feature: {
          image: "/images/serenity-main.jpg",
          alt: "Emaar India project",
          eyebrow: "Featured",
          title: "Serenity Hills",
          subtitle: "Gurugram",
          href: "/projects/residential/ongoing",
          cta: "Explore",
        },
      },
    },
    { label: "Sustainability", href: "/sustainability" },
    { label: "About Emaar", href: "/about" },
  ],

  contact: {
    phone: "tel:+911234567890",
    whatsapp: "https://wa.me/911234567890",
    ctaLabel: "Get in Touch",
  },

  // Mobile bottom dock. type: link | enquire | more
  dock: [
    { key: "home", label: "Home", type: "link", href: "/" },
    { key: "launches", label: "Launches", type: "link", href: "/latest-launches" },
    { key: "communities", label: "Communities", type: "link", href: "/master-developments" },
    { key: "enquire", label: "Enquire", type: "enquire" },
    { key: "more", label: "More", type: "more" },
  ],
  dockSearch: { label: "Find your home", cta: "Search", href: "/latest-launches" },

  // Mobile "More" sheet ke bade links
  mobileMenu: [
    { label: "Home", href: "/" },
    { label: "Latest Launches", href: "/latest-launches" },
    { label: "Residential", href: "/projects/residential/ongoing" },
    { label: "Commercial", href: "/projects/commercial/ongoing" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "About Emaar", href: "/about" },
  ],
};