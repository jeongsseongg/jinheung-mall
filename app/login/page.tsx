"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";

type Mode = "login" | "signup";

const authMessage = (message: string) => {
  if (message.includes("Invalid login credentials")) return "이메일 또는 비밀번호가 맞지 않습니다.";
  if (message.includes("Email not confirmed")) return "이메일 인증을 먼저 완료해주세요.";
  if (message.includes("User already registered")) return "이미 가입된 이메일입니다.";
  if (message.includes("Password should be")) return "비밀번호는 6자 이상 입력해주세요.";
  return message;
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/mypage");
  }, [authLoading, router, user]);

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setIsError(false);

    if (mode === "signup" && (!name.trim() || !phone.trim())) {
      setMessage("이름과 전화번호를 입력해주세요.");
      setIsError(true);
      setSubmitting(false);
      return;
    }

    const result = mode === "login"
      ? await signIn(email.trim(), password)
      : await signUp({ email: email.trim(), password, name: name.trim(), phone: phone.trim() });

    if (result.error) {
      setMessage(authMessage(result.error));
      setIsError(true);
    } else if (result.needsEmailConfirmation) {
      setMessage("가입 확인 메일을 보냈습니다. 메일의 인증 링크를 누른 뒤 로그인해주세요.");
      setMode("login");
    } else {
      router.replace("/mypage");
    }
    setSubmitting(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark">JH</span><div><strong>진흥몰</strong><p>조화 주문을 더 간단하게</p></div></div>
        <div className="auth-tabs" role="tablist" aria-label="회원 메뉴">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>로그인</button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>회원가입</button>
        </div>
        <h1>{mode === "login" ? "로그인" : "회원가입"}</h1>
        <p>{mode === "login" ? "장바구니와 주문 내역을 내 계정에 안전하게 저장하세요." : "주문 확인에 사용할 기본 회원정보를 입력해주세요."}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <>
            <label><span>이름</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="주문자 이름" required /></label>
            <label><span>전화번호</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" required /></label>
          </>}
          <label><span>이메일</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="example@email.com" required /></label>
          <label><span>비밀번호</span><input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="6자 이상 입력" required /></label>
          {message && <p className={`auth-message ${isError ? "error" : "success"}`} role="status">{message}</p>}
          <button type="submit" className="primary-button full" disabled={submitting || authLoading}>{submitting ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}</button>
        </form>
        <small className="demo-caption">회원정보는 Supabase Auth와 진흥몰 회원 DB에 저장됩니다.</small>
      </section>
    </main>
  );
}
