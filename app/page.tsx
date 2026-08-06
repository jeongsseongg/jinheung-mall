import { ProductGrid } from "./components/ProductGrid";

export const metadata = {
  title: "진흥몰 | 진흥조화 직영 조화 주문몰",
  description: "기존 거래처가 쉽고 빠르게 주문하는 진흥조화 직영 온라인몰",
};

export default function Home() {
  return (
    <main className="store-main catalog-home">
      <section className="catalog-title-row">
        <div>
          <p className="eyebrow">진흥조화 직영</p>
          <h1>오늘 필요한 조화</h1>
        </div>
        <form action="/products" className="catalog-main-search">
          <label className="sr-only" htmlFor="catalog-search">상품 검색</label>
          <input id="catalog-search" name="q" placeholder="상품명, 품번, 색상 검색" />
          <button type="submit" aria-label="검색">검색</button>
        </form>
      </section>

      <ProductGrid />
    </main>
  );
}
