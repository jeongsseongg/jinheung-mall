"use client";

import { useEffect, useMemo } from "react";
import Link from "@/app/components/SafeLink";
import { formatPrice } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { useStore } from "@/app/components/StoreProvider";
import { useAuth } from "@/app/components/AuthProvider";

const isSoldOut = (product: { stockQuantity?: number; stock: string }) => product.stockQuantity !== undefined && product.stockQuantity <= 0 && product.stock !== "확인 필요";

export default function CartPage() {
  const { products } = useProducts();
  const { user } = useAuth();
  const { cart, cartColors, cartSyncing, setQuantity, setCartColor, removeFromCart } = useStore();
  const items = useMemo(() => products.filter((product) => cart[product.id]), [cart, products]);
  const subtotal = items.reduce((sum, product) => sum + product.consumerPrice * Math.max(product.minOrder, cart[product.id]), 0);
  const hasSoldOutItems = items.some(isSoldOut);

  useEffect(() => {
    items.forEach((product) => {
      if (cart[product.id] < product.minOrder) setQuantity(product.id, product.minOrder);
    });
  }, [cart, items, setQuantity]);

  return (
    <main className="store-main page-main narrow-page">
      <div className="page-title-row split"><div><p className="eyebrow">YOUR CART</p><h1>장바구니</h1><p>{user ? "로그인 계정에 수량과 색상을 저장합니다." : "로그인하면 다른 기기에서도 장바구니를 이어볼 수 있습니다."}</p></div>{user && <span className={`cart-sync-status ${cartSyncing ? "syncing" : ""}`}>{cartSyncing ? "저장 중" : "계정 저장됨"}</span>}</div>
      {items.length === 0 ? <div className="empty-state"><strong>장바구니가 비어 있습니다.</strong><p>필요한 조화를 둘러보고 간편하게 담아보세요.</p><Link href="/" className="primary-button">상품 보러가기</Link></div> : <div className="cart-layout">
        <section className="cart-items">
          <div className="cart-section-head"><strong>진흥조화 직영상품</strong><span>{items.length}종</span></div>
          {items.map((product) => {
            const price = product.consumerPrice;
            const colorOptions = product.color.split(",").map((color) => color.trim()).filter(Boolean);
            const quantity = Math.max(product.minOrder, cart[product.id]);
            const soldOut = isSoldOut(product);
            const stockLabel = soldOut ? "품절" : product.stock === "확인 필요" ? "재고 확인 후 주문 확정" : `재고 ${product.stock}`;
            return <article className="cart-item" key={product.id}>
              <div className="cart-item-placeholder">{product.image ? <img src={product.image} alt="" loading="lazy" decoding="async" /> : product.name}</div>
              <div className="cart-item-copy">
                <span>{product.category}</span>
                <Link href={`/products/${product.id}`}>{product.name}</Link>
                <small>{product.unit} / 최소 {product.minOrder}{product.salesUnit} · {stockLabel}</small>
                <label className="cart-color-select"><span>색상</span><select disabled={soldOut} value={cartColors[product.id] || colorOptions[0] || ""} onChange={(event) => setCartColor(product.id, event.target.value)}>{colorOptions.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
                <div className="quantity-control"><button type="button" aria-label={`${product.name} 수량 줄이기`} disabled={soldOut || quantity <= product.minOrder} onClick={() => setQuantity(product.id, Math.max(product.minOrder, quantity - 1))}>−</button><strong aria-live="polite">{quantity}</strong><button type="button" aria-label={`${product.name} 수량 늘리기`} disabled={soldOut} onClick={() => setQuantity(product.id, quantity + 1)}>＋</button></div>
              </div>
              <div className="cart-item-price"><strong>{formatPrice(price * quantity)}</strong><button type="button" onClick={() => removeFromCart(product.id)}>삭제</button></div>
            </article>;
          })}
        </section>
        <aside className="order-summary"><h2>결제 예상금액</h2><dl><div><dt>상품금액</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>VAT</dt><dd>상품가격에 포함</dd></div><div><dt>배송비</dt><dd>주문서에서 확인</dd></div></dl><div className="total-row"><span>상품 합계</span><strong>{formatPrice(subtotal)}</strong></div><p className="implementation-note">무통장입금으로 주문을 접수합니다. 입금 계좌와 최종 배송비는 주문서에서 확인할 수 있습니다.</p>{hasSoldOutItems ? <p className="implementation-note" role="status">품절 상품을 삭제하면 주문서를 작성할 수 있습니다.</p> : <Link href="/checkout" className="primary-button full">주문서 작성</Link>}<Link href="/" className="text-link">상품 더 담기</Link></aside>
      </div>}
    </main>
  );
}
