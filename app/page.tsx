import Link from "next/link";
import { ProductGrid } from "./components/ProductGrid";
import { CatalogSearch } from "./components/CatalogSearch";

export const metadata = {
  title: "진흥몰 | 진흥조화 직영 조화 주문몰",
  description: "기존 거래처가 쉽고 빠르게 주문하는 진흥조화 직영 온라인몰",
};

export default function Home() {
  return (
    <main className="store-main catalog-home">
      <section className="catalog-promo-banner">
        <img src="/home-hero.png" alt="진흥몰 피오니와 그린 조화 상품" />
        <div className="catalog-promo-copy">
          <span>진흥조화 직영</span>
          <strong>매장에 필요한 조화,<br />한곳에서 빠르게.</strong>
          <p>자주 쓰는 상품부터 새로운 소재까지 바로 주문하세요.</p>
        </div>
        <Link href="/products">전체 상품 보기</Link>
      </section>

      <section className="catalog-title-row">
        <div>
          <h1>오늘 필요한 조화</h1>
        </div>
        <CatalogSearch />
      </section>

      <ProductGrid />
    </main>
  );
}
