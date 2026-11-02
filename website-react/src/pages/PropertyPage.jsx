import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyBySlug } from "@/services/propertyService";
import PropertyHero from "@/components/property/PropertyHero";
import NotFoundPage from "@/pages/NotFoundPage";

export default function PropertyPage() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPropertyBySlug(slug).then((prop) => {
      if (isMounted) {
        setProperty(prop);
        setLoading(false);
        if (prop?.seo?.title || prop?.name) {
          document.title = `${prop.seo?.title ?? prop.name} | Emaar India`;
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-[70px] min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-400 text-sm tracking-widest uppercase">Loading Property...</div>
      </div>
    );
  }

  if (!property) {
    return <NotFoundPage message={`Property "${slug}" was not found.`} />;
  }

  return (
    <div className="pt-[70px]">
      <main
        data-testid="property-detail-page"
        className="relative flex min-h-screen w-full flex-col items-center gap-0 py-12 pt-0"
      >
        <PropertyHero images={property.heroImages} name={property.name} />
      </main>
    </div>
  );
}
