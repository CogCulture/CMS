export const home = {
  seo: {
    title: "Emaar India - A Blend Of Lifestyle, Commercial Spaces & Residential Projects",
    description:
      "Emaar India is a leading real estate developer with residential, commercial and lifestyle projects across India.",
    image: "/images/hero-poster.jpg",
  },
  hero: {
    title: "Emaar India",
    alt: "Emaar India Business Centre",
    poster: "/images/hero-poster.jpg",
    mobilePoster: "/images/hero-poster-mobile.jpg",
    video: "/videos/emaar.mp4",
    mobileVideo: "/videos/emaar-mobile.mp4",
  },
    search: {
    submitLabel: "Search",
    drawerKicker: "Property Search",
    drawerTitle: "Refine your search.",
    resultsPath: "/latest-launches",
    filters: [
      {
        key: "type", label: "Property Type", bar: true,
        options: [
          { value: "any", label: "Any" },
          { value: "residential", label: "Residential" },
          { value: "commercial", label: "Commercial" },
        ],
      },
      {
        key: "city", label: "City", bar: true,
        options: [
          { value: "any", label: "Any" },
          { value: "delhi-ncr", label: "Delhi NCR" },
          { value: "lucknow", label: "Lucknow" },
          { value: "mohali", label: "Mohali" },
          { value: "jaipur", label: "Jaipur" },
          { value: "indore", label: "Indore" },
          { value: "alibag", label: "Alibag" },
        ],
      },
      {
        key: "price", label: "Price Range", bar: true,
        options: [
          { value: "any", label: "Any" },
          { value: "under-1", label: "Under ₹1 Cr" },
          { value: "1-2", label: "₹1 - 2 Cr" },
          { value: "2-5", label: "₹2 - 5 Cr" },
          { value: "5-plus", label: "₹5 Cr+" },
        ],
      },
      {
        key: "status", label: "Availability", bar: false,
        options: [
          { value: "any", label: "Any status" },
          { value: "just-launched", label: "Just launched" },
          { value: "now-selling", label: "Now selling" },
          { value: "coming-soon", label: "Coming soon" },
        ],
      },
    ],
  },

  launches: {
  kicker: "New Launches",
  title: "Discover What’s Taking Shape",
  lede: "Explore Emaar’s latest developments across India, each shaped by its setting, design vision and approach to contemporary living.",
  cue: "Scroll to explore",
  exploreLabel: "Explore",
 items: [
  { slug: "serenity-hills", name: "Serenity Hills", city: "Gurugram", type: "Residential", config: "3 BHK",
    image: "/images/launches/serenity-hills.png",        // poster
    video: "/videos/serenity-hills.mp4",
    href: "/properties/emaar-serenity-hills" },
  { slug: "elara", name: "Elara", city: "Lucknow", type: "Residential", config: "3 BHK",
    image: "/images/launches/elara.png",
    video: "/videos/elara.mp4",
    href: "/properties/elara" },
  { slug: "casa-venero", name: "Casa Venero", city: "Alibag", type: "Residential", config: "Villas",
    image: "/images/launches/casa-venero.png",
    video: "/videos/casa-venero.mp4",
    href: "/properties/casa-venero" },
    {
  slug: "elite-oasis",
  name: "Elite Oasis",
  city: "Lucknow",
  type: "Residential",
  config: "2 & 3 BHK",
  image: "/images/launches/elite-oasis.png",
  video: "/videos/elite-oasis.mp4",
  href: "/properties/elite-oasis"
},
],
},
  developments: {
    kicker: "Landmark Developments",
    title: "Where Life Finds Its Place",
    lede: "From distinctive residences to vibrant destinations, each development is part of a wider vision for places that endure and communities that thrive.",
    allLabel: "View all developments",
    allHref: "/projects/residential/ongoing",
    exploreLabel: "Explore",
    items: [
  {
    slug: "serenity-hills",
    name: "Serenity Hills",
    city: "Gurugram",
    type: "Residential / 3 BHK",
    image: "/images/developments/Serenity-hills.webp",
    href: "/properties/emaar-serenity-hills"
  },
  {
    slug: "elara",
    name: "ELARA",
    city: "Lucknow",
    type: "Residential / 3 BHK",
    image: "/images/developments/Elara.webp",
    href: "/properties/elara"
  },
  {
    slug: "emaar-business-square",
    name: "Emaar Business Square",
    city: "Gurugram",
    type: "Commercial",
    image: "/images/developments/Business-square.webp",
    href: "/properties/emaar-business-square"
  },
  {
    slug: "india-business-centre",
    name: "India Business Centre",
    city: "Gurugram",
    type: "Commercial",
    image: "/images/developments/Business-centre.webp",
    href: "/properties/india-business-centre"
  },
  {
    slug: "casa-venero",
    name: "Casa Venero",
    city: "Alibag",
    type: "Residential / Villas",
    image: "/images/developments/Casa-Venero.webp",
    href: "/properties/casa-venero"
  },
  {
    slug: "elite-oasis",
    name: "Elite Oasis",
    city: "Lucknow",
    type: "Residential / 3&4 BHK",
    image: "/images/developments/elite-oasis.webp",
    href: "/properties/elite-oasis"
  }
],
  },
  underDevelopment: {
  kicker: "Projects under development",
  title: "A Vision Taking Shape",
  lede: "Explore Emaar’s developments in the making, shaped by thoughtful design, purposeful planning and the promise of what lies ahead.",
  allLabel: "View all developments",
  allHref: "/projects/residential/ongoing",
  exploreLabel: "Explore",
  items: [
  {
    slug: "the-88",
    name: "The 88",
    city: "Gurugram",
    type: "Residential / 2&3 BHK",
    image: "/images/developments/The-88.webp",
    href: "/properties/the-88"
  },
  {
    slug: "urban-ascent",
    name: "Urban Ascent",
    city: "Gurugram",
    type: "Residential / 3&4 BHK",
    image: "/images/developments/Urban-Ascent.webp",
    href: "/properties/urban-ascent"
  },
  {
    slug: "serenity-hills",
    name: "Serenity Hills",
    city: "Gurugram",
    type: "Residential / 3 BHK",
    image: "/images/developments/Serenity-hills.webp",
    href: "/properties/serenity-hills"
  },
  {
    slug: "elite-oasis",
    name: "Elite Oasis",
    city: "Lucknow",
    type: "Residential / 3&4 BHK",
    image: "/images/developments/elite-oasis.webp",
    href: "/properties/elite-oasis"
  },
  {
    slug: "amaris",
    name: "Amaris",
    city: "Gurugram",
    type: "Residential / 2,3&4 BHK",
    image: "/images/developments/Amaris.webp",
    href: "/properties/amaris"
  },
  {
    slug: "urban-oasis",
    name: "Urban Oasis",
    city: "Gurugram",
    type: "Residential / 3&4 BHK",
    image: "/images/developments/urban-oasis.webp",
    href: "/properties/urban-oasis"
  }
],
},
    communitiesIntro: {
    kicker: "Emaar Communities",
    title: "A World Designed Around Living",
    lede: "Thoughtfully planned and shaped by their surroundings, Emaar communities bring together architecture, open spaces and meaningful everyday experiences.",
    cue: "Scroll to explore",
    nextId: "communities",
  },
    communities: {
    id: "communities",
    allLabel: "View all communities",
    allHref: "/master-developments",
    discoverLabel: "Discover More",
    items: [
      {
        slug: "marbella",
        eyebrow: "Signature living, your way",
        name: "Marbella",
        blurb: "Marbella brings together Spanish-inspired architecture, spacious luxury villas and landscaped surroundings in Sector 66, Gurugram. A private, considered setting that offers the freedom to make every space your own.",
        href: "/marbella",
        images: [
          { src: "/images/communities/Marbella1.webp", alt: "Marbella villas" },
          { src: "/images/communities/Marbella2.webp", alt: "Marbella clubhouse and pool" },
          { src: "/images/communities/Marbella3.webp", alt: "Marbella residence balcony" },
        ],
        video: { src: "/videos/marbella.mp4", poster: "/images/communities/marbella.png", label: "Marbella film" },
      },
     
      {
        slug: "emerald-hills",
        eyebrow: "Space to create your own way of living",
        name: "Emerald Hills",
        blurb: "Set amidst landscaped greens in Sector 65, Emerald Hills offers residential plots within a secure, gated community. With the freedom to build a home around individual aspirations and access to key destinations across Gurugram, Delhi and Faridabad, it brings personal choice and community living together.",
        href: "/emerald-hills",
        images: [
          { src: "/images/communities/Emerald1.webp", alt: "Emerald Hills residences" },
          { src: "/images/communities/Emerald2.webp", alt: "Emerald Hills gazebo" },
          { src: "/images/communities/Emerald3.webp", alt: "Emerald Hills resident" },
        ],
        video: { src: "/videos/emerald-hills.mp4", poster: "/images/communities/emerald-hills.png", label: "Emerald Hills film" },
      },

       {
  slug: "digi-homes",
  eyebrow: "Luxury homes that listen",
  name: "Digi Homes",
  blurb: "Emaar DigiHomes offer enhanced technology-enabled living in naturally lit and well-ventilated apartments. Being three-sided open, these premium, eco-friendly luxury smart homes come with breathtaking views of the Aravalis.",
  href: "/projects/digi-homes",
  images: [
    { src: "/images/communities/Digihomes1.webp", alt: "Emaar DigiHomes residential towers" },
    { src: "/images/communities/Digihomes2.webp", alt: "DigiHomes luxury apartments" },
    { src: "/images/communities/Digihomes3.webp", alt: "DigiHomes landscaped surroundings" },
  ],
  video: {
    src: "/videos/Digihomes.mp4",
    poster: "/images/communities/Digihomes.png",
    label: "DigiHomes film"
  },
},
    ],
  },
    propertiesIntro: {
    kicker: "Emaar Properties",
    title: "More to Experience. More to Discover.",
    lede: "From distinctive residences to commercial destinations, Emaar brings together places designed for living, working and connecting.",
    cue: "Scroll to explore",
    nextId: "destinations",
  },

    showcase: {
    id: "destinations",
    title: "Emaar Properties",
    video: { src: "/videos/emaar-destination.mp4", poster: "/images/showcase/poster.jpg", label: "Emaar brand film" },
    tiles: [
      { label: "Residential Properties", image: "/images/showcase/Residential.webp", href: "/projects/residential/ongoing" },
      { label: "Commercial Properties", image: "/images/showcase/Commercial.webp", href: "/projects/commercial/ongoing" },
    ],
  },
    legacy: {
    id: "legacy",
    title: "A Legacy Built on Vision",
    lede: "Across residential, commercial, hospitality and retail, Emaar's portfolio reflects a long-term vision for places that endure and experiences that matter.",
    stats: [
      { value: 8, label: "Countries" },
      { value: 130900, suffix: "+", label: "Homes delivered" },
      { value: 41, label: "Hotels and resorts" },
      { value: 590, suffix: " mn sq ft", label: "Land bank" },
    ],
  },
    press: {
    id: "press",
    eyebrow: "Press Releases",
    title: "The Latest from Emaar India",
    lede: "Discover the latest announcements, project milestones and developments shaping Emaar's presence across India.",
    allLabel: "All press releases",
    allHref: "/press-releases",
    items: [
      { slug: "press-1", date: "2026-05-11", image: "/images/press/serenity-hills.jpg",
        title: "For decades, Emaar has shaped some of the world's most recognisable landmarks.", href: "/press-releases/press-1" },
      { slug: "press-2", date: "2026-05-11", image: "/images/press/serenity-hills.jpg",
        title: "For decades, Emaar has shaped some of the world's most recognisable landmarks.", href: "/press-releases/press-2" },
      { slug: "press-3", date: "2026-05-11", image: "/images/press/serenity-hills.jpg",
        title: "For decades, Emaar has shaped some of the world's most recognisable landmarks.", href: "/press-releases/press-3" },
      { slug: "press-4", date: "2026-05-11", image: "/images/press/serenity-hills.jpg",
        title: "For decades, Emaar has shaped some of the world's most recognisable landmarks.", href: "/press-releases/press-4" },
      { slug: "press-5", date: "2026-05-11", image: "/images/press/serenity-hills.jpg",
        title: "For decades, Emaar has shaped some of the world's most recognisable landmarks.", href: "/press-releases/press-5" },
      { slug: "press-6", date: "2026-05-11", image: "/images/press/serenity-hills.jpg",
        title: "For decades, Emaar has shaped some of the world's most recognisable landmarks.", href: "/press-releases/press-6" },
    ],
  },
    converse: {
    id: "converse",
    title: "The journey begins with a conversation",
    lede: "Whether you're exploring a new home, a commercial opportunity or a potential partnership, connect with our team to take the next step.",
    video: { src: "/videos/emaar-india-journey.mp4", poster: "/images/converse/poster.jpg", label: "Emaar India building at night" },
    cta: { label: "Chat with us", href: "https://wa.me/911234567890", external: true, icon: "whatsapp" },
  },
};