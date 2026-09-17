import type { Metadata } from "next";

export const metadata: Metadata = { title: "Подарочные наборы", description: "Подарочные наборы Нева-Бук из фотопродукции и полиграфии." };

export default function GiftSetsPage() {
  return <main className="luxPage"><section className="luxHero compact"><span>НЕВА-БУК · ПОДАРКИ</span><h1>Подарочные наборы</h1><p>Комплекты из фотопродукции, печати и полиграфии в подарочной упаковке. Составы наборов и цены добавим после согласования каталога.</p></section></main>;
}
