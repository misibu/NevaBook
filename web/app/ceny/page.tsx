import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Цены", description: "Цены Neva-Book на фотокниги, печать на холсте, переплёт и реставрацию." };
const rows=[
  ["Фотокнига 20×20","от — ₽","Цена зависит от обложки и числа разворотов"],
  ["Печать на холсте","индивидуально","По размеру, подрамнику и обработке"],
  ["Переплётные работы","индивидуально","По формату, материалу и объёму"],
  ["Реставрация","после оценки","Стоимость после осмотра оригинала"],
];
export default function Page(){return <main className="luxPage"><section className="luxHero compact"><span>NEVA-BOOK / ЦЕНЫ</span><h1>Понятная стоимость<br/><em>до оформления.</em></h1><p>Финальные цены подключим к единому каталогу, чтобы они автоматически совпадали на сайте, в конструкторе и заказе.</p></section><section className="priceTable">{rows.map((r,i)=><article key={r[0]}><span>{String(i+1).padStart(2,"0")}</span><h2>{r[0]}</h2><strong>{r[1]}</strong><p>{r[2]}</p></article>)}</section><div className="luxAction"><Link href="/create">Рассчитать фотокнигу в конструкторе →</Link></div></main>}
