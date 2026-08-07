"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/app/components/SafeLink";
import { useAuth } from "@/app/components/AuthProvider";
import { useStore } from "@/app/components/StoreProvider";
import { useProducts } from "@/app/lib/use-products";
import { formatPrice } from "@/app/lib/products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type Address = { receiver?: string; phone?: string; postalCode?: string; address1?: string; address2?: string; memo?: string };
type OrderResult = { order_number: string; total_amount: number; shipping_fee: number; item_count: number };
type CheckoutSettings = {
  store_name: string;
  bank_name: string;
  bank_account: string;
  account_holder: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  minimum_order_amount: number;
  is_ordering_enabled: boolean;
  order_notice: string;
  support_phone: string;
};

const defaultSettings: CheckoutSettings = {
  store_name: "진흥몰",
  bank_name: "",
  bank_account: "",
  account_holder: "",
  shipping_fee: 0,
  free_shipping_threshold: 0,
  minimum_order_amount: 0,
  is_ordering_enabled: false,
  order_notice: "",
  support_phone: "",
};

const orderErrorMessage = (message: string) => {
  if (message.includes("insufficient stock")) return "선택한 상품의 재고가 부족합니다. 수량을 줄이거나 관리자에게 문의해 주세요.";
  if (message.includes("too many pending")) return "입금 대기 주문이 많습니다. 기존 주문을 확인한 뒤 다시 시도해 주세요.";
  if (message.includes("unavailable color")) return "선택한 색상을 주문할 수 없습니다. 장바구니에서 색상을 다시 선택해 주세요.";
  if (message.includes("color is required")) return "상품 색상을 선택한 뒤 다시 주문해 주세요.";
  if (message.includes("unavailable product")) return "현재 판매하지 않는 상품이 포함되어 있습니다. 장바구니를 확인해 주세요.";
  if (message.includes("minimum order amount")) return "최소 주문금액을 충족하지 못했습니다. 상품을 더 담아 주세요.";
  if (message.includes("ordering is currently disabled")) return "현재 주문 접수가 일시 중지되었습니다. 잠시 후 다시 이용해 주세요.";
  return "주문을 접수하지 못했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.";
};

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { products } = useProducts();
  const { cart, cartColors, cartSyncing, clearCart } = useStore();
  const items = useMemo(() => products.filter((product) => cart[product.id]), [cart, products]);
  const quantityFor = (product: (typeof items)[number]) => Math.max(product.minOrder, cart[product.id] || 0);
  const subtotal = items.reduce((sum, product) => sum + product.consumerPrice * quantityFor(product), 0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [depositor, setDepositor] = useState("");
  const [address, setAddress] = useState<Address>({});
  const [settings, setSettings] = useState<CheckoutSettings>(defaultSettings);
  const [settingsError, setSettingsError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState<OrderResult | null>(null);
  const [completedUserId, setCompletedUserId] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);
  const requestUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const loadCheckout = async () => {
      const supabase = getSupabaseBrowserClient();
      const [profileResult, settingsResult] = await Promise.all([
        supabase.from("profiles").select("name,phone,default_shipping_address").eq("id", user.id).maybeSingle(),
        supabase.rpc("get_checkout_settings"),
      ]);
      if (!active) return;
      const profile = profileResult.data;
      const saved = (profile?.default_shipping_address as Address | null) || {};
      const savedName = profile?.name || String(user.user_metadata?.name || "");
      setName(savedName);
      setPhone(profile?.phone || String(user.user_metadata?.phone || ""));
      setDepositor(savedName);
      setAddress(saved);
      if (settingsResult.error || !settingsResult.data) {
        setSettingsError("주문 설정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setSettings(settingsResult.data as CheckoutSettings);
        setSettingsError("");
        setError("");
      }
      setProfileLoading(false);
      setLoadedUserId(user.id);
    };
    void loadCheckout();
    return () => { active = false; };
  }, [user]);

  const updateAddress = (key: keyof Address, value: string) => setAddress((current) => ({ ...current, [key]: value }));
  const shippingFee = settings.shipping_fee > 0 && (settings.free_shipping_threshold <= 0 || subtotal < settings.free_shipping_threshold) ? settings.shipping_fee : 0;
  const estimatedTotal = subtotal + shippingFee;
  const belowMinimumAmount = subtotal < settings.minimum_order_amount;
  const unavailableItem = items.find((product) => product.stock !== "확인 필요" && product.stockQuantity !== undefined && quantityFor(product) > product.stockQuantity);
  const orderingBlocked = Boolean(settingsError) || !settings.is_ordering_enabled || belowMinimumAmount || Boolean(unavailableItem);

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !items.length || cartSyncing) return;
    if (settingsError) { setError(settingsError); return; }
    if (!settings.is_ordering_enabled) { setError("현재 주문 접수가 일시 중지되었습니다. 잠시 후 다시 이용해 주세요."); return; }
    if (belowMinimumAmount) { setError(`최소 주문금액은 ${formatPrice(settings.minimum_order_amount)}입니다.`); return; }
    if (unavailableItem) { setError(`${unavailableItem.name}의 주문 가능 재고를 확인해 주세요.`); return; }
    setSubmitting(true);
    setError("");
    if (!requestId.current || requestUserId.current !== user.id) {
      requestId.current = crypto.randomUUID();
      requestUserId.current = user.id;
    }
    const payload = items.map((product) => ({ sku: product.sku, quantity: quantityFor(product), color: cartColors[product.id] || product.color.split(",")[0]?.trim() || "" }));
    const { data, error: rpcError } = await getSupabaseBrowserClient().rpc("create_bank_transfer_order", {
      p_customer: { name: name.trim(), phone: phone.trim(), depositor_name: depositor.trim(), shipping_address: address },
      p_items: payload,
      p_client_request_id: requestId.current,
    });
    if (rpcError) {
      setError(orderErrorMessage(rpcError.message));
      setSubmitting(false);
      return;
    }
    clearCart();
    setCompleted(data as OrderResult);
    setCompletedUserId(user.id);
    setSubmitting(false);
  };

  if (loading || (user && (profileLoading || loadedUserId !== user.id))) return <main id="main-content" className="store-main page-main narrow-page"><div className="empty-state"><strong>주문 정보를 준비하고 있습니다.</strong></div></main>;
  if (!user) return <main id="main-content" className="store-main page-main narrow-page"><div className="empty-state"><strong>로그인이 필요합니다.</strong><p>주문내역과 배송지를 안전하게 저장하기 위해 로그인해 주세요.</p><Link href="/login?returnTo=%2Fcheckout" className="primary-button">로그인하기</Link></div></main>;
  if (completed && completedUserId === user.id) return <main id="main-content" className="store-main page-main narrow-page"><section className="order-complete" aria-live="polite"><span>주문 접수 완료</span><h1>{completed.order_number}</h1><p>무통장입금 주문이 접수되었습니다. 아래 계좌로 입금하면 관리자가 확인 후 배송을 준비합니다.</p>{settings.bank_account ? <div className="completed-bank-account"><span>{settings.bank_name}</span><strong>{settings.bank_account}</strong><small>예금주 {settings.account_holder}</small></div> : <div className="completed-bank-account"><strong>입금 계좌는 주문 확인 후 안내합니다.</strong>{settings.support_phone && <small>문의 {settings.support_phone}</small>}</div>}<dl><div><dt>주문 상품</dt><dd>{completed.item_count}종</dd></div><div><dt>결제금액</dt><dd>{formatPrice(completed.total_amount)}</dd></div><div><dt>결제방법</dt><dd>무통장입금</dd></div></dl><div><Link href="/orders" className="primary-button">주문내역 확인</Link><Link href="/" className="secondary-button">쇼핑 계속하기</Link></div></section></main>;
  if (!items.length) return <main id="main-content" className="store-main page-main narrow-page"><div className="empty-state"><strong>주문할 상품이 없습니다.</strong><Link href="/" className="primary-button">상품 보러가기</Link></div></main>;

  return <main id="main-content" className="store-main page-main narrow-page checkout-page">
    <div className="page-title-row"><p className="eyebrow">BANK TRANSFER ORDER</p><h1>주문서 작성</h1><p>배송지와 입금자명을 확인하면 주문이 접수됩니다.</p></div>
    <form className="checkout-layout" onSubmit={submitOrder}>
      <section className="checkout-form-panel">
        <div className="checkout-section"><h2>주문자 정보</h2><div className="field-grid"><label><span>주문자명</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={60} /></label><label><span>연락처</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" required maxLength={30} /></label></div></div>
        <div className="checkout-section"><h2>배송지</h2><div className="field-grid"><label><span>수령인</span><input value={address.receiver || ""} onChange={(event) => updateAddress("receiver", event.target.value)} autoComplete="name" required maxLength={60} /></label><label><span>배송지 연락처</span><input value={address.phone || ""} onChange={(event) => updateAddress("phone", event.target.value)} inputMode="tel" autoComplete="tel" required maxLength={30} /></label><label><span>우편번호</span><input value={address.postalCode || ""} onChange={(event) => updateAddress("postalCode", event.target.value)} inputMode="numeric" autoComplete="postal-code" maxLength={12} /></label><label className="wide-field"><span>주소</span><input value={address.address1 || ""} onChange={(event) => updateAddress("address1", event.target.value)} autoComplete="street-address" required maxLength={200} /></label><label className="wide-field"><span>상세 주소</span><input value={address.address2 || ""} onChange={(event) => updateAddress("address2", event.target.value)} autoComplete="address-line2" maxLength={200} /></label><label className="wide-field"><span>배송 메모</span><input value={address.memo || ""} onChange={(event) => updateAddress("memo", event.target.value)} placeholder="예: 출고 전 연락 부탁드립니다." maxLength={200} /></label></div></div>
        <div className="checkout-section"><h2>무통장입금</h2><label className="checkout-depositor"><span>입금자명</span><input value={depositor} onChange={(event) => setDepositor(event.target.value)} required maxLength={60} /><small>주문자명과 다르면 실제 입금자명을 적어주세요.</small></label><div className="bank-guide">{settings.bank_account ? <><strong>{settings.bank_name} {settings.bank_account}</strong><p>예금주 {settings.account_holder}</p></> : <><strong>입금 계좌는 주문 확인 후 안내합니다.</strong><p>등록하신 연락처로 입금 정보를 안내합니다.</p></>}{settings.order_notice && <p>{settings.order_notice}</p>}</div></div>
      </section>
      <aside className="order-summary checkout-summary"><h2>주문 상품</h2><div className="checkout-items">{items.map((product) => <div key={product.id}><span>{product.name}<small>{cartColors[product.id] || product.color.split(",")[0]} · {quantityFor(product)}{product.salesUnit}</small></span><strong>{formatPrice(product.consumerPrice * quantityFor(product))}</strong></div>)}</div><dl><div><dt>상품금액</dt><dd>{formatPrice(subtotal)}</dd></div><div><dt>VAT</dt><dd>포함</dd></div><div><dt>배송비</dt><dd>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</dd></div></dl>{settings.free_shipping_threshold > 0 && <p className="shipping-threshold-note">{formatPrice(settings.free_shipping_threshold)} 이상 주문 시 무료배송</p>}{settings.minimum_order_amount > 0 && <p className="shipping-threshold-note">최소 주문금액 {formatPrice(settings.minimum_order_amount)}</p>}<div className="total-row"><span>최종 결제금액</span><strong>{formatPrice(estimatedTotal)}</strong></div>{settingsError && <p className="form-error" role="alert">{settingsError}</p>}{!settingsError && !settings.is_ordering_enabled && <p className="form-error" role="status">현재 주문 접수가 일시 중지되었습니다.</p>}{!settingsError && settings.is_ordering_enabled && belowMinimumAmount && <p className="form-error" role="status">최소 주문금액까지 {formatPrice(settings.minimum_order_amount - subtotal)} 남았습니다.</p>}{unavailableItem && <p className="form-error" role="status">{unavailableItem.name}의 재고를 확인해 주세요.</p>}{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button full" type="submit" disabled={submitting || cartSyncing || orderingBlocked}>{submitting ? "주문 접수 중..." : cartSyncing ? "장바구니 저장 중..." : "무통장입금 주문하기"}</button><Link href="/cart" className="text-link">장바구니로 돌아가기</Link></aside>
    </form>
  </main>;
}
