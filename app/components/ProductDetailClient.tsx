"use client";

import { useState } from "react";
import Link from "./SafeLink";
import { formatPrice, type Product } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { useStore } from "./StoreProvider";

export function ProductDetailClient({ product: fallbackProduct }: { product: Product }) {
  const { products } = useProducts();
  const product = products.find((item) => item.id === fallbackProduct.id) ?? fallbackProduct;
  const { addToCart, favorites, toggleFavorite } = useStore();
  const [quantity, setQuantity] = useState(product.minOrder);
  const colorOptions = product.color.split(",").map((color) => color.trim()).filter(Boolean);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0] ?? "");
  const price = product.consumerPrice;
  const isFavorite = favorites.includes(product.id);

  return (
    <main className="store-main page-main">
      <nav className="breadcrumbs" aria-label="현재 위치"><Link href="/">홈</Link><span>›</span><Link href="/products">{product.category}</Link><span>›</span><strong>{product.name}</strong></nav>
      <section className="product-detail">
        <div className="detail-gallery">
          {product.image ? <img src={product.image} alt={`${product.name} 예시 이미지`} /> : <div className="detail-image-placeholder"><small>색상 선택 가능</small><strong>{product.name}</strong><span>{product.color}</span></div>}
          <span>{product.image ? "예시 상품 이미지" : "상품 이미지 준비 중"}</span>
        </div>
        <div className="detail-info">
          <p className="product-meta">{product.category} · {selectedColor || product.color}</p>
          <h1>{product.name}</h1>
          <p className="detail-description">{product.description}</p>
          <div className="detail-price"><span>판매가</span><strong>{formatPrice(price)}</strong><small>VAT 포함 여부는 관리자 설정에 따릅니다.</small></div>
          <section className="color-option-section" aria-label="색상 선택">
            <strong>색상 선택</strong>
            <div>
              {colorOptions.map((color) => <button type="button" key={color} className={selectedColor === color ? "selected" : ""} aria-pressed={selectedColor === color} onClick={() => setSelectedColor(color)}>{color}</button>)}
            </div>
          </section>
          <dl className="detail-specs">
            <div><dt>판매 단위</dt><dd>{product.salesUnit}</dd></div>
            <div><dt>상품 규격</dt><dd>{product.unit}</dd></div>
            <div><dt>최소 주문</dt><dd>{product.minOrder}{product.salesUnit}부터</dd></div>
            <div><dt>재고 상태</dt><dd><span className={`stock-dot ${product.stock}`} />{product.stock}</dd></div>
            <div><dt>예상 출고</dt><dd>평일 오후 2시 이전 당일</dd></div>
          </dl>
          <div className="tier-prices"><strong>수량별 예상 단가</strong><div><span>{product.minOrder}~4{product.salesUnit}</span><b>{formatPrice(price)}</b></div><div><span>5~9{product.salesUnit}</span><b>{formatPrice(Math.round(price * 0.95 / 100) * 100)}</b></div><div><span>10{product.salesUnit} 이상</span><b>관리자 설정 예정</b></div></div>
          <div className="quantity-row"><span>주문 수량</span><div className="quantity-control"><button type="button" onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}>−</button><strong>{quantity}</strong><button type="button" onClick={() => setQuantity(quantity + 1)}>＋</button></div></div>
          <div className="detail-actions"><button type="button" className={`favorite-large ${isFavorite ? "selected" : ""}`} onClick={() => toggleFavorite(product.id)}>{isFavorite ? "♥ 등록됨" : "♡ 자주 주문"}</button><button type="button" className="primary-button grow" onClick={() => addToCart(product.id, quantity, selectedColor)}>장바구니 담기</button></div>
        </div>
      </section>
      <section className="detail-note"><h2>구매 전 확인해주세요</h2><div className="note-grid"><article><strong>실물에 가까운 상품 정보</strong><p>색상과 규격은 예시이며 관리자 상품 등록 화면에서 실제 자료로 교체할 수 있습니다.</p></article><article><strong>색상·단위 선택</strong><p>상품마다 제공 색상과 판매 단위(단·박스·카톤)를 확인한 뒤 주문할 수 있습니다.</p></article><article><strong>대량 주문은 별도 문의</strong><p>설정 수량을 초과하는 주문은 관리자 견적 알림으로 연결할 예정입니다.</p></article></div></section>
    </main>
  );
}
