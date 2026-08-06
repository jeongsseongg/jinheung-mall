"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/app/components/StoreProvider";

export default function LoginPage() {
  const [type, setType] = useState<"consumer" | "business">("consumer");
  const { setRole } = useStore();
  const router = useRouter();
  const loginDemo = () => { setRole(type); router.push(type === "business" ? "/mypage" : "/"); };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">JH</span><div><strong>진흥몰</strong><p>조화 주문을 더 간단하게</p></div></div>
        <div className="auth-tabs"><button type="button" className={type === "consumer" ? "active" : ""} onClick={() => setType("consumer")}>일반 회원</button><button type="button" className={type === "business" ? "active" : ""} onClick={() => setType("business")}>사업자 회원</button></div>
        <h1>{type === "business" ? "사업자 회원 로그인" : "일반 회원 로그인"}</h1>
        <p>{type === "business" ? "승인된 사업자 계정은 도매 전용 가격을 확인할 수 있습니다." : "첫 화면과 동일한 일반 회원 가격으로 주문합니다."}</p>
        <form onSubmit={(event) => { event.preventDefault(); loginDemo(); }} className="auth-form"><label><span>휴대전화 번호</span><input inputMode="tel" placeholder="010-0000-0000" /></label><label><span>비밀번호</span><input type="password" placeholder="비밀번호 입력" /></label><button type="submit" className="primary-button full">{type === "business" ? "사업자 데모 로그인" : "일반회원 데모 로그인"}</button></form>
        {type === "business" && <div className="verification-mini"><strong>아직 사업자 인증 전인가요?</strong><p>등록증을 접수하면 관리자가 확인 후 회원 등급을 변경합니다.</p><a href="/business-verification">사업자 인증 접수 →</a></div>}
        <small className="demo-caption">현재는 프론트엔드 시연용 로그인입니다. 실제 인증과 계정 API는 추후 연결합니다.</small>
      </section>
    </main>
  );
}
