import { notFound } from "next/navigation";
import { Content, fetchOneEntry, isPreviewing } from "@builder.io/sdk-react-nextjs";

const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";
export const revalidate = 60;

export default async function CmsPage({
  params,
  searchParams,
}: {
  params: Promise<{ page?: string[] }>;
  searchParams: Promise<Record<string, string>>;
}) {
  if (!apiKey) notFound();
  const { page } = await params;
  const search = await searchParams;
  const urlPath = `/${page?.join("/") || ""}`;
  const content = await fetchOneEntry({ model: "page", apiKey, userAttributes: { urlPath } });
  if (!content && !isPreviewing(new URLSearchParams(search))) notFound();
  return <Content content={content} model="page" apiKey={apiKey} />;
}
