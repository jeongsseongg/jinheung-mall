"use client";

import { useState } from "react";
import { formatPrice, type Product } from "@/app/lib/products";
import { useStore } from "./StoreProvider";

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite, addToCart } = useStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const isFavorite = favorites.includes(product.id);

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <a href={`/products/${product.id}`} aria-label={`${product.name} 상세보기`}>
          <img src={product.image} alt={`${product.name} 예시 이미지`} className="product-image" />
        </a>
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
        <p className="product-code">{product.id.slice(0, 8).toUpperCase()}</p>
        <a href={`/products/${product.id}`} className="product-name">{product.name}</a>
        <div className="price-block"><strong>{formatPrice(product.consumerPrice)}</strong><span>VAT 포함</span></div>
        <p className="unit-copy">최소 {product.minOrder}단 · {product.unit}</p>
        <div className="product-order-row">
          <div className="quantity-stepper" aria-label={`${product.name} 수량`}>
            <button type="button" aria-label="수량 줄이기" onClick={() => setQuantity((value) => Math.max(product.minOrder, value - 1))}>−</button>
            <strong>{quantity}</strong>
            <button type="button" aria-label="수량 늘리기" onClick={() => setQuantity((value) => value + 1)}>＋</button>
          </div>
          <button type="button" className="quick-cart-button" onClick={() => addToCart(product.id, quantity)}>담기</button>
        </div>
      </div>
    </article>
  );
}
