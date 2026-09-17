import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brandWrap} href="/" aria-label="Нева-Бук — главная">
        <img
          className={styles.logo}
          src="/brand/neva-book-full-logo.webp?v=20260917d"
          alt="Нева-Бук — фотокниги, реставрация фото, переплёт"
          width="800"
          height="266"
          loading="eager"
        />
        <span className={styles.founded}>Основано в 2003 году</span>
      </Link>
      <div className={styles.right}>
        <a className={styles.phone} href="tel:+79215555555">+7 (921) 555-55-55</a>
        <Link className={styles.contact} href="/kontakty">Контакты</Link>
      </div>
    </header>
  );
}
