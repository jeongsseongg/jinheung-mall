import Link from "next/link";

const orders = [
  { id: "JH-260803-0182", date: "2026.08.03", status: "배송중", products: "프리미엄 피오니 가지 외 3종", amount: "184,600원", action: "배송조회" },
  { id: "JH-260729-0147", date: "2026.07.29", status: "배송완료", products: "유칼립투스 롱 브랜치 외 1종", amount: "92,400원", action: "다시 주문" },
  { id: "JH-260718-0096", date: "2026.07.18", status: "배송완료", products: "리얼 터치 튤립 10송이 외 5종", amount: "238,900원", action: "다시 주문" },
  { id: "JH-260705-0021", date: "2026.07.05", status: "배송완료", products: "소프트 수국 부쉬 외 2종", amount: "116,800원", action: "다시 주문" },
];

export default function OrdersPage() {
  return (
    <main className="store-main page-main narrow-page">
      <div className="page-title-row split"><div><p className="eyebrow">ORDER HISTORY</p><h1>주문내역</h1><p>월별 주문과 배송상태를 확인하고 빠르게 다시 주문하세요.</p></div><Link href="/favorites" className="secondary-button">자주 주문 보기</Link></div>
      <div className="order-filter"><button className="active">최근 3개월</button><button>6개월</button><button>1년</button><label><span>상태</span><select><option>전체 주문</option><option>배송중</option><option>배송완료</option></select></label></div>
      <section className="order-list">{orders.map((order) => <article key={order.id}><div className="order-head"><div><strong>{order.date}</strong><span>{order.id}</span></div><b className={order.status === "배송중" ? "shipping" : ""}>{order.status}</b></div><div className="order-body"><div><strong>{order.products}</strong><span>{order.amount}</span></div><button type="button">{order.action}</button></div></article>)}</section>
      <div className="help-box"><div><strong>주문 관련 도움이 필요하신가요?</strong><p>주문번호를 알려주시면 더 빠르게 확인할 수 있습니다.</p></div><button type="button">전화 문의</button></div>
    </main>
  );
}
