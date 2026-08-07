"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useProducts } from "@/app/lib/use-products";
import { useAuth } from "@/app/components/AuthProvider";
import { formatPrice } from "@/app/lib/products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  depositor_name: string;
  status: string;
  payment_status: string;
  total_amount: number;
  tracking_number: string | null;
  courier_code: string | null;
  created_at: string;
  item_count: number;
  is_new: boolean;
};

type AdminTab = "products" | "orders" | "security";

const statuses = [
  ["pending_payment", "입금 대기"], ["paid", "입금 확인"], ["preparing", "배송 준비"],
  ["shipped", "배송중"], ["delivered", "배송완료"], ["cancelled", "주문 취소"],
] as const;

export default function AdminPage() {
  const { products } = useProducts();
  const { user, loading, changePassword } = useAuth();
  const [tab, setTab] = useState<AdminTab>("products");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [adminError, setAdminError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, { status: string; courier: string; tracking: string }>>({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const notifiedOrderIds = useRef(new Set<string>());

  const loadOrders = async () => {
    if (!user) { setOrdersLoading(false); return; }
    setOrdersLoading(true);
    const { data, error } = await getSupabaseBrowserClient().rpc("list_admin_orders");
    if (error) setAdminError("현재 계정에는 관리자 권한이 없거나 주문 정보를 불러오지 못했습니다.");
    else {
      const next = (data || []) as AdminOrder[];
      setOrders(next);
      setDrafts(Object.fromEntries(next.map((order) => [order.id, { status: order.status, courier: order.courier_code || "", tracking: order.tracking_number || "" }])));
      setAdminError("");
      const unnotified = next.filter((order) => order.is_new && !notifiedOrderIds.current.has(order.id));
      if (unnotified.length > 0 && "Notification" in window && Notification.permission === "granted") {
        new Notification("진흥몰 새 주문", { body: `새 주문 ${unnotified.length}건이 접수되었습니다.` });
      }
      unnotified.forEach((order) => notifiedOrderIds.current.add(order.id));
    }
    setOrdersLoading(false);
  };

  useEffect(() => { if (!loading) void loadOrders(); }, [loading, user?.id]);

  const metrics = useMemo(() => ({
    today: orders.filter((order) => new Date(order.created_at).toDateString() === new Date().toDateString()).length,
    pending: orders.filter((order) => order.status === "pending_payment").length,
    preparing: orders.filter((order) => ["paid", "preparing"].includes(order.status)).length,
  }), [orders]);
  const newCount = orders.filter((order) => order.is_new).length;

  const updateDraft = (id: string, key: "status" | "courier" | "tracking", value: string) => setDrafts((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));

  const saveOrder = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    const { error } = await getSupabaseBrowserClient().rpc("update_admin_order", { p_order_id: id, p_status: draft.status, p_courier_code: draft.courier || null, p_tracking_number: draft.tracking || null });
    if (error) setAdminError("주문 상태를 변경하지 못했습니다.");
    else await loadOrders();
    setSavingId("");
  };

  const markOrdersSeen = async () => {
    const { error } = await getSupabaseBrowserClient().rpc("mark_admin_orders_seen");
    if (error) setAdminError("새 주문 확인 상태를 저장하지 못했습니다.");
    else await loadOrders();
  };

  const enableBrowserNotifications = async () => {
    if (!("Notification" in window)) { setNotificationMessage("이 브라우저는 알림을 지원하지 않습니다."); return; }
    const permission = await Notification.requestPermission();
    setNotificationMessage(permission === "granted" ? "관리자 페이지가 열려 있을 때 새 주문 알림을 표시합니다." : "브라우저 설정에서 알림 권한을 허용해 주세요.");
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(""); setPasswordMessage("");
    if (newPassword.length < 8) { setPasswordError("새 비밀번호는 8자 이상 입력해 주세요."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("새 비밀번호 확인이 일치하지 않습니다."); return; }
    setPasswordSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    setPasswordSaving(false);
    if (result.error) { setPasswordError(result.error); return; }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setPasswordMessage("비밀번호가 안전하게 변경되었습니다.");
  };

  if (loading) return <main className="store-main page-main"><div className="empty-state"><strong>관리자 계정을 확인하고 있습니다.</strong></div></main>;
  if (!user) return <main className="store-main page-main"><div className="empty-state"><strong>관리자 로그인이 필요합니다.</strong><a href="/login" className="primary-button">로그인하기</a></div></main>;

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo"><span className="brand-mark">JH</span><div><strong>진흥몰 관리자</strong><small>ADMIN CONSOLE</small></div></div>
        <nav>
          <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>상품 관리</button>
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>주문 관리{newCount > 0 && <b>{newCount}</b>}</button>
          <button className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}>계정 보안</button>
        </nav>
        <a href="/">← 쇼핑몰로 돌아가기</a>
      </aside>
      <section className="admin-content">
        <header><div><p>ADMIN</p><h1>운영 현황</h1></div><div className="admin-user">{user.email}<span>진</span></div></header>
        {adminError && <div className="admin-alert"><span>!</span><div><strong>{adminError}</strong><p>관리자 권한과 Supabase 연결 상태를 확인해 주세요.</p></div></div>}
        {newCount > 0 && <div className="admin-new-order-alert"><div><strong>새 주문 {newCount}건이 있습니다.</strong><p>주문 내용을 확인한 뒤 확인 완료를 눌러 주세요.</p></div><button type="button" onClick={() => void markOrdersSeen()}>새 주문 확인 완료</button></div>}
        <section className="admin-metrics"><article><span>오늘 주문</span><strong>{metrics.today}건</strong><small>오늘 접수된 주문</small></article><article><span>입금 대기</span><strong>{metrics.pending}건</strong><small>무통장입금 확인 전</small></article><article><span>배송 준비</span><strong>{metrics.preparing}건</strong><small>운송장 발급 대기</small></article><article><span>재고 확인</span><strong>{products.filter((product) => product.stock === "확인 필요").length}개</strong><small>재고 확인 필요 상품</small></article></section>
        <div className="admin-tabs"><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>상품 관리</button><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>주문 관리</button><button className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}>계정 보안</button></div>

        {tab === "products" && <section className="admin-table-panel"><div className="panel-heading"><div><h2>상품 관리</h2><p>상품명, 가격, 색상 그룹, 부쉬·재고와 판매 단위를 관리합니다.</p></div><button type="button" className="primary-button">+ 상품 등록</button></div><div className="admin-table product-admin-table"><div className="table-row table-head"><span>상품</span><span>판매가</span><span>판매 단위</span><span>재고</span><span>관리</span></div>{products.slice(0, 8).map((product) => <div className="table-row" key={product.id}><span className="admin-product"><div className="admin-product-placeholder">{product.name}</div><strong>{product.name}</strong></span><span>{formatPrice(product.consumerPrice)}</span><span>{product.salesUnit} · {product.unit}</span><span>{product.stock}</span><span><button type="button" className="line-button">수정</button></span></div>)}</div></section>}

        {tab === "orders" && <section className="admin-table-panel"><div className="panel-heading"><div><h2>주문 관리</h2><p>입금 확인 후 상태를 변경하고 택배사와 운송장을 입력합니다.</p></div><div className="admin-order-actions"><button className="line-button" type="button" onClick={() => void enableBrowserNotifications()}>브라우저 알림 켜기</button><button className="secondary-button" type="button" onClick={() => void loadOrders()}>새로고침</button></div></div>{notificationMessage && <p className="admin-notification-note">{notificationMessage}</p>}{ordersLoading ? <div className="empty-state"><strong>주문을 불러오고 있습니다.</strong></div> : adminError ? <div className="empty-state"><strong>관리자 권한을 확인해 주세요.</strong></div> : orders.length === 0 ? <div className="empty-state"><strong>아직 주문이 없습니다.</strong></div> : <div className="admin-order-list">{orders.map((order) => { const draft = drafts[order.id] || { status: order.status, courier: "", tracking: "" }; return <article className={order.is_new ? "new-order" : ""} key={order.id}><div className="admin-order-primary"><span>{order.is_new && <b>NEW</b>} {new Date(order.created_at).toLocaleString("ko-KR")}</span><strong>{order.order_number}</strong><p>{order.customer_name} · {order.customer_phone}</p><small>입금자 {order.depositor_name} · {order.item_count}종 · {formatPrice(order.total_amount)}</small></div><label><span>상태</span><select value={draft.status} onChange={(event) => updateDraft(order.id, "status", event.target.value)}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>택배사</span><input value={draft.courier} onChange={(event) => updateDraft(order.id, "courier", event.target.value)} placeholder="예: CJ대한통운" /></label><label><span>운송장</span><input value={draft.tracking} onChange={(event) => updateDraft(order.id, "tracking", event.target.value)} inputMode="numeric" /></label><button type="button" className="approve-button" disabled={savingId === order.id} onClick={() => void saveOrder(order.id)}>{savingId === order.id ? "저장 중" : "변경 저장"}</button></article>; })}</div>}</section>}

        {tab === "security" && <section className="admin-security-panel"><div><p>ACCOUNT SECURITY</p><h2>관리자 비밀번호 변경</h2><span>현재 비밀번호를 다시 확인한 후 새 비밀번호로 변경합니다. 비밀번호는 코드나 데이터베이스에 평문으로 저장되지 않습니다.</span></div><form onSubmit={submitPassword} className="admin-security-form"><label><span>현재 비밀번호</span><input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label><span>새 비밀번호</span><input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /></label><label><span>새 비밀번호 확인</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></label>{passwordError && <p className="form-error">{passwordError}</p>}{passwordMessage && <p className="form-success">{passwordMessage}</p>}<button type="submit" className="primary-button" disabled={passwordSaving}>{passwordSaving ? "변경 중" : "비밀번호 변경"}</button></form></section>}
      </section>
    </main>
  );
}
