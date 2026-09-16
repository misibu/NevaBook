import Link from "next/link";

const features = [
  ["01", "Загрузите фотографии", "С компьютера или телефона. Позже добавим быструю загрузку по QR-коду."],
  ["02", "Выберите способ сборки", "Автораскладка, готовый шаблон или полностью ручное размещение."],
  ["03", "Проверьте книгу", "Мы покажем развороты и предупредим о проблемах качества до оформления."],
  ["04", "Оформите заказ", "Проект фиксируется, а производственные файлы создаются на сервере."],
];

export function HomeFallback() {
  return (
    <main>
      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">ФОТОКНИГИ NEVA-BOOK</p>
          <h1>Ваши фотографии.<br />Ваша книга.</h1>
          <p className="heroText">
            Соберите фотокнигу 20×20 прямо в браузере. Neva-Book поможет разложить фотографии,
            а вы сможете изменить каждый разворот вручную.
          </p>
          <div className="heroActions">
            <Link className="primaryButton" href="/create">Создать фотокнигу</Link>
            <Link className="textButton" href="/fotoknigi">Посмотреть варианты →</Link>
          </div>
        </div>
        <div className="bookMock" aria-label="Пример разворота фотокниги">
          <div className="bookPage"><span>Ваше фото</span></div>
          <div className="bookPage bookPageRight"><span>Ваше фото</span></div>
        </div>
      </section>

      <section className="section introSection">
        <p className="eyebrow">ПРОСТОЙ ПРОЦЕСС</p>
        <h2>От фотографий до готового макета — в одном месте</h2>
        <div className="featureGrid">
          {features.map(([number, title, text]) => (
            <article className="featureCard" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section productSection">
        <div>
          <p className="eyebrow">ПЕРВЫЙ ФОРМАТ</p>
          <h2>Фотокнига 20×20</h2>
          <p>Твёрдая фотообложка или тканевая обложка. Внутренний печатный разворот — 406×206 мм с учётом подрезки.</p>
          <Link className="primaryButton" href="/fotoknigi">Подробнее о книге</Link>
        </div>
        <div className="formatCard"><strong>20 × 20</strong><span>см</span><small>квадратный формат</small></div>
      </section>
    </main>
  );
}
