import { properties } from "@/data/properties";

export async function getPropertyBySlug(slug, { revalidate = 0 } = {}) {
  const baseProp = properties.find((p) => p.slug === slug) ?? null;

  // Attempt to fetch live dynamic property configuration & map locations from CMS
  try {
    const res = await fetch("http://localhost:5000/api/pages", {
      next: { revalidate: 0 },
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        const cleanSlug = slug.startsWith("/") ? slug : "/" + slug;
        const cmsPage = data.data.find(
          (p) =>
            p.slug === cleanSlug ||
            p.slug === `/properties/${slug}` ||
            p.slug === slug ||
            p.slug?.endsWith(`/${slug}`)
        );
        if (cmsPage) {
          const heroBanner = cmsPage.hero_banner || baseProp?.hero?.image?.desktop || baseProp?.hero?.banner;
          const heroMobile = cmsPage.hero_banner_mobile || heroBanner;
          return {
            ...(baseProp || {}),
            name: cmsPage.title || baseProp?.name,
            hero: {
              ...(baseProp?.hero || {}),
              title: cmsPage.hero_title || baseProp?.hero?.title,
              subtitle: cmsPage.hero_subtitle || baseProp?.hero?.subtitle,
              banner: heroBanner,
              eyebrow: cmsPage.hero_eyebrow || baseProp?.hero?.eyebrow,
              image: {
                ...(baseProp?.hero?.image || {}),
                desktop: heroBanner,
                mobile: heroMobile,
                alt: cmsPage.title || baseProp?.name
              },
              brochureUrl: cmsPage.brochure_url || baseProp?.hero?.brochureUrl,
              floorplanUrl: cmsPage.floorplan_url || baseProp?.hero?.floorplanUrl,
              disclaimer: cmsPage.disclaimer
                ? (Array.isArray(cmsPage.disclaimer) ? cmsPage.disclaimer : [cmsPage.disclaimer])
                : baseProp?.hero?.disclaimer
            },
            overview: cmsPage.overview ? {
              ...(baseProp?.overview || {}),
              ...cmsPage.overview
            } : (cmsPage.content ? {
              ...(baseProp?.overview || {}),
              description: [cmsPage.content]
            } : baseProp?.overview),
            highlights: cmsPage.highlights || baseProp?.highlights,
            gallery: cmsPage.gallery || baseProp?.gallery,
            amenities: cmsPage.amenities || baseProp?.amenities,
            connectivity: cmsPage.connectivity || baseProp?.connectivity,
            location: cmsPage.location || baseProp?.location
          };
        }
      }
    }
  } catch (err) {
    // CMS unreachable - fallback gracefully
  }

  return baseProp;
}