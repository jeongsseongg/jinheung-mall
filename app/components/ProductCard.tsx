"use client";

import Link from "next/link";
import { formatPrice, type Product } from "@/app/lib/products";
import { useStore } from "./StoreProvider";

export function ProductCard({ product }: { product: Product }) {
  const { role, favorites, toggleFavorite, addToCart } = useStore();
  const isLoggedIn = role !== "guest";
  const isBusiness = role === "business";
  const isFavorite = favorites.includes(product.id);
  const price = isBusiness ? product.businessPrice : product.consumerPrice;

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${product.id}`} aria-label={`${product.name} 상세보기`}>
          <img src={product.image} alt={`${product.name} 예시 이미지`} className="product-image" />
        </Link>
        <button
          type="button"
          className={`favorite-button ${isFavorite ? "selected" : ""}`}
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFavorite ? "자주 주문에서 삭제" : "자주 주문에 등록"}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "저장됨" : "저장"}
        </button>
      </div>
      <div className="product-content">
        {(product.isBest || product.isNew) && <div className="product-status-row">{product.isBest && <span>BEST</span>}{product.isNew && <span>NEW</span>}</div>}
        <p className="product-meta">{product.category} · {product.color}</p>
        <Link href={`/products/${product.id}`} className="product-name">{product.name}</Link>
        {isLoggedIn ? <div className="price-block"><strong>{formatPrice(price)}</strong><span>로그인 회원가</span></div> : <Link href="/login" className="locked-price">로그인 후 가격 확인</Link>}
        <p className="unit-copy">{product.unit} · 최소 {product.minOrder}단</p>
        {isLoggedIn ? <button type="button" className="quick-cart-button" onClick={() => addToCart(product.id, product.minOrder)}>{product.minOrder}단 담기</button> : <Link className="quick-cart-button login-cart-link" href="/login">로그인하고 주문</Link>}
      </div>
    </article>
  );
}
