"use client";

import { FormEvent, useState } from "react";
import styles from "./contacts.module.css";

type Props = {
  mode?: string;
  size?: string;
  cover?: string;
  spreads?: string;
  total?: string;
};

const money = (value: string | undefined) => {
  const n = Number(value || 0);
  return n ? `${new Intl.NumberFormat("ru-RU").format(n)} ₽` : "—";
};

export function ContactForm({ mode, size, cover, spreads, total }: Props) {
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email"),
      comment: form.get("comment"),
      mode,
      size,
      cover,
      spreads,
      total,
      createdAt: new Date().toISOString(),
    };
    try { localStorage.setItem("nevabook-designer-request", JSON.stringify(payload)); } catch {}
    setSaved(true);
  }

  const isDesigner = mode === "designer";

  return (
    <section className={styles.wrap}>
      <div className={styles.intro}>
        <span>{isDesigner ? "РАБОТА С ДИЗАЙНЕРОМ" : "ОБРАТНАЯ СВЯЗЬ"}</span>
        <h2>{isDesigner ? "Оставьте контакты" : "Свяжитесь с нами"}</h2>
        <p>{isDesigner ? "Мы сохраним параметры выбранной фотокниги вместе с контактами, чтобы дизайнер видел исходную конфигурацию заказа." : "Оставьте имя и телефон — позже подключим эту форму к CRM и уведомлениям."}</p>

        {isDesigner && (
          <div className={styles.orderSummary}>
            <div><span>Формат</span><strong>{size === "30x30" ? "30 × 30 см" : "20 × 20 см"}</strong></div>
            <div><span>Обложка</span><strong>{cover === "fabric" ? "Тканевая" : "Фотообложка"}</strong></div>
            <div><span>Развороты</span><strong>{spreads || "5"}</strong></div>
            <div><span>Итого с дизайнером</span><strong>{money(total)}</strong></div>
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={submit}>
        <label><span>Имя</span><input name="name" required placeholder="Как к вам обращаться" /></label>
        <label><span>Телефон</span><input name="phone" required inputMode="tel" placeholder="+7 ___ ___-__-__" /></label>
        <label><span>E-mail</span><input name="email" type="email" placeholder="mail@example.ru" /></label>
        <label><span>Комментарий</span><textarea name="comment" rows={5} placeholder="Пожелания к фотокниге или удобное время для связи" /></label>
        <button type="submit">Отправить заявку</button>
        {saved && <p className={styles.saved}>Заявка сохранена. На следующем этапе подключим её отправку в CRM и Telegram.</p>}
      </form>
    </section>
  );
}
