"use client";

import { useMemo, useState } from "react";
import styles from "./photobooks.module.css";

type BookSize = "20x20" | "30x30";
type CoverType = "photo" | "fabric";

const BASE_PRICE = 2500;
const FABRIC_EXTRA = 700;
const SIZE_30_EXTRA = 1500;
const EXTRA_SPREAD = 150;
const DESIGNER_EXTRA = 4000;

const gallery = [
  { title: "Свадебная фотокнига", caption: "История одного дня", tone: styles.galleryWedding },
  { title: "Семейная фотокнига", caption: "Домашние истории", tone: styles.galleryFamily },
  { title: "Детская фотокнига", caption: "Первые годы", tone: styles.galleryKids },
  { title: "Путешествия", caption: "Маршруты и впечатления", tone: styles.galleryTravel },
];

const money = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

export function PhotoBookCalculator() {
  const [size, setSize] = useState<BookSize>("20x20");
  const [cover, setCover] = useState<CoverType>("photo");
  const [spreads, setSpreads] = useState(5);

  const price = useMemo(() => {
    return BASE_PRICE
      + (size === "30x30" ? SIZE_30_EXTRA : 0)
      + (cover === "fabric" ? FABRIC_EXTRA : 0)
      + Math.max(0, spreads - 5) * EXTRA_SPREAD;
  }, [size, cover, spreads]);

  const designerPrice = price + DESIGNER_EXTRA;

  function saveSelection(mode: "constructor" | "designer") {
    const data = { size, cover, spreads, price: mode === "designer" ? designerPrice : price, mode };
    try { localStorage.setItem("nevabook-photobook-order", JSON.stringify(data)); } catch {}

    const params = new URLSearchParams({
      size,
      cover,
      spreads: String(spreads),
      total: String(data.price),
      mode,
    });

    window.location.href = mode === "designer" ? `/kontakty?${params}` : `/create?${params}`;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span>ФОТОКНИГИ · НЕВА-БУК</span>
        <div>
          <h1>Фотокнига,<br/>которую хочется хранить.</h1>
          <p>Выберите формат, тип обложки и количество разворотов. Стоимость рассчитывается сразу, без скрытых доплат.</p>
        </div>
      </section>

      <section className={styles.gallerySection}>
        <div className={styles.sectionHeading}>
          <div><span>ПРИМЕРЫ РАБОТ</span><h2>Галерея фотокниг</h2></div>
          <p>Пока здесь демонстрационная подборка. Позже заменим её вашими реальными работами без изменения структуры страницы.</p>
        </div>
        <div className={styles.galleryGrid}>
          {gallery.map((item, index) => (
            <article className={`${styles.galleryCard} ${item.tone}`} key={item.title}>
              <div className={styles.galleryBook}>
                <img src="/home-products/photobooks.svg" alt="" />
              </div>
              <span>0{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.caption}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.calculatorSection} id="calculator">
        <div className={styles.sectionHeading}>
          <div><span>КАЛЬКУЛЯТОР</span><h2>Рассчитайте фотокнигу</h2></div>
          <p>Базовая стоимость — {money(BASE_PRICE)} за формат 20×20, фотообложку и 5 разворотов.</p>
        </div>

        <div className={styles.calculatorGrid}>
          <div className={styles.options}>
            <div className={styles.optionGroup}>
              <div className={styles.optionTitle}><span>01</span><div><strong>Размер книги</strong><small>Выберите готовый формат</small></div></div>
              <div className={styles.choiceGrid}>
                <button className={size === "20x20" ? styles.activeChoice : ""} onClick={() => setSize("20x20")}>
                  <b>20 × 20 см</b><small>Базовый формат</small><em>+ 0 ₽</em>
                </button>
                <button className={size === "30x30" ? styles.activeChoice : ""} onClick={() => setSize("30x30")}>
                  <b>30 × 30 см</b><small>Большая фотокнига</small><em>+ {money(SIZE_30_EXTRA)}</em>
                </button>
              </div>
            </div>

            <div className={styles.optionGroup}>
              <div className={styles.optionTitle}><span>02</span><div><strong>Обложка</strong><small>При выборе меняется превью справа</small></div></div>
              <div className={styles.choiceGrid}>
                <button className={cover === "photo" ? styles.activeChoice : ""} onClick={() => setCover("photo")}>
                  <b>Фотообложка</b><small>Индивидуальное изображение</small><em>+ 0 ₽</em>
                </button>
                <button className={cover === "fabric" ? styles.activeChoice : ""} onClick={() => setCover("fabric")}>
                  <b>Тканевая обложка</b><small>Премиальная ткань</small><em>+ {money(FABRIC_EXTRA)}</em>
                </button>
              </div>
            </div>

            <div className={styles.optionGroup}>
              <div className={styles.optionTitle}><span>03</span><div><strong>Количество разворотов</strong><small>От 5 до 15 разворотов</small></div></div>
              <div className={styles.spreadControl}>
                <button onClick={() => setSpreads(v => Math.max(5, v - 1))} disabled={spreads <= 5}>−</button>
                <div><strong>{spreads}</strong><span>разворотов</span></div>
                <button onClick={() => setSpreads(v => Math.min(15, v + 1))} disabled={spreads >= 15}>+</button>
              </div>
              <input className={styles.range} type="range" min="5" max="15" step="1" value={spreads} onChange={e => setSpreads(Number(e.target.value))} />
              <div className={styles.rangeLabels}><span>5</span><span>10</span><span>15</span></div>
              <p className={styles.extraNote}>Каждый дополнительный разворот после пятого: + {money(EXTRA_SPREAD)}</p>
            </div>
          </div>

          <aside className={styles.summary}>
            <span className={styles.summaryKicker}>ВАШ ВАРИАНТ</span>
            <div className={`${styles.coverPreview} ${cover === "fabric" ? styles.fabricPreview : styles.photoPreview}`}>
              {cover === "photo" ? <img src="/home-products/photobooks.svg" alt="Фотообложка" /> : <div className={styles.fabricTexture}><span>НЕВА-БУК</span></div>}
              <b>{cover === "photo" ? "Фотообложка" : "Тканевая обложка"}</b>
              <small>{size === "20x20" ? "20 × 20 см" : "30 × 30 см"}</small>
            </div>

            <dl className={styles.breakdown}>
              <div><dt>База · 5 разворотов</dt><dd>{money(BASE_PRICE)}</dd></div>
              <div><dt>Формат {size === "20x20" ? "20 × 20" : "30 × 30"}</dt><dd>{size === "30x30" ? `+ ${money(SIZE_30_EXTRA)}` : "+ 0 ₽"}</dd></div>
              <div><dt>{cover === "photo" ? "Фотообложка" : "Тканевая обложка"}</dt><dd>{cover === "fabric" ? `+ ${money(FABRIC_EXTRA)}` : "+ 0 ₽"}</dd></div>
              <div><dt>Доп. развороты · {Math.max(0, spreads - 5)} шт.</dt><dd>+ {money(Math.max(0, spreads - 5) * EXTRA_SPREAD)}</dd></div>
            </dl>

            <div className={styles.total}><span>Итого</span><strong>{money(price)}</strong></div>
            <div className={styles.actions}>
              <button className={styles.primaryAction} onClick={() => saveSelection("constructor")}>Конструктор <span>→</span></button>
              <button className={styles.secondaryAction} onClick={() => saveSelection("designer")}>
                <span>Работа с дизайнером</span><b>{money(designerPrice)}</b>
              </button>
              <small>Работа дизайнера добавляет {money(DESIGNER_EXTRA)} к рассчитанной стоимости и переводит на форму контактов.</small>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
