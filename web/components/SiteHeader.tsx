import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brandWrap} href="/" aria-label="Нева-Бук — главная">
        <span className={styles.logoBox} aria-hidden="true">
          <img
            className={styles.logoFallback}
            src="/brand/neva-book-logo.svg?v=20260917c"
            alt=""
            loading="eager"
          />
          <img
            className={styles.logoExact}
            src="/brand/neva-book-header-logo.png?v=20260917c"
            alt=""
            width="700"
            height="233"
            loading="eager"
          />
        </span>
        <span className={styles.founded}>Основано в 2003 году</span>
      </Link>
      <div className={styles.right}>
        <a className={styles.phone} href="tel:+79215555555">+7 (921) 555-55-55</a>
        <Link className={styles.contact} href="/kontakty">Контакты</Link>
      </div>
    </header>
  );
}
