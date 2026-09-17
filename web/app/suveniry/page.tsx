import type { Metadata } from "next";

export const metadata: Metadata = { title: "Сувениры", description: "Персональные сувениры и памятные изделия Нева-Бук." };

export default function SouvenirsPage() {
  return <main className="luxPage"><section className="luxHero compact"><span>НЕВА-БУК · СУВЕНИРЫ</span><h1>Сувениры</h1><p>Персональные памятные изделия с фотографиями, надписями и фирменным оформлением. Каталог и варианты продукции добавим на следующем этапе.</p></section></main>;
}
