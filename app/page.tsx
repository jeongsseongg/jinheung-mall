import Link from "next/link";
import { ProductGrid } from "./components/ProductGrid";

export const metadata = {
  title: "진흥몰 | 진흥조화 직영 조화 주문몰",
  description: "사업자와 일반 고객이 쉽고 빠르게 주문하는 진흥조화 직영 온라인몰",
};

export default function Home() {
  return (
    <main className="store-main">
      <section className="home-intro">
        <div className="intro-copy">
          <p className="eyebrow">진흥조화 직영 온라인몰</p>
          <h1>필요한 조화를<br />쉽고 빠르게 주문하세요.</h1>
          <p>상품 확인부터 반복 주문까지, 매달 주문하는 업체의 시간을 줄였습니다.</p>
        </div>
        <div className="intro-actions">
          <Link href="/products" className="primary-button">상세검색</Link>
          <Link href="/favorites" className="secondary-button">자주 주문한 상품</Link>
        </div>
        <dl className="intro-stats">
          <div><dt>직영 상품</dt><dd>320+</dd></div>
          <div><dt>평일 출고</dt><dd>오후 2시</dd></div>
          <div><dt>사업자 승인</dt><dd>관리자 확인</dd></div>
        </dl>
      </section>

      <section className="business-callout">
        <div className="callout-icon">B</div>
        <div>
          <strong>사업자 회원은 도매 전용 가격이 적용됩니다.</strong>
          <p>사업자등록증을 접수하면 관리자가 확인 후 회원 등급을 변경합니다.</p>
        </div>
        <Link href="/business-verification">인증 접수</Link>
      </section>

      <ProductGrid />
    </main>
  );
}
