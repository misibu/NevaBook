import type { Metadata } from "next";
import { CoverCatalog } from "./CoverCatalog";

export const metadata: Metadata = {
  title: "Выбрать обложку",
  robots: { index: false, follow: false },
};

export default function CoverPage() {
  return <CoverCatalog />;
}
