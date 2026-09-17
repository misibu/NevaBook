import Image from "next/image";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brandWrap} href="/" aria-label="Нева-Бук — главная">
        <Image className={styles.logo} src="/brand/neva-book-header-logo.png" alt="Нева-Бук" width={700} height={233} priority />
        <span className={styles.founded}>Основано в 2003 году</span>
      </Link>
      <div className={styles.right}>
        <a className={styles.phone} href="tel:+79215555555">+7 (921) 555-55-55</a>
        <Link className={styles.contact} href="/kontakty">Контакты</Link>
      </div>
    </header>
  );
}
