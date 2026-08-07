"use client";

import { useState } from "react";
import { formatPrice, type Product } from "@/app/lib/products";
import { useStore } from "./StoreProvider";
import Link from "./SafeLink";

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggleFavorite, addToCart, cartSyncing } = useStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const isFavorite = favorites.includes(product.id);
  const soldOut = product.stockQuantity !== undefined && product.stockQuantity <= 0 && product.stock !== "확인 필요";
  const stockLabel = soldOut ? "품절" : product.stock === "확인 필요" ? "재고 확인 후 주문 확정" : `재고 ${product.stock}`;

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${product.id}`} aria-label={`${product.name} 상세보기`} className={product.image ? "product-image-link" : "product-image-placeholder"}>
          {product.image ? <img src={product.image} alt={`${product.name} 상품 이미지`} className="product-image" loading="lazy" decoding="async" /> : <><small>색상 선택 가능</small><strong>{product.name}</strong><span>{product.color}</span></>}
        </Link>
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
        <p className="product-code">{(product.sku || product.id).toUpperCase()}</p>
        <Link href={`/products/${product.id}`} className="product-name">{product.name}</Link>
        <div className="price-block"><strong>{formatPrice(product.consumerPrice)}</strong><span>VAT 포함</span></div>
        <p className="unit-copy">{stockLabel} · 최소 {product.minOrder}{product.salesUnit} · {product.unit}</p>
        <div className="product-order-row">
          <div className="quantity-stepper" aria-label={`${product.name} 수량`}>
            <button type="button" aria-label={`${product.name} 수량 줄이기`} disabled={soldOut || quantity <= product.minOrder} onClick={() => setQuantity((value) => Math.max(product.minOrder, value - 1))}>−</button>
            <strong aria-live="polite">{quantity}</strong>
            <button type="button" aria-label={`${product.name} 수량 늘리기`} disabled={soldOut} onClick={() => setQuantity((value) => value + 1)}>＋</button>
          </div>
          <button type="button" className="quick-cart-button" disabled={soldOut || cartSyncing} onClick={() => addToCart(product.id, quantity)}>{soldOut ? "품절" : cartSyncing ? "준비 중" : "담기"}</button>
        </div>
      </div>
    </article>
  );
}
