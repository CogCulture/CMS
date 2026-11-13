export const footer = {
  logo: { src: "/images/emaar-india-logo-en.svg", alt: "Emaar India" },
  actions: [
    { label: "Get in Touch", action: "enquire", variant: "solid" },
    { label: "WhatsApp", href: "https://wa.me/911234567890", icon: "whatsapp", variant: "outline" },
  ],
  columns: [
    {
      title: "Explore",
      links: [
        { label: "Residential", href: "/projects/residential/ongoing" },
        { label: "Commercial", href: "/projects/commercial/ongoing" },
        { label: "Master Developments", href: "/master-developments" },
        { label: "Latest Launches", href: "/latest-launches" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Who we are", href: "/about" },
        { label: "Awards", href: "/awards" },
        { label: "Career", href: "/career" },
        { label: "Emaar Foundation", href: "/emaar-foundation" },
        { label: "Sustainability", href: "/sustainability" },
        { label: "Blogs", href: "/blogs" },
        { label: "Investor Relations", href: "/investor-relations" },
        { label: "E-Services", href: "/e-services" },
        { label: "Compliance", href: "/compliance" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Get in touch", action: "enquire", mobileOnly: true },
        { label: "WhatsApp", href: "https://wa.me/911234567890", external: true, mobileOnly: true },
        { label: "Customer support", href: "mailto:support@emaarindia.com" },
        { label: "Emaar One app", href: "/emaar-one-app" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
  ],
  social: [
    { name: "facebook", label: "Facebook", href: "https://www.facebook.com/emaarindia" },
    { name: "youtube", label: "YouTube", href: "https://www.youtube.com/@emaarindia" },
    { name: "instagram", label: "Instagram", href: "https://www.instagram.com/emaarindia" },
    { name: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/emaar-india" },
  ],
  bottom: {
    exploreAll: { label: "Explore all of Emaar", href: "/sitemap" },
    copyright: "© 2026 Emaar India",
    legal: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Country & Language", href: "/country-language" },
    ],
  },
};