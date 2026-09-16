import { Content, fetchOneEntry, isPreviewing } from "@builder.io/sdk-react-nextjs";
import type { ReactNode } from "react";

const apiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "";
const model = "page";

function toUrlSearchParams(input: Record<string, string | string[] | undefined>) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) value.forEach((item) => result.append(key, item));
    else if (value !== undefined) result.set(key, value);
  }
  return result;
}

export async function VisualPage({
  urlPath,
  searchParams,
  fallback,
}: {
  urlPath: string;
  searchParams?: Record<string, string | string[] | undefined>;
  fallback: ReactNode;
}) {
  if (!apiKey) return fallback;

  const content = await fetchOneEntry({ model, apiKey, userAttributes: { urlPath } });
  if (!content && !isPreviewing(toUrlSearchParams(searchParams || {}))) return fallback;

  return <Content content={content} model={model} apiKey={apiKey} />;
}
