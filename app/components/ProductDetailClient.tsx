"use client";

import { useMemo, useState } from "react";
import Link from "./SafeLink";
import { formatPrice, type Product } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { useStore } from "./StoreProvider";

export function ProductDetailClient({ product: fallbackProduct }: { product: Product }) {
  const { products } = useProducts();
  const product = products.find((item) => item.id === fallbackProduct.id) ?? fallbackProduct;
  const { addToCart, favorites, toggleFavorite, cartSyncing } = useStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const colorOptions = useMemo(() => product.color.split(",").map((color) => color.trim()).filter(Boolean), [product.color]);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] ?? "");
  const price = product.consumerPrice;
  const isFavorite = favorites.includes(product.id);
  const soldOut = product.stockQuantity !== undefined && product.stockQuantity <= 0 && product.stock !== "확인 필요";
  const stockLabel = soldOut ? "품절" : product.stock === "확인 필요" ? "확인 필요 · 주문 가능" : product.stock;
  const activeColor = colorOptions.includes(selectedColor) ? selectedColor : colorOptions[0] ?? "";
  const orderQuantity = Math.max(product.minOrder, quantity);

  return (
    <main className="store-main page-main">
      <nav className="breadcrumbs" aria-label="현재 위치"><Link href="/">홈</Link><span>›</span><Link href="/products">{product.category}</Link><span>›</span><strong>{product.name}</strong></nav>
      <section className="product-detail">
        <div className="detail-gallery">
          {product.image ? <img src={product.image} alt={`${product.name} 상품 이미지`} /> : <div className="detail-image-placeholder"><small>색상 선택 가능</small><strong>{product.name}</strong><span>{product.color}</span></div>}
          <span>{product.image ? "상품 이미지" : "이미지 미등록"}</span>
        </div>
        <div className="detail-info">
          <p className="product-meta">{product.category} · {activeColor || product.color}</p>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price"><span>판매가</span><strong>{formatPrice(price)}</strong><small>VAT 포함</small></div>
          <section className="color-option-section" aria-label="색상 선택">
            <strong>색상 선택</strong>
            <div>
              {colorOptions.map((color) => <button type="button" key={color} className={activeColor === color ? "selected" : ""} aria-pressed={activeColor === color} onClick={() => setSelectedColor(color)}>{color}</button>)}
            </div>
          </section>
          <dl className="detail-specs">
            <div><dt>판매 단위</dt><dd>{product.salesUnit}</dd></div>
            <div><dt>상품 규격</dt><dd>{product.unit}</dd></div>
            <div><dt>최소 주문</dt><dd>{product.minOrder}{product.salesUnit}부터</dd></div>
            <div><dt>재고 상태</dt><dd><span className={`stock-dot ${product.stock}`} />{stockLabel}</dd></div>
            <div><dt>예상 출고</dt><dd>평일 오후 2시 이전 당일</dd></div>
          </dl>
          <div className="quantity-row"><span>주문 수량</span><div className="quantity-control"><button type="button" aria-label={`${product.name} 수량 줄이기`} disabled={soldOut || orderQuantity <= product.minOrder} onClick={() => setQuantity(Math.max(product.minOrder, orderQuantity - 1))}>−</button><strong aria-live="polite">{orderQuantity}</strong><button type="button" aria-label={`${product.name} 수량 늘리기`} disabled={soldOut} onClick={() => setQuantity(orderQuantity + 1)}>＋</button></div></div>
          <div className="detail-actions"><button type="button" className={`favorite-large ${isFavorite ? "selected" : ""}`} disabled={cartSyncing} onClick={() => toggleFavorite(product.id)}>{isFavorite ? "♥ 등록됨" : "♡ 자주 주문"}</button><button type="button" className="primary-button grow" disabled={soldOut || cartSyncing} onClick={() => addToCart(product.id, orderQuantity, activeColor)}>{soldOut ? "품절" : cartSyncing ? "장바구니 준비 중" : "장바구니 담기"}</button></div>
        </div>
      </section>
      <section className="detail-note"><h2>구매 전 확인해주세요</h2><div className="note-grid"><article><strong>상품 정보 확인</strong><p>등록된 상품명과 색상, 규격을 확인한 뒤 주문해 주세요.</p></article><article><strong>색상·단위 선택</strong><p>상품마다 제공 색상과 판매 단위(단·박스·카톤)를 확인한 뒤 주문할 수 있습니다.</p></article><article><strong>대량 주문 문의</strong><p>대량 주문은 주문 전에 재고 수량과 출고 일정을 문의해 주세요.</p></article></div></section>
    </main>
  );
}
