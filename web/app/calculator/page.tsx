import type { Metadata } from "next";
import { PhotoBookCalculator } from "./PhotoBookCalculator";
import "./calculator.css";

export const metadata: Metadata = {
  title: "Калькулятор стоимости фотокниги (демо)",
  description: "Тестовый калькулятор Neva-Book: рассчитайте примерную стоимость фотокниги формата 20×20 см.",
  robots: { index: false, follow: false },
};

export default function CalculatorPage() {
  return <PhotoBookCalculator />;
}
