"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/app/components/StoreProvider";
import { useAuth } from "@/app/components/AuthProvider";
import { formatPrice } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type ShippingAddress = {
  receiver?: string;
  phone?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
};

export default function MyPage() {
  const { addToCart } = useStore();
  const { products } = useProducts();
  const { user, loading, signOut } = useAuth();
  const frequent = products.slice(0, 3);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<ShippingAddress>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    let active = true;
    getSupabaseBrowserClient()
      .from("profiles")
      .select("name,phone,default_shipping_address")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setName(data?.name || String(user.user_metadata?.name || ""));
        setPhone(data?.phone || String(user.user_metadata?.phone || ""));
        setAddress((data?.default_shipping_address as ShippingAddress | null) || {});
        setProfileLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    const { error } = await getSupabaseBrowserClient().from("profiles").upsert({
      id: user.id,
      email: user.email,
      name: name.trim(),
      phone: phone.trim(),
      default_shipping_address: address,
    }, { onConflict: "id" });
    setMessage(error ? "저장하지 못했습니다. 회원 SQL 적용 여부를 확인해주세요." : "회원정보를 저장했습니다.");
    setSaving(false);
  };

  if (loading || profileLoading) {
    return <main className="store-main page-main"><div className="empty-state"><strong>회원정보를 확인하고 있습니다.</strong></div></main>;
  }

  if (!user) {
    return <main className="store-main page-main"><div className="empty-state"><strong>로그인이 필요한 페이지입니다.</strong><p>로그인하면 배송지와 주문 내역을 관리할 수 있습니다.</p><Link href="/login" className="primary-button">로그인하기</Link></div></main>;
  }

  const updateAddress = (key: keyof ShippingAddress, value: string) => setAddress((current) => ({ ...current, [key]: value }));

  return (
    <main className="store-main page-main">
      <section className="profile-header"><div><span className="profile-avatar">{(name || user.email || "회").slice(0, 1)}</span><div><p>진흥몰 회원</p><h1>{name || "내 계정"}</h1><span>{user.email}</span></div></div><button type="button" className="profile-signout" onClick={() => void signOut()}>로그아웃</button></section>

      <form className="profile-editor" onSubmit={saveProfile}>
        <div className="panel-heading"><div><p className="eyebrow">MEMBER PROFILE</p><h2>회원정보·기본 배송지</h2><p>주문서 작성 시 기본값으로 사용됩니다.</p></div></div>
        <div className="field-grid profile-field-grid">
          <label><span>이름</span><input value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <label><span>전화번호</span><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" required /></label>
          <label><span>수령인</span><input value={address.receiver || ""} onChange={(event) => updateAddress("receiver", event.target.value)} /></label>
          <label><span>배송지 연락처</span><input value={address.phone || ""} onChange={(event) => updateAddress("phone", event.target.value)} inputMode="tel" /></label>
          <label><span>우편번호</span><input value={address.postalCode || ""} onChange={(event) => updateAddress("postalCode", event.target.value)} inputMode="numeric" /></label>
          <label className="wide-field"><span>기본 주소</span><input value={address.address1 || ""} onChange={(event) => updateAddress("address1", event.target.value)} /></label>
          <label className="wide-field"><span>상세 주소</span><input value={address.address2 || ""} onChange={(event) => updateAddress("address2", event.target.value)} /></label>
        </div>
        <div className="profile-save-row">{message && <p role="status">{message}</p>}<button type="submit" className="primary-button" disabled={saving}>{saving ? "저장 중..." : "회원정보 저장"}</button></div>
      </form>

      <section className="month-summary"><div><span>이번 달 주문금액</span><strong>{formatPrice(0)}</strong><small>주문 내역이 없습니다.</small></div><div><span>주문 건수</span><strong>0건</strong><small>무통장 입금 주문도 함께 확인합니다.</small></div><div><span>자주 주문</span><strong>{frequent.length}개</strong><small>바로 장바구니에 담을 수 있습니다.</small></div></section>
      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">ORDER HISTORY</p><h2>주문 현황</h2></div><Link href="/orders">전체보기</Link></div><div className="order-progress"><div className="progress-item"><b>01</b><span>입금 대기</span><strong>0</strong></div><i /><div className="progress-item"><b>02</b><span>입금 확인</span><strong>0</strong></div><i /><div className="progress-item"><b>03</b><span>배송 준비</span><strong>0</strong></div><i /><div className="progress-item"><b>04</b><span>배송 완료</span><strong>0</strong></div></div></section>
      <section className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">ONE-TAP REORDER</p><h2>자주 주문하는 상품</h2></div><Link href="/favorites">등록 상품 관리</Link></div><div className="quick-reorder-list">{frequent.map((product, index) => <article key={product.id}><div className="quick-product-placeholder">{product.name}</div><div><span>{index + 1}위 · 주문 가능</span><strong>{product.name}</strong><small>{product.unit} · {product.salesUnit}</small></div><button type="button" onClick={() => addToCart(product.id, product.minOrder)}>바로 담기</button></article>)}</div></section>
    </main>
  );
}
