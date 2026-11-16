"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { calculateDemoPrice, demoPricing, type CoverType } from "@/lib/pricing";

const rub = (amount: number) => new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", maximumFractionDigits: 0,
}).format(amount);

export function PhotoBookCalculator() {
  const [spreads, setSpreads] = useState<number>(10);
  const [cover, setCover] = useState<CoverType>("photo");
  const [quantity, setQuantity] = useState<number>(1);
  const price = useMemo(() => calculateDemoPrice(spreads, cover, quantity), [spreads, cover, quantity]);

  return (
    <main className="nbCalcPage">
      <div className="nbCalcIntro">
        <span className="nbCalcEyebrow">NEVA-BOOK / КАЛЬКУЛЯТОР</span>
        <h1>Сколько стоит<br /><em>ваша фотокнига?</em></h1>
        <p>Выберите обложку, количество разворотов и тираж. Стоимость пересчитывается сразу.</p>
        <div className="nbCalcWarning" role="note">
          <strong>Демонстрационная версия.</strong> Все цены условные и используются только для тестирования.
          Это не коммерческое предложение и не утверждённый прайс Neva-Book.
        </div>
      </div>

      <div className="nbCalcLayout">
        <section className="nbCalcSettings" aria-label="Параметры фотокниги">
          <div className="nbCalcField">
            <span className="nbCalcStep">01 / ФОРМАТ</span>
            <h2>Фотокнига 20×20 см</h2>
            <p>Пока доступен один формат. Остальные появятся после согласования производственных шаблонов.</p>
            <div className="nbCalcChip">20 × 20 см · квадратная</div>
          </div>
          <div className="nbCalcField">
            <span className="nbCalcStep">02 / ОБЛОЖКА</span>
            <h2>Тип обложки</h2>
            <div className="nbCalcCovers">
              <button type="button" className={cover === "photo" ? "selected" : ""} aria-pressed={cover === "photo"} onClick={() => setCover("photo")}>
                <span className="nbCalcCoverSymbol nbCalcPhotoCover">ФОТО</span>
                <strong>Фотообложка</strong><small>Входит в базовую цену</small>
              </button>
              <button type="button" className={cover === "fabric" ? "selected" : ""} aria-pressed={cover === "fabric"} onClick={() => setCover("fabric")}>
                <span className="nbCalcCoverSymbol nbCalcFabricCover">N</span>
                <strong>Тканевая</strong><small>+ {rub(demoPricing.fabricCoverSurcharge)}</small>
              </button>
            </div>
          </div>
          <div className="nbCalcField">
            <span className="nbCalcStep">03 / НАПОЛНЕНИЕ</span>
            <div className="nbCalcHeadingRow"><h2>Количество разворотов</h2><output htmlFor="nbCalcSpreads">{spreads}</output></div>
            <input id="nbCalcSpreads" aria-label="Количество разворотов" type="range" min={demoPricing.minSpreads} max={demoPricing.maxSpreads} step="1" value={spreads} onChange={(e) => setSpreads(Number(e.target.value))} />
            <div className="nbCalcRangeLegend"><span>{demoPricing.minSpreads} разворотов</span><span>{demoPricing.maxSpreads} разворотов</span></div>
            <p>Первые {demoPricing.includedSpreads} разворотов входят в базовую стоимость.</p>
          </div>
          <div className="nbCalcField">
            <span className="nbCalcStep">04 / ТИРАЖ</span>
            <div className="nbCalcHeadingRow"><h2>Количество экземпляров</h2><output htmlFor="nbCalcQuantity">{quantity}</output></div>
            <input id="nbCalcQuantity" aria-label="Количество экземпляров" type="range" min="1" max="25" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            <div className="nbCalcRangeLegend"><span>1 экземпляр</span><span>25 экземпляров</span></div>
            <p>В демо для тиражей от 3 экземпляров применяется тестовая скидка.</p>
          </div>
        </section>

        <aside className="nbCalcResult" aria-live="polite">
          <span className="nbCalcEyebrow">РАСЧЁТ СТОИМОСТИ · ДЕМО</span>
          <div className="nbCalcBook"><span>NEVA<br />BOOK</span><small>20 × 20</small></div>
          <h2>Ваша фотокнига</h2>
          <div className="nbCalcRows">
            <div><span>Формат</span><strong>20×20 см</strong></div>
            <div><span>Обложка</span><strong>{cover === "photo" ? "Фото" : "Ткань"}</strong></div>
            <div><span>Развороты</span><strong>{price.safeSpreads}</strong></div>
            <div><span>Базовая цена</span><strong>{rub(demoPricing.basePrice)}</strong></div>
            <div><span>Дополнительные развороты</span><strong>{rub(price.extraSpreads * demoPricing.additionalSpreadPrice)}</strong></div>
            <div><span>Обложка</span><strong>{rub(price.coverPrice)}</strong></div>
            <div><span>Скидка за тираж</span><strong>{price.discountPercent}%</strong></div>
            <div><span>Цена за экземпляр</span><strong>{rub(price.unitPrice)}</strong></div>
            <div><span>Экземпляры</span><strong>{price.safeQuantity}</strong></div>
          </div>
          <div className="nbCalcTotal"><span>Ориентировочная сумма</span><strong>{rub(price.totalPrice)}</strong></div>
          <p className="nbCalcFineprint">Условные цены. Доставка, налоги и дополнительные услуги в расчёт не включены. Заказ по демо-цене оформить нельзя.</p>
          <Link className="nbCalcAction" href="/create">Перейти в конструктор <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </main>
  );
}
