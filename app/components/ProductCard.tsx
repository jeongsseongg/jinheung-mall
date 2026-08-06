"use client";

import Link from "next/link";
import { formatPrice, type Product } from "@/app/lib/products";
import { useStore } from "./StoreProvider";

export function ProductCard({ product }: { product: Product }) {
  const { role, favorites, toggleFavorite, addToCart } = useStore();
  const isBusiness = role === "business";
  const isFavorite = favorites.includes(product.id);
  const price = isBusiness ? product.businessPrice : product.consumerPrice;

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${product.id}`} aria-label={`${product.name} 상세보기`}>
          <img src={product.image} alt={`${product.name} 예시 이미지`} className="product-image" />
        </Link>
        <div className="product-badges">
          {product.isBest && <span className="badge dark">BEST</span>}
          {product.isNew && <span className="badge light">NEW</span>}
        </div>
        <button
          type="button"
          className={`favorite-button ${isFavorite ? "selected" : ""}`}
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFavorite ? "자주 주문에서 삭제" : "자주 주문에 등록"}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
      <div className="product-content">
        <p className="product-meta">{product.category} · {product.color}</p>
        <Link href={`/products/${product.id}`} className="product-name">{product.name}</Link>
        <div className="price-block">
          <strong>{formatPrice(price)}</strong>
          {isBusiness ? <span className="business-price-label">사업자가</span> : <span>일반 회원가</span>}
        </div>
        <p className="unit-copy">{product.unit} · 최소 {product.minOrder}단</p>
        <button type="button" className="quick-cart-button" onClick={() => addToCart(product.id, product.minOrder)}>
          {product.minOrder}단 담기
        </button>
      </div>
    </article>
  );
}
