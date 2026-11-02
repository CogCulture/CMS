import { properties } from "@/data/properties";

export async function getPropertyBySlug(slug) {
  // ABHI: mock data
  return properties.find((p) => p.slug === slug) ?? null;

  // BACKEND READY HONE PAR sirf ye badlo:
  // const res = await fetch(`${process.env.API_URL}/properties/${slug}`, {
  //   next: { revalidate: 60 },
  // });
  // if (!res.ok) return null;
  // return res.json();
}