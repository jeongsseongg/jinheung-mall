"use client";

import { useEffect, useState } from "react";
import Link from "@/app/components/SafeLink";
import { useAuth } from "@/app/components/AuthProvider";
import { formatPrice } from "@/app/lib/products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type OrderItem = { sku: string; product_name: string; color_name: string | null; quantity: number; sales_unit: string; line_total: number };
type Order = { id: string; order_number: string; status: string; payment_status: string; total_amount: number; tracking_number: string | null; courier_code: string | null; created_at: string; items: OrderItem[] };

const statusLabels: Record<string, string> = {
  pending_payment: "입금 대기",
  paid: "입금 확인",
  preparing: "배송 준비",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "주문 취소",
};

const statusDescription: Record<string, string> = {
  pending_payment: "입금 확인 대기",
  paid: "배송 준비 전",
  preparing: "운송장 준비 중",
  shipped: "배송 정보 확인 중",
  delivered: "배송 완료",
  cancelled: "취소 완료",
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [cancellingId, setCancellingId] = useState("");

  const fetchOrders = async () => {
    const { data, error: rpcError } = await getSupabaseBrowserClient().rpc("list_my_orders");
    if (rpcError) {
      setError("주문내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setOrders((data || []) as Order[]);
    setError("");
  };

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      const { data, error: rpcError } = await getSupabaseBrowserClient().rpc("list_my_orders");
      if (!active) return;
      if (rpcError) setError("주문내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      else {
        setOrders((data || []) as Order[]);
        setError("");
        setMessage("");
        setMessageIsError(false);
      }
      setFetching(false);
      setLoadedUserId(user.id);
    };
    void load();
    return () => { active = false; };
  }, [user]);

  const cancelOrder = async (order: Order) => {
    if (!window.confirm(`${order.order_number} 주문을 취소할까요?`)) return;
    setCancellingId(order.id);
    setMessage("");
    setMessageIsError(false);
    const { error: rpcError } = await getSupabaseBrowserClient().rpc("cancel_my_order", { p_order_id: order.id });
    if (rpcError) {
      setMessage("입금 대기 중인 주문만 직접 취소할 수 있습니다. 도움이 필요하면 관리자에게 문의해 주세요.");
      setMessageIsError(true);
    }
    else {
      setMessage("주문을 취소했습니다.");
      setMessageIsError(false);
      await fetchOrders();
    }
    setCancellingId("");
  };

  if (loading || (user && (fetching || loadedUserId !== user.id))) return <main id="main-content" className="store-main page-main narrow-page"><div className="empty-state"><strong>주문내역을 확인하고 있습니다.</strong></div></main>;
  if (!user) return <main id="main-content" className="store-main page-main narrow-page"><div className="empty-state"><strong>로그인이 필요합니다.</strong><p>로그인하면 주문과 배송 상태를 확인할 수 있습니다.</p><Link href="/login?returnTo=%2Forders" className="primary-button">로그인하기</Link></div></main>;

  return (
    <main id="main-content" className="store-main page-main narrow-page">
      <div className="page-title-row split"><div><p className="eyebrow">ORDER HISTORY</p><h1>주문내역</h1><p>무통장입금 확인부터 배송완료까지 주문별로 확인하세요.</p></div><Link href="/" className="secondary-button">상품 더 보기</Link></div>
      {message && <p className={`order-page-message ${messageIsError ? "error" : ""}`} role={messageIsError ? "alert" : "status"}>{message}</p>}
      {error ? <div className="empty-state" role="alert"><strong>{error}</strong><button type="button" className="secondary-button" onClick={() => void fetchOrders()}>다시 불러오기</button></div> : orders.length === 0 ? <div className="empty-state"><strong>아직 주문이 없습니다.</strong><p>장바구니에서 주문서를 작성하면 이곳에 바로 표시됩니다.</p><Link href="/" className="primary-button">상품 보러가기</Link></div> : <section className="order-list" aria-label="주문 목록">{orders.map((order) => {
        const first = order.items[0];
        const productSummary = first ? `${first.product_name}${order.items.length > 1 ? ` 외 ${order.items.length - 1}종` : ""}` : "주문 상품";
        return <article key={order.id}>
          <div className="order-head"><div><strong>{new Date(order.created_at).toLocaleDateString("ko-KR")}</strong><span>{order.order_number}</span></div><b className={["paid", "preparing", "shipped"].includes(order.status) ? "shipping" : ""}>{statusLabels[order.status] || order.status}</b></div>
          <div className="order-body"><div><strong>{productSummary}</strong><span>{formatPrice(order.total_amount)} · 무통장입금</span>{first?.color_name && <small>{first.color_name} · {first.quantity}{first.sales_unit}</small>}</div><div className="order-actions">{order.tracking_number ? <a className="secondary-button" href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`${order.courier_code || ""} ${order.tracking_number}`)}`} target="_blank" rel="noreferrer" aria-label={`${order.order_number} 배송조회, 새 창`}>배송조회</a> : <span className="order-waiting-copy">{statusDescription[order.status] || "주문 상태 확인 중"}</span>}{order.status === "pending_payment" && <button type="button" className="line-button" disabled={cancellingId === order.id} onClick={() => void cancelOrder(order)}>{cancellingId === order.id ? "취소 중" : "주문 취소"}</button>}</div></div>
          <details className="order-item-details"><summary>상품 {order.items.length}종 상세보기</summary><div>{order.items.map((item, index) => <div key={`${item.sku}-${item.color_name || "default"}-${index}`}><span><strong>{item.product_name}</strong><small>{item.color_name || "기본 색상"} · {item.quantity}{item.sales_unit}</small></span><b>{formatPrice(item.line_total)}</b></div>)}</div></details>
        </article>;
      })}</section>}
      <div className="help-box"><div><strong>주문 관련 도움이 필요하신가요?</strong><p>주문번호를 알려주시면 더 빠르게 확인할 수 있습니다.</p></div><Link href="/mypage">회원정보 확인</Link></div>
    </main>
  );
}
