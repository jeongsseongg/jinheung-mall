"use client";

import { useState } from "react";
import { useProducts } from "@/app/lib/use-products";

export default function AdminPage() {
  const { products } = useProducts();
  const [tab, setTab] = useState<"products" | "orders">("products");

  return (
    <main className="admin-page">
      <aside className="admin-sidebar"><div className="admin-logo"><span className="brand-mark">JH</span><div><strong>진흥몰 관리자</strong><small>ADMIN CONSOLE</small></div></div><nav><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>상품 관리</button><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>주문 관리</button><button>회원 관리</button><button>배송 설정</button></nav><a href="/">← 쇼핑몰로 돌아가기</a></aside>
      <section className="admin-content">
        <header><div><p>ADMIN</p><h1>운영 현황</h1></div><div className="admin-user">관리자 <span>진</span></div></header>
        <section className="admin-metrics"><article><span>오늘 주문</span><strong>0건</strong><small>결제·입금 확인 전</small></article><article><span>입금 대기</span><strong>0건</strong><small>무통장 입금 주문</small></article><article><span>배송 준비</span><strong>0건</strong><small>운송장 발급 대기</small></article><article><span>재고 부족</span><strong>0개</strong><small>상품 재고를 확인하세요.</small></article></section>
        <div className="admin-tabs"><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>상품 관리</button><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>주문 관리</button></div>
        {tab === "products" ? <section className="admin-table-panel"><div className="panel-heading"><div><h2>상품 관리</h2><p>상품명, 가격, 색상 그룹, 부쉬와 단·박스·카톤 판매 단위를 관리합니다.</p></div><button type="button" className="primary-button">새 상품 등록</button></div><div className="admin-table product-admin-table"><div className="table-row table-head"><span>상품</span><span>판매가</span><span>판매 단위</span><span>재고</span><span>관리</span></div>{products.slice(0, 8).map((product) => <div className="table-row" key={product.id}><span className="admin-product"><div className="admin-product-placeholder">{product.name}</div><strong>{product.name}</strong></span><span>{product.consumerPrice.toLocaleString()}원</span><span>{product.salesUnit} · {product.unit}</span><span>{product.stock}</span><span><button type="button" className="line-button">수정</button></span></div>)}</div></section> : <section className="admin-table-panel"><div className="panel-heading"><div><h2>주문 관리</h2><p>입금 대기, 입금 확인, 배송 준비, 배송 완료 상태를 관리합니다.</p></div></div><div className="empty-state"><strong>아직 주문이 없습니다.</strong><p>주문 API와 무통장 입금 확인 연동 후 이곳에서 주문을 처리할 수 있습니다.</p></div></section>}
      </section>
    </main>
  );
}
