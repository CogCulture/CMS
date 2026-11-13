export const properties = [
  {
    slug: "emaar-serenity-hills",
    name: "Serenity Hills",
    seo: {
      title: "Serenity Hills, Gurugram",
      description: "Luxury residences in Gurugram by Emaar India.",
      image: "/images/properties/emaar-serenity-hills/hero-desktop.jpg",
    },
    breadcrumb: { homeLabel: "Home", homeHref: "/" },
    hero: {
      image: {
        desktop: "/images/properties/emaar-serenity-hills/serenity-hills.webp",
        mobile: "/images/properties/emaar-serenity-hills/project-banner.webp",
        alt: "Serenity Hills, Gurugram",
      },
      eyebrow: "Come home to acres of nature",
      title: "Serenity Hills",
      disclaimer: [
        "PROMOTION | HRERA Registration No.: RC/REP/HARERA/GGM/993/725/2025/96 DATED. 16.10.2025",
        "PROMOTION | HRERA Registration No.: RC/REP/HARERA/GGM/994/726/2025/97 DATED. 16.10.2025",
        "(website: www.haryanarera.gov.in)",
      ],
      ctas: [
        { label: "Register Interest", type: "enquire", variant: "solid" },
        { label: "View brochure", href: "/docs/serenity-hills-brochure.pdf", variant: "outline", external: true },
        { label: "Floor plans", href: "/docs/serenity-hills-floorplan.pdf", variant: "outline", external: true },
      ],
    },
        overview: {
      eyebrow: "The project",
      title: "Where Light, Landscape and Calm Come Together.",
      lede: "Spread across eight acres of open greens, Emaar Serenity Hills brings together architecture, landscape, and emotion in perfect harmony. Homes here are designed to breathe, with wide balconies, open layouts, and the quiet assurance of light and space.",
      keyFactsLabel: "Key facts",
      keyFacts: [
        { icon: "diamond", text: "IGBC Platinum Pre-certified Building" },
        { icon: "building", text: "3 Sides Homes Opening to the Outdoors" },
      ],
    },
    highlights: {
      eyebrow: "Highlights",
      items: [
        {
          title: "Life, Framed by Nature",
          text: "At the heart of Serenity Hills lies an 8-acre Central Greens, a canvas of pathways, courtyards, gardens and water features. With over 80% of homes overlooking the Central Greens or positioned at corners, nature is not something you visit here. It is the view you live with.",
          image: { src: "/images/properties/serenity-hills/highlight-1.webp", alt: "Central Greens at Serenity Hills" },
        },
        {
          title: "The Art of Living Well",
          text: "An Olympic pool, a spa, yoga lawns, swimming pools and multi-sport arenas make wellness feel effortless. Indoors, the clubhouse gathers lounges, dining, a patisserie, revitalisation spaces, banquet and co-working facilities, so there is always a place to meet, unwind or simply be.",
          image: { src: "/images/properties/serenity-hills/highlight-2.webp", alt: "Pool and cabanas at Serenity Hills" },
        },
      ],
    },
        gallery: {
      eyebrow: "Gallery",
      tabs: [
        {
          key: "exterior",
          label: "Exterior",
          title: "A Landscape to Come Home To",
          text: "Over 20 acres of pathways, courtyards and gardens leave room to wander, gather and unwind at your own pace.",
          images: [
            { src: "/images/properties/serenity-hills/gallery-ext-1.webp", alt: "Serenity Hills towers and landscape" },
            { src: "/images/properties/serenity-hills/gallery-ext-2.webp", alt: "Children's play area" },
            { src: "/images/properties/serenity-hills/gallery-ext-3.webp", alt: "Water garden and walkway" },
          ],
        },
        {
          key: "interior",
          label: "Interior",
          title: "Crafted for Living",
          text: "Open layouts, wide balconies and warm finishes bring light and space into every room.",
          images: [
            { src: "/images/properties/serenity-hills/gallery-int-1.webp", alt: "Living room" },
            { src: "/images/properties/serenity-hills/gallery-int-2.webp", alt: "Bedroom" },
            { src: "/images/properties/serenity-hills/gallery-int-3.webp", alt: "Balcony" },
          ],
        },
      ],
    },
        amenities: {
      eyebrow: "Amenities",
      title: "Designed for Living Well",
      text: "Spaces to move, slow down and come together, woven thoughtfully into the community.",
      items: [
        { icon: "cycling", label: "Cycling Track" },
        { icon: "olympic", label: "Olympic Pool" },
        { icon: "spa", label: "Spa" },
        { icon: "deck", label: "Floating Deck" },
        { icon: "meditation", label: "Yoga & Meditation Zone" },
        { icon: "slide", label: "Kids' Play Area" },
        { icon: "event", label: "Community Event Lawn" },
        { icon: "sports", label: "Sports Facilities" },
        { icon: "pet", label: "Pet Park" },
        { icon: "trail", label: "Jogging & Walking Trail" },
        { icon: "lake", label: "Lake" },
        { icon: "party", label: "Club Party Lawn" },
      ],
    },
     location: {
  eyebrow: "Location",
  mapTitle: "Map of Emaar Serenity Hills",
  openUrl: "https://www.google.com/maps/search/?api=1&query=Emaar+Serenity+Hills+Gurugram",
  openLabel: "Open in Google Maps",
  origin: { name: "Serenity Hills", coords: [77.0660397, 28.4269689] }, // TODO: galat lag raha hai, project ka asli pin daalo
  destinations: [
    { name: "Cloverleaf (Dwarka Expy / NH-48)", coords: [76.9900132, 28.4069395] },
    { name: "Delhi Public School",     coords: [76.9597526, 28.4063222] },
    { name: "Apollo Cradle",           coords: [76.9530944, 28.3926184] },
    { name: "Hyatt Regency",           coords: [76.9769075, 28.3919521] },
    { name: "Iris Broadway",           coords: [76.9454175, 28.4035483] }, // approx, neeche dekho
    { name: "St. Xavier's High School", coords: [77.0579754, 28.407035] }, // neeche dekho
  ],
  note: "Select a destination to see the drive from Serenity Hills; distances and drive times are estimates based on OpenStreetMap data. Emaar lists these as nearby.",
},
        connectivity: {
      title: "Connected to Gurugram. Closer to Calm.",
      text: [
        "Set in Sector 86 with direct frontage on a 75-metre road, Serenity Hills flows seamlessly onto NH-48 and Dwarka Expressway.",
        "Key business and lifestyle destinations stay within easy reach, yet home feels a world apart.",
      ],
      stats: [
        { icon: "leaf", value: "8 acres", label: "Central Greens" },
        { icon: "towers", value: "13", label: "Sculpted Towers" },
        { icon: "building", value: "25.9 acres", label: "Township" },
      ],
    },
  },
];