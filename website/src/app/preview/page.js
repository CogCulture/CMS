import Home from "../page";

export const dynamic = "force-dynamic";

export default async function PreviewPage({ searchParams }) {
  const sParams = await searchParams;
  return <Home searchParams={Promise.resolve({ ...sParams, preview: "true" })} />;
}

