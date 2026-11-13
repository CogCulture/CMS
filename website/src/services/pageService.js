import { header } from "@/data/header";
import { footer } from "@/data/footer";
import { home } from "@/data/home";
import { getSiteContent } from "@/services/cmsService";

// Naya page add karna ho to yahan ek line (jab tak API ready nahi)
const mock = { header, footer, home };

export async function getPage(slug, { revalidate = 60, isPreview = false } = {}) {
  const base = process.env.API_URL;

  // API_URL set hai to real API, warna dummy data
  if (base) {
    try {
      const res = await fetch(`${base}/pages/${slug}`, { next: { revalidate } });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error(`getPage("${slug}") failed:`, err);
    }
  }

  // Live CMS integration with safe fallback to mock static defaults
  try {
    const cms = await getSiteContent(isPreview);
    if (cms?.sections) {
      const s = cms.sections;
      if (slug === "home") {
        return {
          ...home,
          hero: s.hero ? { ...home.hero, ...s.hero } : home.hero,
          search: s.search ? { ...home.search, ...s.search } : home.search,
          launches: s.launches ? { ...home.launches, ...s.launches } : home.launches,
          developments: s.developments ? { ...home.developments, ...s.developments } : home.developments,
          underDevelopment: s.underDevelopment ? { ...home.underDevelopment, ...s.underDevelopment } : home.underDevelopment,
          communitiesIntro: s.communitiesIntro ? { ...home.communitiesIntro, ...s.communitiesIntro } : home.communitiesIntro,
          communities: s.communities ? { ...home.communities, ...s.communities } : home.communities,
          propertiesIntro: s.propertiesIntro ? { ...home.propertiesIntro, ...s.propertiesIntro } : home.propertiesIntro,
          showcase: s.showcase ? { ...home.showcase, ...s.showcase } : home.showcase,
          legacy: s.legacy ? { ...home.legacy, ...s.legacy } : home.legacy,
          press: s.press ? { ...home.press, ...s.press } : home.press,
          converse: s.converse ? { ...home.converse, ...s.converse } : home.converse,
          sections_order: cms.sections_order || s.sections_order || null
        };
      }
      if (slug === "header" && (s.header?.raw || s.header)) {
        if (s.header?.raw) return s.header.raw;
        const logoObj = typeof s.header?.logo === 'string'
          ? { src: s.header.logo, alt: s.header.logo_alt || header.logo.alt }
          : (s.header?.logo || header.logo);
        return {
          ...header,
          logo: {
            src: logoObj?.src || '/images/emaar-india-logo-en.svg',
            alt: logoObj?.alt || 'Emaar India'
          }
        };
      }
      if (slug === "footer" && (s.footer?.raw || s.footer)) {
        if (s.footer?.raw) return s.footer.raw;
        const logoObj = typeof s.footer?.logo === 'string'
          ? { src: s.footer.logo, alt: footer.logo.alt }
          : (s.footer?.logo || footer.logo);
        return {
          ...footer,
          columns: s.footer.columns || footer.columns,
          logo: {
            src: logoObj?.src || '/images/emaar-india-logo-en.svg',
            alt: logoObj?.alt || 'Emaar India'
          }
        };
      }
    }
  } catch (err) {
    // CMS unreachable, fallback cleanly
  }

  return mock[slug] ?? null;
}