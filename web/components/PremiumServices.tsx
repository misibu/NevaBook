import Link from "next/link";

const services = [
  { href: "/fotoknigi", num: "01", title: "Фотокниги", text: "Онлайн-конструктор, фотообложки и тканевые материалы.", cls: "books" },
  { href: "/holst", num: "02", title: "Печать на холсте", text: "Фотографии для интерьера с подготовкой и натяжкой.", cls: "canvas" },
  { href: "/pereplet", num: "03", title: "Переплёт", text: "Ручные переплётные работы и индивидуальные обложки.", cls: "binding" },
  { href: "/restavraciya", num: "04", title: "Реставрация", text: "Восстановление старых и повреждённых фотографий.", cls: "restore" },
];

export function PremiumServices() {
  return (
    <section className="premiumServices">
      <div className="premiumServicesHead">
        <span>МАСТЕРСКАЯ NEVA-BOOK</span>
        <h2>Не только фотокниги.<br/><em>Сохраняем историю в разных формах.</em></h2>
        <p>Печать, переплёт и реставрация объединены в одной мастерской. У каждой услуги будет собственная SEO-страница и понятный путь заказа.</p>
      </div>
      <div className="premiumServiceGrid">
        {services.map(s => <Link className={`premiumServiceCard ${s.cls}`} href={s.href} key={s.href}>
          <div className="serviceArt"><i/><b>{s.num}</b></div>
          <div className="serviceCardCopy"><span>{s.num}</span><h3>{s.title}</h3><p>{s.text}</p><strong>Подробнее →</strong></div>
        </Link>)}
      </div>
    </section>
  );
}
