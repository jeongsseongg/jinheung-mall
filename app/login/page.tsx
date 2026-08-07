"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/app/components/StoreProvider";

export default function LoginPage() {
  const { setRole } = useStore();
  const router = useRouter();

  const loginDemo = () => {
    setRole("member");
    router.push("/");
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">JH</span><div><strong>진흥몰</strong><p>조화 주문을 더 간단하게</p></div></div>
        <h1>로그인</h1>
        <p>로그인하면 장바구니와 주문 내역을 계정에 안전하게 저장합니다.</p>
        <form onSubmit={(event) => { event.preventDefault(); loginDemo(); }} className="auth-form">
          <label><span>휴대전화 번호 또는 이메일</span><input inputMode="email" placeholder="example@email.com" /></label>
          <label><span>비밀번호</span><input type="password" placeholder="비밀번호 입력" /></label>
          <button type="submit" className="primary-button full">로그인</button>
        </form>
        <small className="demo-caption">현재는 화면 시연용 로그인입니다. 실제 회원 인증은 Supabase Auth 연결 후 적용합니다.</small>
      </section>
    </main>
  );
}
