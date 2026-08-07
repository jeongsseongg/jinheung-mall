"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { useStore } from "@/app/components/StoreProvider";
import { useProducts } from "@/app/lib/use-products";
import { formatPrice } from "@/app/lib/products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type Address = { receiver?: string; phone?: string; postalCode?: string; address1?: string; address2?: string; memo?: string };
type OrderResult = { order_number: string; total_amount: number; item_count: number };

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { products } = useProducts();
  const { cart, cartColors, clearCart } = useStore();
  const items = useMemo(() => products.filter((product) => cart[product.id]), [cart, products]);
  const subtotal = items.reduce((sum, product) => sum + product.consumerPrice * cart[product.id], 0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [depositor, setDepositor] = useState("");
  const [address, setAddress] = useState<Address>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<OrderResult | null>(null);

  useEffect(() => {
    if (!user) { setProfileLoading(false); return; }
    let active = true;
    getSupabaseBrowserClient().from("profiles").select("name,phone,default_shipping_address").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (!active) return;
      const saved = (data?.default_shipping_address as Address | null) || {};
      setName(data?.name || String(user.user_metadata?.name || ""));
      setPhone(data?.phone || String(user.user_metadata?.phone || ""));
      setDepositor(data?.name || String(user.user_metadata?.name || ""));
      setAddress(saved);
      setProfileLoading(false);
    });
    return () => { active = false; };
  }, [user]);

  const updateAddress = (key: keyof Address, value: string) => setAddress((current) => ({ ...current, [key]: value }));

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !items.length) return;
    setSubmitting(true);
    setError("");
    const payload = items.map((product) => ({ sku: product.sku, quantity: cart[product.id], color: cartColors[product.id] || product.color.split(",")[0]?.trim() || "" }));
    const { data, error: rpcError } = await getSupabaseBrowserClient().rpc("create_bank_transfer_order", {
      p_customer: { name: name.trim(), phone: phone.trim(), email: user.email || "", depositor_name: depositor.trim(), shipping_address: address },
      p_items: payload,
    });
    if (rpcError) {
      setError("주문을 접수하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해주세요.");
      setSubmitting(false);
      return;
    }
    clearCart();
    setCompleted(data as OrderResult);
    setSubmitting(false);
  };

  if (loading || profileLoading) return <main className="store-main page-main narrow-page"><div className="empty-state"><strong>주문 정보를 준비하고 있습니다.</strong></div></main>;
  if (!user) return <main className="store-main page-main narrow-page"><div className="empty-state"><strong>로그인이 필요합니다.</strong><p>주문내역과 배송지를 안전하게 저장하기 위해 로그인해주세요.</p><Link href="/login" className="primary-button">로그인하기</Link></div></main>;
  if (completed) return <main className="store-main page-main narrow-page"><section className="order-complete"><span>주문 접수 완료</span><h1>{completed.order_number}</h1><p>무통장입금 주문이 접수되었습니다. 입금 계좌와 최종 확인 내용은 등록하신 연락처로 안내합니다.</p><dl><div><dt>주문 상품</dt><dd>{completed.item_count}종</dd></div><div><dt>결제금액</dt><dd>{formatPrice(completed.total_amount)}</dd></div><div><dt>결제방법</dt><dd>무통장입금</dd></div></dl><div><Link href="/orders" className="primary-button">주문내역 확인</Link><Link href="/" className="secondary-button">쇼핑 계속하기</Link></div></section></main>;
  if (!items.length) return <main className="store-main page-main narrow-page"><div className="empty-state"><strong>주문할 상품이 없습니다.</strong><Link href="/" className="primary-button">상품 보러가기</Link></div></main>;

  return <main className="store-main page-main narrow-page checkout-page">
    <div className="page-title-row"><p className="eyebrow">BANK TRANSFER ORDER</p><h1>주문서 작성</h1><p>배송지와 입금자명을 확인하면 바로 주문이 접수됩니다.</p></div>
    <form className="checkout-layout" onSubmit={submitOrder}>
      <section className="checkout-form-panel">
        <div className="checkout-section"><h2>주문자 정보</h2><div className="field-grid"><label><span>주문자명</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label><label><span>연락처</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" required /></label></div></div>
        <div className="checkout-section"><h2>배송지</h2><div className="field-grid"><label><span>수령인</span><input value={address.receiver || ""} onChange={(event) => updateAddress("receiver", event.target.value)} required /></label><label><span>배송지 연락처</span><input value={address.phone || ""} onChange={(event) => updateAddress("phone", event.target.value)} inputMode="tel" required /></label><label><span>우편번호</span><input value={address.postalCode || ""} onChange={(event) => updateAddress("postalCode", event.target.value)} inputMode="numeric" /></label><label className="wide-field"><span>주소</span><input value={address.address1 || ""} onChange={(event) => updateAddress("address1", event.target.value)} required /></label><label className="wide-field"><span>상세 주소</span><input value={address.address2 || ""} onChange={(event) => updateAddress("address2", event.target.value)} /></label><label className="wide-field"><span>배송 메모</span><input value={address.memo || ""} onChange={(event) => updateAddress("memo", event.target.value)} placeholder="예: 출고 전 연락 부탁드립니다." /></label></div></div>
        <div className="checkout-section"><h2>무통장입금</h2><label className="checkout-depositor"><span>입금자명</span><input value={depositor} onChange={(event) => setDepositor(event.target.value)} required /><small>주문자명과 다르면 실제 입금자명을 적어주세요.</small></label><div className="bank-guide"><strong>입금 계좌는 주문 확인 후 안내합니다.</strong><p>자동 입금 확인 연동 전까지 관리자가 주문을 확인해 연락처로 안내합니다.</p></div></div>
      </section>
      <aside className="order-summary checkout-summary"><h2>주문 상품</h2><div className="checkout-items">{items.map((product) => <div key={product.id}><span>{product.name}<small>{cartColors[product.id] || product.color.split(",")[0]} · {cart[product.id]}{product.salesUnit}</small></span><strong>{formatPrice(product.consumerPrice * cart[product.id])}</strong></div>)}</div><dl><div><dt>상품금액</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>VAT</dt><dd>포함</dd></div><div><dt>배송비</dt><dd>0원</dd></div></dl><div className="total-row"><span>최종 결제금액</span><strong>{formatPrice(subtotal)}</strong></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button full" type="submit" disabled={submitting}>{submitting ? "주문 접수 중..." : "무통장입금 주문하기"}</button><Link href="/cart" className="text-link">장바구니로 돌아가기</Link></aside>
    </form>
  </main>;
}
