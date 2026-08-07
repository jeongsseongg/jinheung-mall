"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type Mode = "login" | "signup" | "forgot" | "reset";

const authMessage = (message: string) => {
  if (message.includes("Invalid login credentials")) return "아이디·이메일 또는 비밀번호가 맞지 않습니다.";
  if (message.includes("Email not confirmed")) return "이메일 인증을 먼저 완료해주세요.";
  if (message.includes("User already registered")) return "이미 가입된 이메일입니다.";
  if (message.includes("Password should be")) return "비밀번호 길이와 보안 조건을 확인해주세요.";
  if (message.includes("Auth session missing")) return "비밀번호 재설정 링크가 만료되었거나 올바르지 않습니다. 새 링크를 요청해주세요.";
  return message;
};

const safeReturnTo = (requested: string, fallback: string, isAdmin: boolean) => {
  if (!requested.startsWith("/") || requested.startsWith("//") || requested.includes("\\")) return fallback;
  try {
    const target = new URL(requested, window.location.origin);
    if (target.origin !== window.location.origin) return fallback;
    if (target.pathname === "/admin" && !isAdmin) return "/mypage";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetRequested = searchParams.get("reset") === "1";
  const { user, loading: authLoading, isAdmin, adminLoading, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>(resetRequested ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(searchParams.get("confirmed") === "1" ? "이메일 인증이 완료되었습니다. 로그인해주세요." : "");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const { data } = getSupabaseBrowserClient().auth.onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;
      setMode("reset");
      setMessage("새 비밀번호를 입력해주세요.");
      setIsError(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading || adminLoading || !user || mode === "reset") return;
    if (resetRequested) return;
    const requested = searchParams.get("returnTo") || "";
    const fallback = isAdmin ? "/admin" : "/mypage";
    window.location.replace(safeReturnTo(requested, fallback, isAdmin));
  }, [adminLoading, authLoading, isAdmin, mode, resetRequested, searchParams, user]);

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setIsError(false);

    if (mode === "forgot") {
      const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login?reset=1`,
      });
      setMessage(error ? authMessage(error.message) : "가입 여부와 관계없이 입력한 이메일로 재설정 안내를 보냈습니다. 메일함을 확인해주세요.");
      setIsError(Boolean(error));
      setSubmitting(false);
      return;
    }

    if (mode === "reset") {
      if (!user) {
        setMessage("비밀번호 재설정 링크가 만료되었거나 올바르지 않습니다. 새 링크를 요청해주세요.");
        setIsError(true);
        setSubmitting(false);
        return;
      }
      if (password.length < 8) {
        setMessage("새 비밀번호는 8자 이상 입력해주세요.");
        setIsError(true);
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setMessage("새 비밀번호 확인이 일치하지 않습니다.");
        setIsError(true);
        setSubmitting(false);
        return;
      }
      const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
      if (error) {
        setMessage(authMessage(error.message));
        setIsError(true);
      } else {
        router.replace("/login");
        await signOut();
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setMessage("비밀번호를 변경했습니다. 새 비밀번호로 로그인해주세요.");
      }
      setSubmitting(false);
      return;
    }

    if (mode === "signup" && (!name.trim() || !phone.trim())) {
      setMessage("이름과 전화번호를 입력해주세요.");
      setIsError(true);
      setSubmitting(false);
      return;
    }

    const loginIdentifier = email.trim();
    const result = mode === "login"
      ? await signIn(loginIdentifier, password)
      : await signUp({ email: email.trim().toLowerCase(), password, name: name.trim(), phone: phone.trim() });

    if (result.error) {
      setMessage(authMessage(result.error));
      setIsError(true);
    } else if (result.needsEmailConfirmation) {
      setMessage("가입 확인 메일을 보냈습니다. 메일의 인증 링크를 누른 뒤 로그인해주세요.");
      setMode("login");
    } else {
      setMessage(mode === "login" ? "로그인했습니다. 이동 중입니다." : "회원가입이 완료되었습니다. 이동 중입니다.");
    }
    setSubmitting(false);
  };

  if (authLoading || (user && mode !== "reset" && adminLoading)) {
    return <main id="main-content" className="auth-page"><section className="auth-card"><div className="empty-state"><strong>계정 정보를 확인하고 있습니다.</strong></div></section></main>;
  }
  if (user && mode !== "reset") {
    return <main id="main-content" className="auth-page"><section className="auth-card"><div className="empty-state"><strong>로그인했습니다. 안전하게 이동하고 있습니다.</strong></div></section></main>;
  }

  const title = mode === "login" ? "로그인" : mode === "signup" ? "회원가입" : mode === "forgot" ? "비밀번호 재설정" : "새 비밀번호 설정";
  const description = mode === "login"
    ? "장바구니와 주문 내역을 내 계정에 안전하게 저장하세요."
    : mode === "signup"
      ? "주문 확인에 사용할 기본 회원정보를 입력해주세요."
      : mode === "forgot"
        ? "가입한 이메일로 비밀번호 재설정 링크를 보내드립니다."
        : user
          ? "복구 링크가 확인되었습니다. 새 비밀번호를 입력해주세요."
          : "복구 링크가 만료되었거나 올바르지 않습니다. 새 링크를 요청해주세요.";
  const submitLabel = mode === "login" ? "로그인" : mode === "signup" ? "회원가입" : mode === "forgot" ? "재설정 메일 보내기" : "새 비밀번호 저장";

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand"><span className="brand-mark">JH</span><div><strong>진흥몰</strong><p>조화 주문을 더 간단하게</p></div></div>
        {(mode === "login" || mode === "signup") && <div className="auth-tabs" role="group" aria-label="회원 메뉴">
          <button type="button" aria-pressed={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")}>로그인</button>
          <button type="button" aria-pressed={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")}>회원가입</button>
        </div>}
        <h1 id="auth-title">{title}</h1>
        <p>{description}</p>
        {(mode !== "reset" || user) && <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <>
            <label><span>이름</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="주문자 이름" maxLength={100} required /></label>
            <label><span>전화번호</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" maxLength={30} required /></label>
          </>}
          {mode !== "reset" && <label><span>{mode === "login" ? "아이디 또는 이메일" : "이메일"}</span><input type={mode === "login" ? "text" : "email"} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder={mode === "login" ? "아이디 또는 example@email.com" : "example@email.com"} required /></label>}
          {(mode === "login" || mode === "signup") && <label><span>비밀번호</span><input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="6자 이상 입력" required /></label>}
          {mode === "reset" && <>
            <label><span>새 비밀번호</span><input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="8자 이상 입력" required /></label>
            <label><span>새 비밀번호 확인</span><input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="한 번 더 입력" required /></label>
          </>}
          {message && <p className={`auth-message ${isError ? "error" : "success"}`} role={isError ? "alert" : "status"}>{message}</p>}
          <button type="submit" className="primary-button full" disabled={submitting}>{submitting ? "처리 중..." : submitLabel}</button>
        </form>}
        {mode === "login" && <button type="button" className="auth-help-button" onClick={() => changeMode("forgot")}>비밀번호를 잊으셨나요?</button>}
        {(mode === "forgot" || mode === "reset") && <button type="button" className="auth-help-button" onClick={() => changeMode(mode === "reset" && !user ? "forgot" : "login")}>{mode === "reset" && !user ? "새 재설정 링크 요청" : "로그인으로 돌아가기"}</button>}
        <small className="demo-caption">회원정보는 Supabase Auth와 진흥몰 회원 DB에 저장됩니다.</small>
      </section>
    </main>
  );
}
