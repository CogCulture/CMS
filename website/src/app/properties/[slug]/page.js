import { notFound } from "next/navigation";
import { getPropertyBySlug } from "@/services/propertyService";
import PropertyHero from "@/components/property/PropertyHero";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};
  return {
    title: property.seo?.title ?? property.name,
    description: property.seo?.description,
  };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  return (
   <div className="pt-[70px]">
      <main
      data-testid="property-detail-page"
      className="relative flex min-h-screen w-full flex-col items-center gap-0 py-12 pt-0"
    >
      <PropertyHero images={property.heroImages} name={property.name} />

      {/* Agle sections yahan judenge:
      <PropertyOverview property={property} />
      <PropertyFeatureBlocks blocks={property.featureBlocks} />
      <PropertyDescription property={property} />
      <PropertyGallery gallery={property.gallery} />
      <PropertyAmenities amenities={property.amenities} />
      <PropertyMap ... />
      <PropertyCommunity ... />
      <PropertyStickyFooter ... /> */}
    </main>
    </div>
  );
}