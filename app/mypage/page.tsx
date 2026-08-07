"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/app/components/SafeLink";
import { useStore } from "@/app/components/StoreProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { formatPrice, type Product } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type ShippingAddress = {
  receiver?: string;
  phone?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  memo?: string;
};

type OrderItem = {
  sku: string;
  quantity: number;
};

type Order = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
};

const isSameMonth = (date: string, now: Date) => {
  const value = new Date(date);
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
};

export default function MyPage() {
  const { addToCart, favorites } = useStore();
  const { products } = useProducts();
  const { user, loading, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<ShippingAddress>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const loadAccount = async () => {
      const supabase = getSupabaseBrowserClient();
      const [profileResult, ordersResult] = await Promise.all([
        supabase.from("profiles").select("name,phone,default_shipping_address").eq("id", user.id).maybeSingle(),
        supabase.rpc("list_my_orders"),
      ]);
      if (!active) return;
      const profile = profileResult.data;
      setName(profile?.name || String(user.user_metadata?.name || ""));
      setPhone(profile?.phone || String(user.user_metadata?.phone || ""));
      setAddress((profile?.default_shipping_address as ShippingAddress | null) || {});
      setOrders(ordersResult.error ? [] : ((ordersResult.data || []) as Order[]));
      if (profileResult.error || ordersResult.error) {
        setMessage("일부 회원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        setMessageIsError(true);
      } else {
        setMessage("");
        setMessageIsError(false);
      }
      setProfileLoading(false);
      setOrdersLoading(false);
      setLoadedUserId(user.id);
    };
    void loadAccount();
    return () => { active = false; };
  }, [user]);

  const activeOrders = useMemo(() => orders.filter((order) => order.status !== "cancelled"), [orders]);
  const monthOrders = useMemo(() => {
    const now = new Date();
    return activeOrders.filter((order) => isSameMonth(order.created_at, now));
  }, [activeOrders]);
  const statusCounts = useMemo(() => ({
    pending: activeOrders.filter((order) => order.status === "pending_payment").length,
    paid: activeOrders.filter((order) => order.status === "paid").length,
    preparing: activeOrders.filter((order) => ["preparing", "shipped"].includes(order.status)).length,
    delivered: activeOrders.filter((order) => order.status === "delivered").length,
  }), [activeOrders]);
  const frequent = useMemo(() => {
    const counts = new Map<string, number>();
    activeOrders.forEach((order) => order.items.forEach((item) => counts.set(item.sku, (counts.get(item.sku) || 0) + item.quantity)));
    const ordered = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([sku]) => products.find((product) => product.sku === sku))
      .filter((product): product is Product => Boolean(product));
    if (ordered.length > 0) return ordered.slice(0, 3);
    return favorites.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)).slice(0, 3);
  }, [activeOrders, favorites, products]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    setMessageIsError(false);
    const { error } = await getSupabaseBrowserClient().rpc("save_my_profile", {
      p_profile: {
        name: name.trim(),
        phone: phone.trim(),
        default_shipping_address: address,
      },
    });
    setMessage(error ? "회원정보를 저장하지 못했습니다. 입력값을 확인해 주세요." : "회원정보를 저장했습니다.");
    setMessageIsError(Boolean(error));
    setSaving(false);
  };

  if (loading || (user && (profileLoading || ordersLoading || loadedUserId !== user.id))) {
    return <main id="main-content" className="store-main page-main"><div className="empty-state"><strong>회원정보를 확인하고 있습니다.</strong></div></main>;
  }

  if (!user) {
    return <main id="main-content" className="store-main page-main"><div className="empty-state"><strong>로그인이 필요한 페이지입니다.</strong><p>로그인하면 배송지와 주문 내역을 관리할 수 있습니다.</p><Link href="/login" className="primary-button">로그인하기</Link></div></main>;
  }

  const updateAddress = (key: keyof ShippingAddress, value: string) => setAddress((current) => ({ ...current, [key]: value }));
  const monthAmount = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <main id="main-content" className="store-main page-main">
      <section className="profile-header"><div><span className="profile-avatar">{(name || user.email || "회").slice(0, 1)}</span><div><p>진흥몰 회원</p><h1>{name || "내 계정"}</h1><span>{user.email}</span></div></div><button type="button" className="profile-signout" onClick={() => void signOut()}>로그아웃</button></section>

      <form className="profile-editor" onSubmit={saveProfile}>
        <div className="panel-heading"><div><p className="eyebrow">MEMBER PROFILE</p><h2>회원정보·기본 배송지</h2><p>주문서 작성 시 기본값으로 사용됩니다.</p></div></div>
        <div className="field-grid profile-field-grid">
          <label><span>이름</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required maxLength={60} /></label>
          <label><span>전화번호</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" required maxLength={30} /></label>
          <label><span>수령인</span><input value={address.receiver || ""} onChange={(event) => updateAddress("receiver", event.target.value)} autoComplete="name" maxLength={60} /></label>
          <label><span>배송지 연락처</span><input value={address.phone || ""} onChange={(event) => updateAddress("phone", event.target.value)} inputMode="tel" autoComplete="tel" maxLength={30} /></label>
          <label><span>우편번호</span><input value={address.postalCode || ""} onChange={(event) => updateAddress("postalCode", event.target.value)} inputMode="numeric" autoComplete="postal-code" maxLength={12} /></label>
          <label className="wide-field"><span>기본 주소</span><input value={address.address1 || ""} onChange={(event) => updateAddress("address1", event.target.value)} autoComplete="street-address" maxLength={200} /></label>
          <label className="wide-field"><span>상세 주소</span><input value={address.address2 || ""} onChange={(event) => updateAddress("address2", event.target.value)} autoComplete="address-line2" maxLength={200} /></label>
          <label className="wide-field"><span>배송 메모</span><input value={address.memo || ""} onChange={(event) => updateAddress("memo", event.target.value)} maxLength={200} /></label>
        </div>
        <div className="profile-save-row">{message && <p className={messageIsError ? "error" : ""} role={messageIsError ? "alert" : "status"}>{message}</p>}<button type="submit" className="primary-button" disabled={saving}>{saving ? "저장 중..." : "회원정보 저장"}</button></div>
      </form>

      <section className="month-summary"><div><span>이번 달 주문금액</span><strong>{formatPrice(monthAmount)}</strong><small>{monthOrders.length > 0 ? "취소 주문을 제외한 금액입니다." : "이번 달 주문 내역이 없습니다."}</small></div><div><span>이번 달 주문</span><strong>{monthOrders.length}건</strong><small>무통장입금 주문을 함께 집계합니다.</small></div><div><span>자주 주문</span><strong>{frequent.length}개</strong><small>주문 이력과 찜 목록을 기준으로 표시합니다.</small></div></section>
      <section className="dashboard-panel" aria-labelledby="order-progress-title"><div className="panel-heading"><div><p className="eyebrow">ORDER HISTORY</p><h2 id="order-progress-title">주문 현황</h2></div><Link href="/orders">전체보기</Link></div><div className="order-progress"><div className="progress-item"><b aria-hidden="true">01</b><span>입금 대기</span><strong>{statusCounts.pending}</strong></div><i aria-hidden="true" /><div className="progress-item"><b aria-hidden="true">02</b><span>입금 확인</span><strong>{statusCounts.paid}</strong></div><i aria-hidden="true" /><div className="progress-item"><b aria-hidden="true">03</b><span>배송 준비·배송중</span><strong>{statusCounts.preparing}</strong></div><i aria-hidden="true" /><div className="progress-item"><b aria-hidden="true">04</b><span>배송 완료</span><strong>{statusCounts.delivered}</strong></div></div></section>
      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">ONE-TAP REORDER</p><h2>자주 주문하는 상품</h2></div><Link href="/favorites">등록 상품 관리</Link></div>{frequent.length > 0 ? <div className="quick-reorder-list">{frequent.map((product, index) => {
        const soldOut = product.stock !== "확인 필요" && product.stockQuantity !== undefined && product.stockQuantity <= 0;
        return <article key={product.id}><div className="quick-product-placeholder">{product.image ? <img src={product.image} alt="" loading="lazy" /> : product.name}</div><div><span>{index + 1}위 · {soldOut ? "품절" : product.stock === "확인 필요" ? "재고 확인 필요" : "재주문 상품"}</span><strong>{product.name}</strong><small>{product.unit} · {product.salesUnit}</small></div><button type="button" disabled={soldOut} onClick={() => addToCart(product.id, product.minOrder)}>{soldOut ? "품절" : "바로 담기"}</button></article>;
      })}</div> : <div className="empty-state"><strong>아직 자주 주문한 상품이 없습니다.</strong><p>상품의 하트를 누르거나 첫 주문을 완료하면 이곳에 표시됩니다.</p><Link href="/" className="secondary-button">상품 둘러보기</Link></div>}</section>
    </main>
  );
}
