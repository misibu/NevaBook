import Image from "next/image";
import Link from "next/link";
import styles from "./HomeProductGrid.module.css";

const products = [
  { href: "/fotoknigi", title: "Изготовление фотокниг", text: "Фотокниги 20×20, индивидуальный дизайн и онлайн-конструктор.", image: "/home-products/photobooks.svg", no: "01" },
  { href: "/holst", title: "Печать на холсте", text: "Фотографии и изображения на холсте для дома и в подарок.", image: "/home-products/canvas.svg", no: "02" },
  { href: "/pereplet", title: "Переплёт книг", text: "Ручной и малотиражный переплёт, восстановление и оформление изданий.", image: "/home-products/binding.svg", no: "03" },
  { href: "/restavraciya", title: "Реставрация книг", text: "Бережное восстановление старых книг, блоков, корешков и обложек.", image: "/home-products/restoration.svg", no: "04" },
  { href: "/suveniry", title: "Сувениры", text: "Персональные памятные изделия с фотографиями и фирменным оформлением.", image: "/home-products/souvenirs.svg", no: "05" },
  { href: "/podarochnye-nabory", title: "Подарочные наборы", text: "Комплекты из фотопродукции и полиграфии в подарочной упаковке.", image: "/home-products/gifts.svg", no: "06" },
];

export function HomeProductGrid() {
  return (
    <main className={styles.home}>
      <section className={styles.intro}>
        <div>
          <span>НЕВА-БУК · САНКТ-ПЕТЕРБУРГ</span>
          <h1>Сохраняем важное<br/>в материале.</h1>
        </div>
        <p>Фотокниги, печать, переплёт и реставрация. Работаем с фотографией и книгой как с вещью, которая должна прожить долго.</p>
      </section>

      <section className={styles.grid} aria-label="Основная продукция Нева-Бук">
        {products.map(product => (
          <Link className={styles.card} href={product.href} key={product.href}>
            <Image src={product.image} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" />
            <span className={styles.shade} />
            <span className={styles.number}>{product.no}</span>
            <div className={styles.copy}>
              <h2>{product.title}</h2>
              <p>{product.text}</p>
              <b>Подробнее <i>→</i></b>
            </div>
          </Link>
        ))}
      </section>

      <section className={styles.bottomLine}>
        <span>ФОТОГРАФИЯ</span><i/><span>КНИГА</span><i/><span>ПЕЧАТЬ</span><i/><span>РЕСТАВРАЦИЯ</span>
      </section>
    </main>
  );
}
