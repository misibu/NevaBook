import type { Metadata } from "next";

export const metadata: Metadata = { title: "Контакты", description: "Контакты мастерской Нева-Бук." };

export default function ContactsPage() {
  return (
    <main className="luxPage">
      <section className="luxHero compact">
        <span>НЕВА-БУК · КОНТАКТЫ</span>
        <h1>Контакты</h1>
        <p>Телефон пока временный — заменим его на рабочий номер перед публикацией сайта.</p>
      </section>
      <section className="serviceFacts">
        <div><strong>ТЕЛЕФОН</strong><h2>+7 (921) 555-55-55</h2><p>Временный номер для макета.</p></div>
        <div><strong>ГОД ОСНОВАНИЯ</strong><h2>2003</h2><p>Нева-Бук — печать, фотокниги, переплёт и реставрация.</p></div>
        <div><strong>СВЯЗЬ</strong><h2>Заказы и консультации</h2><p>Адрес, почту и мессенджеры добавим после согласования.</p></div>
      </section>
    </main>
  );
}
