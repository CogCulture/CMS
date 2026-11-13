import CustomPage, { generateMetadata } from "../page";

export const dynamic = "force-dynamic";
export { generateMetadata };

export default async function SlugEditorPage({ params, searchParams }) {
  const p = await params;
  const sParams = await searchParams;
  return (
    <CustomPage
      params={Promise.resolve(p)}
      searchParams={Promise.resolve({ ...sParams, preview: "true", editor: "true" })}
    />
  );
}

