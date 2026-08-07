"use client";

import { useEffect, useState } from "react";
import Link from "@/app/components/SafeLink";
import { useAuth } from "@/app/components/AuthProvider";
import { formatPrice } from "@/app/lib/products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";

type OrderItem = { product_name: string; color_name: string | null; quantity: number; sales_unit: string; line_total: number };
type Order = { id: string; order_number: string; status: string; payment_status: string; total_amount: number; tracking_number: string | null; courier_code: string | null; created_at: string; items: OrderItem[] };

const statusLabels: Record<string, string> = {
  pending_payment: "입금 대기",
  paid: "입금 확인",
  preparing: "배송 준비",
  shipped: "배송중",
  delivered: "배송완료",
  cancelled: "주문 취소",
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    let active = true;
    getSupabaseBrowserClient().rpc("list_my_orders").then(({ data, error: rpcError }) => {
      if (!active) return;
      if (rpcError) setError("주문내역을 불러오지 못했습니다.");
      else setOrders((data || []) as Order[]);
      setFetching(false);
    });
    return () => { active = false; };
  }, [user]);

  if (loading || fetching) return <main className="store-main page-main narrow-page"><div className="empty-state"><strong>주문내역을 확인하고 있습니다.</strong></div></main>;
  if (!user) return <main className="store-main page-main narrow-page"><div className="empty-state"><strong>로그인이 필요합니다.</strong><p>로그인하면 주문과 배송 상태를 확인할 수 있습니다.</p><Link href="/login" className="primary-button">로그인하기</Link></div></main>;

  return (
    <main className="store-main page-main narrow-page">
      <div className="page-title-row split"><div><p className="eyebrow">ORDER HISTORY</p><h1>주문내역</h1><p>무통장입금 확인부터 배송완료까지 한곳에서 확인하세요.</p></div><Link href="/" className="secondary-button">상품 더 보기</Link></div>
      {error ? <div className="empty-state"><strong>{error}</strong></div> : orders.length === 0 ? <div className="empty-state"><strong>아직 주문이 없습니다.</strong><p>장바구니에서 주문서를 작성하면 이곳에 바로 표시됩니다.</p><Link href="/" className="primary-button">상품 보러가기</Link></div> : <section className="order-list">{orders.map((order) => {
        const first = order.items[0];
        const productSummary = first ? `${first.product_name}${order.items.length > 1 ? ` 외 ${order.items.length - 1}종` : ""}` : "주문 상품";
        return <article key={order.id}><div className="order-head"><div><strong>{new Date(order.created_at).toLocaleDateString("ko-KR")}</strong><span>{order.order_number}</span></div><b className={["paid", "preparing", "shipped"].includes(order.status) ? "shipping" : ""}>{statusLabels[order.status] || order.status}</b></div><div className="order-body"><div><strong>{productSummary}</strong><span>{formatPrice(order.total_amount)} · 무통장입금</span>{first?.color_name && <small>{first.color_name} · {first.quantity}{first.sales_unit}</small>}</div>{order.tracking_number ? <a className="secondary-button" href={`https://search.naver.com/search.naver?query=${encodeURIComponent(order.tracking_number)}`} target="_blank" rel="noreferrer">배송조회</a> : <span className="order-waiting-copy">{order.status === "pending_payment" ? "입금 안내 대기" : "운송장 준비 중"}</span>}</div></article>;
      })}</section>}
      <div className="help-box"><div><strong>주문 관련 도움이 필요하신가요?</strong><p>주문번호를 알려주시면 더 빠르게 확인할 수 있습니다.</p></div><Link href="/mypage">회원정보 확인</Link></div>
    </main>
  );
}
