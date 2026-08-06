"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StoreProvider, useStore } from "./StoreProvider";

const navItems = [
  { href: "/", label: "전체상품" },
  { href: "/favorites", label: "자주 주문" },
  { href: "/orders", label: "주문내역" },
];

function Header() {
  const pathname = usePathname();
  const { cartCount, role } = useStore();
  const isLoggedIn = role !== "guest";

  return (
    <>
      <header className="site-header">
        <div className="header-inner catalog-header-inner">
          <Link href="/" className="brand" aria-label="진흥몰 홈">
            <span className="reference-brand">진흥몰</span>
          </Link>
          <nav className="reference-nav" aria-label="주요 메뉴">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>{item.label}</Link>
            ))}
            <Link href={isLoggedIn ? "/mypage" : "/login"}>{isLoggedIn ? "마이페이지" : "로그인"}</Link>
            <Link href="/cart" className="reference-cart">장바구니 <b>{cartCount}</b></Link>
          </nav>
        </div>
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
