"use client";

import Link from "next/link";
import { useStore } from "@/app/components/StoreProvider";
import { formatPrice } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";

export default function MyPage() {
  const { products } = useProducts();
  const { addToCart } = useStore();
  const frequent = products.slice(0, 3);

  return (
    <main className="store-main page-main">
      <section className="profile-header"><div><span className="profile-avatar">고</span><div><p>진흥몰 회원</p><h1>내 계정</h1><span>배송지와 주문 내역을 관리하세요.</span></div></div></section>
      <section className="month-summary"><div><span>이번 달 주문금액</span><strong>{formatPrice(0)}</strong><small>주문 내역이 없습니다.</small></div><div><span>주문 건수</span><strong>0건</strong><small>무통장 입금 주문도 함께 확인합니다.</small></div><div><span>자주 주문</span><strong>{frequent.length}개</strong><small>바로 장바구니에 담을 수 있습니다.</small></div></section>
      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">ORDER HISTORY</p><h2>주문 현황</h2></div><Link href="/orders">전체보기</Link></div><div className="order-progress"><div className="progress-item"><b>01</b><span>입금 대기</span><strong>0</strong></div><i /><div className="progress-item"><b>02</b><span>입금 확인</span><strong>0</strong></div><i /><div className="progress-item"><b>03</b><span>배송 준비</span><strong>0</strong></div><i /><div className="progress-item"><b>04</b><span>배송 완료</span><strong>0</strong></div></div></section>
      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">ONE-TAP REORDER</p><h2>자주 주문하는 상품</h2></div><Link href="/favorites">등록 상품 관리</Link></div><div className="quick-reorder-list">{frequent.map((product, index) => <article key={product.id}><div className="quick-product-placeholder">{product.name}</div><div><span>{index + 1}위 · 주문 가능</span><strong>{product.name}</strong><small>{product.unit} · {product.salesUnit}</small></div><button type="button" onClick={() => addToCart(product.id, product.minOrder)}>바로 담기</button></article>)}</div></section>
    </main>
  );
}
