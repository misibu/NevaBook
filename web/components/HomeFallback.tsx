import Link from "next/link";

const steps = [
  ["01", "Выберите книгу", "Формат, тип обложки, материал и количество разворотов."],
  ["02", "Добавьте фотографии", "Загрузите снимки с компьютера. Загрузку с телефона по QR добавим следующим этапом."],
  ["03", "Соберите макет", "Используйте автораскладку или настройте каждый разворот самостоятельно."],
  ["04", "Оформите заказ", "Мы сохраняем утверждённую версию и готовим производственные файлы на сервере."],
];

const occasions = [
  ["Путешествия", "Соберите одну историю вместо сотен фотографий в телефоне.", "travel"],
  ["Семья", "Книга, которую действительно хочется пересматривать вместе.", "family"],
  ["Свадьба", "Большие фотографии, спокойная верстка и обложка под стиль события.", "wedding"],
];

export function HomeFallback() {
  return (
    <main className="homePage">
      <section className="homeHero">
        <div className="homeHeroCopy">
          <div className="heroKicker"><span /> Фотокниги, которые остаются</div>
          <h1>Соберите свою историю<br /><em>в настоящую книгу.</em></h1>
          <p>
            Neva-Book помогает превратить фотографии в аккуратно собранную фотокнигу. Выберите обложку,
            загрузите снимки и настройте каждый разворот прямо в браузере.
          </p>
          <div className="homeHeroActions">
            <Link className="homePrimaryButton" href="/create">Создать фотокнигу</Link>
            <Link className="homeSecondaryButton" href="/fotoknigi">Посмотреть форматы <span>↗</span></Link>
          </div>
          <div className="heroNotes">
            <span>20×20 см — первый формат</span>
            <span>Фотообложка или ткань</span>
            <span>Макет сохраняется онлайн</span>
          </div>
        </div>

        <div className="heroStage" aria-label="Визуализация фотокниги Neva-Book">
          <div className="heroHalo" />
          <div className="heroBook heroBookBack">
            <div className="coverTexture coverTextureBlue" />
            <div className="coverLabel">NEVA<br />BOOK</div>
          </div>
          <div className="heroBook heroBookFront">
            <div className="coverTexture coverTextureCream" />
            <div className="coverPhotoMark">
              <small>ABKHAZIA</small>
              <strong>2026</strong>
            </div>
          </div>
          <div className="heroSpread">
            <div className="spreadPaper leftPaper"><div className="mockPhoto mockPhotoA" /><span>01</span></div>
            <div className="spreadPaper rightPaper"><div className="mockPhoto mockPhotoB" /><p>Сохраняйте не файлы —<br />сохраняйте воспоминания.</p></div>
          </div>
          <div className="heroChip heroChipTop">твёрдая обложка</div>
          <div className="heroChip heroChipBottom">печать 300 dpi</div>
        </div>
      </section>

      <section className="homePromiseBar" aria-label="Преимущества Neva-Book">
        <div><strong>Онлайн</strong><span>редактор прямо в браузере</span></div>
        <div><strong>Авто</strong><span>умная первичная раскладка</span></div>
        <div><strong>Ручной режим</strong><span>контроль каждого разворота</span></div>
        <div><strong>Облако</strong><span>проект не потеряется</span></div>
      </section>

      <section className="homeSection productChoiceSection">
        <div className="sectionHeading splitHeading">
          <div>
            <span className="sectionIndex">01 / ВЫБЕРИТЕ ОСНОВУ</span>
            <h2>Книга начинается<br />с обложки.</h2>
          </div>
          <p>В первой версии Neva-Book мы запускаем квадратный формат 20×20 см с двумя основными вариантами оформления.</p>
        </div>

        <div className="coverChoiceGrid">
          <article className="coverChoiceCard photoCoverCard">
            <div className="coverCardVisual">
              <div className="standingBook photoBookSample"><span>ВАШЕ<br />ФОТО</span><small>20 × 20</small></div>
            </div>
            <div className="coverCardBody">
              <div><span className="tinyLabel">01</span><h3>Фотообложка</h3></div>
              <p>Изображение на всю обложку или готовый дизайн. Для путешествий, семейных и событийных книг.</p>
              <Link href="/create">Выбрать фотообложку <span>→</span></Link>
            </div>
          </article>

          <article className="coverChoiceCard fabricCoverCard">
            <div className="coverCardVisual">
              <div className="standingBook fabricBookSample"><span>N</span><small>linen collection</small></div>
              <div className="fabricSwatches"><i /><i /><i /><i /></div>
            </div>
            <div className="coverCardBody">
              <div><span className="tinyLabel">02</span><h3>Тканевая обложка</h3></div>
              <p>Спокойная фактура, выбор цвета и персонализация. Для книг, которые выглядят как предмет интерьера.</p>
              <Link href="/create">Посмотреть ткани <span>→</span></Link>
            </div>
          </article>
        </div>
      </section>

      <section className="homeSection processSection">
        <div className="sectionHeading centeredHeading">
          <span className="sectionIndex">02 / КАК ЭТО РАБОТАЕТ</span>
          <h2>Четыре понятных шага.</h2>
          <p>Без сложных программ, экспорта и подготовки файлов вручную.</p>
        </div>
        <div className="processGrid">
          {steps.map(([number, title, text]) => (
            <article className="processCard" key={number}>
              <span className="processNumber">{number}</span>
              <div className="processIcon"><span /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="editorShowcase">
        <div className="editorShowcaseCopy">
          <span className="sectionIndex lightIndex">03 / СОБЕРИТЕ САМИ</span>
          <h2>Редактор, в котором<br />главное — фотографии.</h2>
          <p>Слева ваши снимки, в центре разворот, снизу вся книга. Neva-Book предлагает раскладку, но последнее слово всегда остаётся за вами.</p>
          <ul>
            <li><span>✓</span> фотографии в удобной вертикальной галерее</li>
            <li><span>✓</span> автоматические варианты размещения</li>
            <li><span>✓</span> ручное кадрирование и перестановка</li>
            <li><span>✓</span> автосохранение проекта</li>
          </ul>
          <Link className="lightButton" href="/create">Открыть конструктор</Link>
        </div>
        <div className="editorWindow" aria-label="Макет интерфейса конструктора Neva-Book">
          <div className="editorWindowBar"><i /><i /><i /><span>NEVA-BOOK / Моя фотокнига</span></div>
          <div className="editorWindowBody">
            <aside className="editorDemoSidebar">
              <strong>Фотографии</strong>
              <div className="demoThumbGrid">
                {Array.from({ length: 8 }).map((_, index) => <i key={index} className={`demoThumb demoThumb${index + 1}`} />)}
              </div>
            </aside>
            <div className="editorDemoCanvas">
              <div className="demoSpread">
                <div className="demoPage"><i className="demoLargePhoto" /></div>
                <div className="demoPage demoTextPage"><small>ПУТЕШЕСТВИЕ</small><strong>Абхазия</strong><span>2026</span></div>
              </div>
              <div className="demoTimeline"><i className="selected" /><i /><i /><i /><i /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="homeSection occasionSection">
        <div className="sectionHeading splitHeading">
          <div><span className="sectionIndex">04 / ИДЕИ</span><h2>Для историй,<br />которые уже есть.</h2></div>
          <p>Не нужно ждать особого повода. Хорошая фотокнига начинается с фотографий, которые вам просто не хочется потерять.</p>
        </div>
        <div className="occasionGrid">
          {occasions.map(([title, text, modifier], index) => (
            <article className={`occasionCard ${modifier}`} key={title}>
              <div className="occasionVisual"><span>{String(index + 1).padStart(2, "0")}</span><div /></div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="homeSection craftSection">
        <div className="craftStatement">
          <span className="sectionIndex">05 / NEVA-BOOK</span>
          <blockquote>«Мы делаем не просто файл с фотографиями. Мы делаем вещь, которая останется на полке на годы.»</blockquote>
        </div>
        <div className="craftDetails">
          <div><strong>300 dpi</strong><span>подготовка печатных файлов</span></div>
          <div><strong>406×206 мм</strong><span>производственный разворот 20×20</span></div>
          <div><strong>466×246 мм</strong><span>формат фотообложки</span></div>
        </div>
      </section>

      <section className="finalCtaSection">
        <div className="finalCtaBook"><div className="finalBookCover">NEVA<br />BOOK</div><div className="finalBookPages" /></div>
        <div className="finalCtaCopy">
          <span className="sectionIndex">ВАША КНИГА МОЖЕТ НАЧАТЬСЯ СЕЙЧАС</span>
          <h2>Выберите фотографии.<br />Остальное соберём вместе.</h2>
          <p>Начните с черновика — проект можно сохранить и продолжить позже.</p>
          <Link className="homePrimaryButton" href="/create">Создать фотокнигу</Link>
        </div>
      </section>
    </main>
  );
}
