import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Контакты", description: "Контакты мастерской Нева-Бук." };

type Search = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const mode = one(params.mode);
  const size = one(params.size);
  const cover = one(params.cover);
  const spreads = one(params.spreads);
  const total = one(params.total);

  return (
    <main className="luxPage">
      <section className="luxHero compact">
        <span>НЕВА-БУК · КОНТАКТЫ</span>
        <h1>{mode === "designer" ? "Работа с дизайнером" : "Контакты"}</h1>
        <p>{mode === "designer" ? "Заполните контактные данные — параметры рассчитанной фотокниги уже переданы в форму." : "Телефон пока временный — заменим его на рабочий номер перед публикацией сайта."}</p>
      </section>
      <ContactForm mode={mode} size={size} cover={cover} spreads={spreads} total={total} />
    </main>
  );
}
