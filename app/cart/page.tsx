"use client";

import Link from "next/link";
import { formatPrice } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { useStore } from "@/app/components/StoreProvider";

export default function CartPage() {
  const { products } = useProducts();
  const { cart, setQuantity, removeFromCart } = useStore();
  const items = products.filter((product) => cart[product.id]);
  const subtotal = items.reduce((sum, product) => sum + product.consumerPrice * cart[product.id], 0);
  const estimatedVat = Math.round(subtotal * 0.1);

  return (
    <main className="store-main page-main narrow-page">
      <div className="page-title-row"><div><p className="eyebrow">YOUR CART</p><h1>장바구니</h1><p>판매단위와 최소 주문수량을 확인해주세요.</p></div></div>
      {items.length === 0 ? <div className="empty-state"><strong>장바구니가 비어 있습니다.</strong><p>필요한 조화를 둘러보고 간편하게 담아보세요.</p><Link href="/" className="primary-button">상품 보러가기</Link></div> : <div className="cart-layout">
        <section className="cart-items">
          <div className="cart-section-head"><strong>진흥조화 직영상품</strong><span>{items.length}종</span></div>
          {items.map((product) => {
            const price = product.consumerPrice;
            return <article className="cart-item" key={product.id}><div className="cart-item-placeholder">{product.name}</div><div className="cart-item-copy"><span>{product.category} · {product.color}</span><Link href={`/products/${product.id}`}>{product.name}</Link><small>{product.unit} / 최소 {product.minOrder}{product.salesUnit}</small><div className="quantity-control"><button type="button" onClick={() => setQuantity(product.id, cart[product.id] - 1)}>−</button><strong>{cart[product.id]}</strong><button type="button" onClick={() => setQuantity(product.id, cart[product.id] + 1)}>＋</button></div></div><div className="cart-item-price"><strong>{formatPrice(price * cart[product.id])}</strong><button type="button" onClick={() => removeFromCart(product.id)}>삭제</button></div></article>;
          })}
        </section>
        <aside className="order-summary"><h2>결제 예상금액</h2><dl><div><dt>상품금액</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>예상 VAT</dt><dd>{formatPrice(estimatedVat)}</dd></div><div><dt>배송비</dt><dd>관리자 설정 예정</dd></div></dl><div className="total-row"><span>예상 합계</span><strong>{formatPrice(subtotal + estimatedVat)}</strong></div><p className="implementation-note">실제 VAT·배송비·최소주문 조건은 정책 확정 후 API와 관리자 설정에 연결합니다.</p><button type="button" className="primary-button full">주문서 작성</button><Link href="/" className="text-link">상품 더 담기</Link></aside>
      </div>}
    </main>
  );
}
