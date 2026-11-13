import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/services/propertyService";
import PropertyHero from "@/components/property/PropertyHero";
import PropertyOverview from "@/components/property/PropertyOverview";
import PropertyHighlights from "@/components/property/PropertyHighlights";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyAmenities from "@/components/property/PropertyAmenities";
import PropertyLocation from "@/components/property/PropertyLocation";
import PropertyConnectivity from "@/components/property/PropertyConnectivity";


export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return {};
  const { title, description, image } = p.seo ?? {};
  return {
    title: title ?? p.name,
    description,
    alternates: { canonical: `/properties/${slug}` },
    openGraph: { title: title ?? p.name, description, images: image ? [image] : [] },
  };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: property.name,
    description: property.seo?.description,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: property.breadcrumb.homeLabel, item: "/" },
        { "@type": "ListItem", position: 2, name: property.name },
      ],
    },
  };

  return (
    <main
      id="main-content"
      data-testid="property-detail-page"
      className="w-full"
      style={{ paddingTop: "calc(var(--hdr-h) + var(--hdr-top, 0px))" }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PropertyHero name={property.name} breadcrumb={property.breadcrumb} hero={property.hero} />
      {property.overview && <PropertyOverview data={property.overview} />}
      {property.highlights?.items?.length > 0 && <PropertyHighlights data={property.highlights} />}
      {property.gallery?.tabs?.length > 0 && <PropertyGallery data={property.gallery} />}
      {property.amenities?.items?.length > 0 && <PropertyAmenities data={property.amenities} />}
      {property.location?.origin && <PropertyLocation data={property.location} />}
      {property.connectivity && <PropertyConnectivity data={property.connectivity} />}
    </main>
  );
}