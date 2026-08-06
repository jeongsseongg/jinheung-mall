import Link from "next/link";
import { ProductGrid } from "./components/ProductGrid";

export const metadata = {
  title: "진흥몰 | 진흥조화 직영 조화 주문몰",
  description: "기존 거래처가 쉽고 빠르게 주문하는 진흥조화 직영 온라인몰",
};

export default function Home() {
  return (
    <main className="store-main home-redesign">
      <section className="catalog-hero-v2">
        <img src="/home-hero.png" alt="피오니, 수국, 튤립과 그린 소재로 구성한 진흥몰 조화 상품" />
        <div className="hero-copy-v2">
          <p className="eyebrow">진흥조화 직영</p>
          <h1>찾던 조화,<br />바로 주문.</h1>
          <p>현장에서 자주 쓰는 상품부터 신상품까지 한곳에서 빠르게 찾아보세요.</p>
          <div className="hero-actions-v2">
            <Link href="/products" className="primary-button">전체 상품</Link>
            <Link href="/login" className="hero-text-link">로그인</Link>
          </div>
        </div>
      </section>

      <section className="price-access-strip">
        <span aria-hidden="true">₩</span>
        <div>
          <strong>가격은 로그인 후 확인할 수 있습니다.</strong>
          <p>기존 거래처 계정으로 로그인하면 등록된 가격과 최근 주문이 표시됩니다.</p>
        </div>
        <Link href="/login">가격 확인</Link>
      </section>

      <ProductGrid />
    </main>
  );
}
