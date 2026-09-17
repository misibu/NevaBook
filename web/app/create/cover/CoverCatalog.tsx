"use client";

import { useMemo, useState } from "react";

const categories = ["Все", "Свадебное", "Детское", "День рождения", "Семейное", "Путешествия", "Минимализм"] as const;
type Category = typeof categories[number];

type Cover = {
  id: string;
  category: Exclude<Category, "Все">;
  title: string;
  subtitle: string;
  className: string;
};

const covers: Cover[] = [
  { id: "wed-pearl", category: "Свадебное", title: "Нежность", subtitle: "Светлая свадебная серия", className: "cover-wedding-1" },
  { id: "wed-evening", category: "Свадебное", title: "Вечер", subtitle: "Глубокие тёплые оттенки", className: "cover-wedding-2" },
  { id: "child-sky", category: "Детское", title: "Первый год", subtitle: "Мягкая детская палитра", className: "cover-child-1" },
  { id: "child-story", category: "Детское", title: "Наша история", subtitle: "Спокойная семейная серия", className: "cover-child-2" },
  { id: "birthday-party", category: "День рождения", title: "Праздник", subtitle: "Яркая праздничная обложка", className: "cover-birthday-1" },
  { id: "birthday-night", category: "День рождения", title: "Birthday", subtitle: "Современная контрастная серия", className: "cover-birthday-2" },
  { id: "family-home", category: "Семейное", title: "Вместе", subtitle: "Тёплая семейная классика", className: "cover-family-1" },
  { id: "family-light", category: "Семейное", title: "Семья", subtitle: "Светлый спокойный дизайн", className: "cover-family-2" },
  { id: "travel-sun", category: "Путешествия", title: "Путешествие", subtitle: "Море, солнце и дороги", className: "cover-travel-1" },
  { id: "travel-north", category: "Путешествия", title: "Маршрут", subtitle: "Холодная дорожная серия", className: "cover-travel-2" },
  { id: "minimal-navy", category: "Минимализм", title: "Archive", subtitle: "Глубокий синий и типографика", className: "cover-minimal-1" },
  { id: "minimal-linen", category: "Минимализм", title: "Memory", subtitle: "Спокойный светлый минимализм", className: "cover-minimal-2" },
];

export function CoverCatalog() {
  const [category, setCategory] = useState<Category>("Все");
  const [selected, setSelected] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("nevabook-selected-cover");
  });

  const visible = useMemo(() => category === "Все" ? covers : covers.filter(c => c.category === category), [category]);
  const selectedCover = covers.find(c => c.id === selected);

  function choose(cover: Cover) {
    setSelected(cover.id);
    localStorage.setItem("nevabook-selected-cover", cover.id);
    localStorage.setItem("nevabook-selected-cover-data", JSON.stringify(cover));
  }

  return (
    <main className="coverChooserPage">
      <section className="coverChooserHead">
        <div>
          <span className="eyebrow">ШАГ 2 · ОБЛОЖКА</span>
          <h1>Выберите обложку</h1>
          <p>Выберите группу и дизайн. Позже мы добавим сюда реальные коллекции Нева-Бук с миниатюрами, вариантами ткани и фотопечати.</p>
        </div>
        <a className="coverBackLink" href="/create">← Вернуться в редактор</a>
      </section>

      <nav className="coverCategoryBar" aria-label="Категории обложек">
        {categories.map(item => <button key={item} className={item === category ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
      </nav>

      <section className="coverCatalogGrid">
        {visible.map(cover => <article key={cover.id} className={`coverCatalogCard ${selected === cover.id ? "selected" : ""}`}>
          <div className={`coverPreview ${cover.className}`}><span>{cover.title}</span></div>
          <div className="coverCardMeta">
            <span>{cover.category}</span>
            <h2>{cover.title}</h2>
            <p>{cover.subtitle}</p>
          </div>
          <button className="coverSelectBtn" onClick={() => choose(cover)}>{selected === cover.id ? "✓ Выбрано" : "Выбрать обложку"}</button>
        </article>)}
      </section>

      <div className="coverChooserFooter">
        <div><span>Выбранная обложка</span><br/><strong>{selectedCover ? `${selectedCover.category} · ${selectedCover.title}` : "Пока не выбрана"}</strong></div>
        <button disabled={!selectedCover} onClick={() => { if (selectedCover) window.location.href = "/create/cover"; }}>Сохранить выбор</button>
      </div>
    </main>
  );
}
