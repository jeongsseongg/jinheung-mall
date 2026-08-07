"use client";

import Link from "@/app/components/SafeLink";
import { formatPrice } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { useStore } from "@/app/components/StoreProvider";
import { useAuth } from "@/app/components/AuthProvider";

export default function CartPage() {
  const { products } = useProducts();
  const { user } = useAuth();
  const { cart, cartColors, cartSyncing, setQuantity, setCartColor, removeFromCart } = useStore();
  const items = products.filter((product) => cart[product.id]);
  const subtotal = items.reduce((sum, product) => sum + product.consumerPrice * cart[product.id], 0);

  return (
    <main className="store-main page-main narrow-page">
      <div className="page-title-row split"><div><p className="eyebrow">YOUR CART</p><h1>장바구니</h1><p>{user ? "로그인 계정에 수량과 색상을 저장합니다." : "로그인하면 다른 기기에서도 장바구니를 이어볼 수 있습니다."}</p></div>{user && <span className={`cart-sync-status ${cartSyncing ? "syncing" : ""}`}>{cartSyncing ? "저장 중" : "계정 저장됨"}</span>}</div>
      {items.length === 0 ? <div className="empty-state"><strong>장바구니가 비어 있습니다.</strong><p>필요한 조화를 둘러보고 간편하게 담아보세요.</p><Link href="/" className="primary-button">상품 보러가기</Link></div> : <div className="cart-layout">
        <section className="cart-items">
          <div className="cart-section-head"><strong>진흥조화 직영상품</strong><span>{items.length}종</span></div>
          {items.map((product) => {
            const price = product.consumerPrice;
            const colorOptions = product.color.split(",").map((color) => color.trim()).filter(Boolean);
            return <article className="cart-item" key={product.id}>
              <div className="cart-item-placeholder">{product.image ? <img src={product.image} alt="" loading="lazy" decoding="async" /> : product.name}</div>
              <div className="cart-item-copy">
                <span>{product.category}</span>
                <Link href={`/products/${product.id}`}>{product.name}</Link>
                <small>{product.unit} / 최소 {product.minOrder}{product.salesUnit}</small>
                <label className="cart-color-select"><span>색상</span><select value={cartColors[product.id] || colorOptions[0] || ""} onChange={(event) => setCartColor(product.id, event.target.value)}>{colorOptions.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
                <div className="quantity-control"><button type="button" onClick={() => setQuantity(product.id, cart[product.id] - 1)}>−</button><strong>{cart[product.id]}</strong><button type="button" onClick={() => setQuantity(product.id, cart[product.id] + 1)}>＋</button></div>
              </div>
              <div className="cart-item-price"><strong>{formatPrice(price * cart[product.id])}</strong><button type="button" onClick={() => removeFromCart(product.id)}>삭제</button></div>
            </article>;
          })}
        </section>
        <aside className="order-summary"><h2>결제 예상금액</h2><dl><div><dt>상품금액</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>VAT</dt><dd>상품가격에 포함</dd></div><div><dt>배송비</dt><dd>현재 0원</dd></div></dl><div className="total-row"><span>결제 예정금액</span><strong>{formatPrice(subtotal)}</strong></div><p className="implementation-note">현재 무통장입금으로 주문을 접수합니다. 입금 계좌는 주문 확인 후 안내합니다.</p><Link href="/checkout" className="primary-button full">주문서 작성</Link><Link href="/" className="text-link">상품 더 담기</Link></aside>
      </div>}
    </main>
  );
}
