"use client";

import Link from "./SafeLink";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { StoreProvider, useStore } from "./StoreProvider";
import { AuthProvider, useAuth } from "./AuthProvider";

const navItems = [
  { href: "/", label: "전체상품" },
  { href: "/favorites", label: "자주 주문" },
  { href: "/orders", label: "주문내역" },
];

function Header() {
  const pathname = usePathname();
  const { cartCount } = useStore();
  const { user, loading, signOut } = useAuth();
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    main.id = "main-content";
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  }, [pathname]);

  return (
    <>
      <a
        href="#main-content"
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          zIndex: 1000,
          padding: "10px 14px",
          borderRadius: 6,
          background: "#1d211f",
          color: "#fff",
          fontWeight: 700,
          transform: "translateY(-160%)",
          transition: "transform 120ms ease",
        }}
        onFocus={(event) => { event.currentTarget.style.transform = "translateY(0)"; }}
        onBlur={(event) => { event.currentTarget.style.transform = "translateY(-160%)"; }}
      >
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <div className="header-inner catalog-header-inner">
          <Link href="/" className="brand" aria-label="진흥몰 홈">
            <span className="reference-brand">진흥몰</span>
          </Link>
          <nav className="reference-nav" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>
            ))}
            <Link href={isLoggedIn ? "/mypage" : "/login"}>{loading ? "확인 중" : isLoggedIn ? "마이페이지" : "로그인"}</Link>
            {isLoggedIn && <button type="button" className="nav-signout" onClick={() => void signOut()}>로그아웃</button>}
            <Link href="/cart" className="reference-cart">장바구니 <b>{cartCount}</b></Link>
          </nav>
        </div>
      </header>
      <nav className="mobile-bottom-nav" aria-label="모바일 메뉴">
        <Link href="/" className={pathname === "/" ? "active" : ""}><span>⌂</span>홈</Link>
        <Link href="/products" className={pathname === "/products" ? "active" : ""}><span>⌕</span>검색</Link>
        <Link href="/favorites" className={pathname === "/favorites" ? "active" : ""}><span>♡</span>자주 주문</Link>
        <Link href="/cart" className={pathname === "/cart" ? "active" : ""}><span>▢</span>장바구니{cartCount > 0 && <b>{cartCount}</b>}</Link>
        <Link href={isLoggedIn ? "/mypage" : "/login"} className={pathname === "/mypage" || pathname === "/login" ? "active" : ""}><span>○</span>마이</Link>
      </nav>
    </>
  );
}

function Footer() {
  const { isAdmin } = useAuth();

  return (
    <footer className="site-footer">
      <div>
        <strong>진흥몰</strong>
        <p>진흥조화가 직접 고르고 공급하는 조화 주문몰</p>
      </div>
      <div className="footer-links">
        <Link href="/login">로그인</Link>
        <Link href="/orders">주문 조회</Link>
        {isAdmin && <Link href="/admin">관리자</Link>}
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <Header />
        {children}
        <Footer />
      </StoreProvider>
    </AuthProvider>
  );
}
