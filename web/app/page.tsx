import { HomeFallback } from "@/components/HomeFallback";
import { PremiumServices } from "@/components/PremiumServices";
import { VisualPage } from "@/lib/builder";

export const revalidate = 60;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <VisualPage urlPath="/" searchParams={await searchParams} fallback={<><HomeFallback /><PremiumServices /></>} />;
}
