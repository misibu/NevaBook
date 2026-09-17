import type { Metadata } from "next";
import { PhotoBookCalculator } from "./PhotoBookCalculator";

export const metadata: Metadata = {
  title: "Фотокниги — калькулятор стоимости",
  description: "Фотокниги Нева-Бук 20×20 и 30×30: фотообложка или тканевая обложка, от 5 до 15 разворотов, онлайн-калькулятор и конструктор.",
};

export default function PhotoBooksPage() {
  return <PhotoBookCalculator />;
}
