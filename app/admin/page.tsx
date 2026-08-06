"use client";

import { useState } from "react";
import { products } from "@/app/lib/products";

const applicants = [
  { company: "푸른정원 플라워", owner: "이정희", number: "214-08-****", date: "오늘 09:42", type: "꽃집·플라워샵" },
  { company: "모먼트 웨딩", owner: "김수현", number: "301-22-****", date: "어제 17:18", type: "웨딩·행사" },
  { company: "공간애 디자인", owner: "박정훈", number: "118-19-****", date: "8월 4일", type: "인테리어·공간장식" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"verification" | "products">("verification");
  const [resolved, setResolved] = useState<string[]>([]);
  return (
    <main className="admin-page">
      <aside className="admin-sidebar"><div className="admin-logo"><span className="brand-mark">JH</span><div><strong>진흥몰 관리자</strong><small>FRONTEND PREVIEW</small></div></div><nav><button className="active">대시보드</button><button onClick={() => setTab("verification")}>사업자 인증 <b>{applicants.length - resolved.length}</b></button><button onClick={() => setTab("products")}>상품 관리</button><button>주문 관리</button><button>회원·가격 등급</button><button>VAT·배송 설정</button></nav><a href="/">← 쇼핑몰로 돌아가기</a></aside>
      <section className="admin-content">
        <header><div><p>2026년 8월 6일</p><h1>안녕하세요, 관리자님.</h1></div><div className="admin-user">관리자 <span>진</span></div></header>
        <div className="admin-alert"><span>!</span><div><strong>사업자 인증 후 회원 유형·가격 등급을 변경해주세요.</strong><p>새로 접수된 인증 요청 {applicants.length - resolved.length}건이 확인을 기다리고 있습니다.</p></div><button type="button" onClick={() => setTab("verification")}>지금 확인</button></div>
        <section className="admin-metrics"><article><span>오늘 주문</span><strong>18건</strong><small>어제보다 +4</small></article><article><span>오늘 매출</span><strong>2,846,000원</strong><small>예시 데이터</small></article><article><span>승인 대기</span><strong>{applicants.length - resolved.length}건</strong><small>수동 확인 필요</small></article><article><span>재고 부족</span><strong>7개</strong><small>상품 확인 필요</small></article></section>
        <div className="admin-tabs"><button className={tab === "verification" ? "active" : ""} onClick={() => setTab("verification")}>사업자 인증</button><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>상품 관리</button></div>
        {tab === "verification" ? <section className="admin-table-panel"><div className="panel-heading"><div><h2>사업자 인증 대기</h2><p>등록증 확인 후 사업자 회원으로 변경합니다.</p></div><span>수동 인증 단계</span></div><div className="admin-table"><div className="table-row table-head"><span>업체명</span><span>대표자·등록번호</span><span>업종</span><span>접수일</span><span>처리</span></div>{applicants.map((applicant) => <div className={`table-row ${resolved.includes(applicant.company) ? "resolved" : ""}`} key={applicant.company}><span><strong>{applicant.company}</strong></span><span>{applicant.owner}<small>{applicant.number}</small></span><span>{applicant.type}</span><span>{applicant.date}</span><span>{resolved.includes(applicant.company) ? <b className="approved">승인 완료</b> : <><button type="button" className="line-button">등록증 보기</button><button type="button" className="approve-button" onClick={() => setResolved((current) => [...current, applicant.company])}>승인</button></>}</span></div>)}</div></section> : <section className="admin-table-panel"><div className="panel-heading"><div><h2>상품 관리</h2><p>예시 상품의 이름, 가격, 판매단위를 수정하는 화면입니다.</p></div><button type="button" className="primary-button">새 상품 등록</button></div><div className="admin-table product-admin-table"><div className="table-row table-head"><span>상품</span><span>일반가</span><span>사업자가</span><span>재고</span><span>관리</span></div>{products.slice(0, 5).map((product) => <div className="table-row" key={product.id}><span className="admin-product"><img src={product.image} alt="" /><strong>{product.name}</strong></span><span>{product.consumerPrice.toLocaleString()}원</span><span>{product.businessPrice.toLocaleString()}원</span><span>{product.stock}</span><span><button type="button" className="line-button">수정</button></span></div>)}</div></section>}
      </section>
    </main>
  );
}
