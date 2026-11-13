import Home from "../page";

export const dynamic = "force-dynamic";

export default async function EditorPage({ searchParams }) {
  const sParams = await searchParams;
  return <Home searchParams={Promise.resolve({ ...sParams, preview: "true", editor: "true" })} />;
}

