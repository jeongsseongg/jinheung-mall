"use client";

import Link from "next/link";
import { useStore } from "@/app/components/StoreProvider";
import { formatPrice, products } from "@/app/lib/products";

export default function MyPage() {
  const { role, setRole, addToCart } = useStore();
  const frequent = products.slice(0, 3);
  return (
    <main className="store-main page-main">
      <section className="profile-header"><div><span className="profile-avatar">김</span><div><p>{role === "business" ? "승인된 사업자 회원" : "일반 회원"}</p><h1>김진흥 고객님</h1><span>진흥플라워 · 서울 중구</span></div></div><button type="button" className="role-switch" onClick={() => setRole(role === "business" ? "consumer" : "business")}>데모: {role === "business" ? "일반회원으로" : "사업자로"} 보기</button></section>
      <section className="month-summary"><div><span>8월 주문금액</span><strong>{formatPrice(684200)}</strong><small>지난달보다 12% 증가</small></div><div><span>주문 건수</span><strong>6건</strong><small>배송중 1건</small></div><div><span>자주 주문</span><strong>8개</strong><small>바로 재주문 가능</small></div></section>
      <div className="mypage-layout"><section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">MONTHLY ORDER</p><h2>이번 달 주문 현황</h2></div><Link href="/orders">전체보기</Link></div><div className="order-progress"><div className="progress-item done"><b>01</b><span>주문완료</span><strong>6</strong></div><i /><div className="progress-item done"><b>02</b><span>입금확인</span><strong>6</strong></div><i /><div className="progress-item active"><b>03</b><span>배송중</span><strong>1</strong></div><i /><div className="progress-item"><b>04</b><span>배송완료</span><strong>5</strong></div></div></section><aside className="dashboard-panel business-status"><span>사업자 인증</span><strong>{role === "business" ? "승인 완료" : "인증 필요"}</strong><p>{role === "business" ? "현재 모든 상품에 사업자 전용 가격이 적용되고 있습니다." : "사업자등록증 접수 후 관리자 승인이 필요합니다."}</p><Link href="/business-verification">인증 정보 확인 →</Link></aside></div>
      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">ONE-TAP REORDER</p><h2>최근 자주 주문한 상품</h2></div><Link href="/favorites">등록 상품 관리</Link></div><div className="quick-reorder-list">{frequent.map((product, index) => <article key={product.id}><img src={product.image} alt="" /><div><span>{index + 1}위 · 최근 30일 {7 - index}회</span><strong>{product.name}</strong><small>{product.unit}</small></div><button type="button" onClick={() => addToCart(product.id, product.minOrder)}>바로 담기</button></article>)}</div></section>
    </main>
  );
}
