"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StoreProvider, useStore } from "./StoreProvider";

const navItems = [
  { href: "/", label: "상품" },
  { href: "/favorites", label: "자주 주문" },
  { href: "/orders", label: "주문내역" },
  { href: "/login", label: "로그인" },
];

function Header() {
  const pathname = usePathname();
  const { cartCount, role } = useStore();
  const isLoggedIn = role !== "guest";
  const roleLabel = isLoggedIn ? "로그인 완료" : "가격 확인";

  return (
    <>
      <div className="top-notice">
        <span>가격 안내</span>
        <p>로그인하면 등록된 상품 가격을 확인할 수 있습니다.</p>
        <Link href="/login">로그인</Link>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="진흥몰 홈">
            <span className="brand-mark">JH</span>
            <span className="brand-copy"><strong>진흥몰</strong><small>JINHEUNG FLOWER</small></span>
          </Link>
          <form action="/products" className="header-search">
            <label className="sr-only" htmlFor="global-search">상품 검색</label>
            <input id="global-search" name="q" placeholder="상품명, 색상, 품번으로 검색" />
            <button type="submit">검색</button>
          </form>
          <div className="header-actions">
            <Link href={isLoggedIn ? "/mypage" : "/login"} className="account-link"><span>{roleLabel}</span><strong>{isLoggedIn ? "내 주문정보" : "로그인"}</strong></Link>
            <Link href="/cart" className="cart-link">장바구니 <b>{cartCount}</b></Link>
          </div>
        </div>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <div className="nav-inner">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>
            ))}
            <span className="nav-divider" />
            <Link href="/admin">관리자 미리보기</Link>
          </div>
        </nav>
      </header>
      <nav className="mobile-bottom-nav" aria-label="모바일 메뉴">
        <Link href="/" className={pathname === "/" ? "active" : ""}><span>⌂</span>홈</Link>
        <Link href="/products" className={pathname === "/products" ? "active" : ""}><span>⌕</span>검색</Link>
        <Link href="/favorites" className={pathname === "/favorites" ? "active" : ""}><span>♡</span>자주 주문</Link>
        <Link href="/cart" className={pathname === "/cart" ? "active" : ""}><span>▢</span>장바구니{cartCount > 0 && <b>{cartCount}</b>}</Link>
        <Link href="/mypage" className={pathname === "/mypage" ? "active" : ""}><span>○</span>마이</Link>
      </nav>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Header />
      {children}
      <footer className="site-footer">
        <div>
          <strong>진흥몰</strong>
          <p>진흥조화가 직접 고르고 공급하는 조화 주문몰</p>
        </div>
        <div className="footer-links">
          <Link href="/login">로그인</Link>
          <Link href="/orders">주문 조회</Link>
          <Link href="/admin">관리자</Link>
        </div>
        <small>현재 화면은 프론트엔드 시안이며 가격·VAT·배송 정책은 관리자 설정 연동 전 예시입니다.</small>
      </footer>
    </StoreProvider>
  );
}
