"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { refreshProductCache, useProducts } from "@/app/lib/use-products";
import { useAuth } from "@/app/components/AuthProvider";
import { formatPrice } from "@/app/lib/products";
import { getSupabaseBrowserClient } from "@/app/lib/supabase-browser";
import { uploadProductImage } from "@/app/lib/product-image-upload";

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

type AdminTab = "products" | "orders" | "customers" | "security";

type AdminCustomer = {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  default_shipping_address: {
    receiver?: string; phone?: string; postalCode?: string;
    address1?: string; address2?: string; memo?: string;
  } | null;
  admin_note: string;
  created_at: string;
  updated_at: string;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
};

type AdminProduct = {
  id: string; sku: string; name: string; description: string; price: number;
  bush_count: number | null; sales_unit: "단" | "박스" | "카톤";
  stock_quantity: number; image_url: string | null; is_active: boolean;
  metadata: { specification?: string; note?: string; stock_unconfirmed?: boolean } | null;
  colors: { name: string; stock_quantity: number; sort_order: number }[];
};

type ProductDraft = {
  id: string; sku: string; name: string; description: string; price: string;
  bushCount: string; salesUnit: "단" | "박스" | "카톤"; stockQuantity: string;
  imageUrl: string; colors: string; specification: string; note: string;
  stockUnconfirmed: boolean; isActive: boolean;
};

const emptyProductDraft: ProductDraft = {
  id: "", sku: "", name: "", description: "", price: "", bushCount: "",
  salesUnit: "단", stockQuantity: "0", imageUrl: "", colors: "",
  specification: "", note: "", stockUnconfirmed: true, isActive: true,
};

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
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productDraft, setProductDraft] = useState<ProductDraft | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSaving, setProductSaving] = useState(false);
  const [productMessage, setProductMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState("");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerNotes, setCustomerNotes] = useState<Record<string, string>>({});
  const [customerSavingId, setCustomerSavingId] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");

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

  const loadAdminProducts = async () => {
    if (!user) { setProductsLoading(false); return; }
    setProductsLoading(true);
    const { data, error } = await getSupabaseBrowserClient().rpc("list_admin_products");
    if (error) setAdminError("관리자 상품 정보를 불러오지 못했습니다.");
    else { setAdminProducts((data || []) as AdminProduct[]); setAdminError(""); }
    setProductsLoading(false);
  };

  const loadCustomers = async () => {
    if (!user) { setCustomersLoading(false); return; }
    setCustomersLoading(true);
    const { data, error } = await getSupabaseBrowserClient().rpc("list_admin_customers");
    if (error) setAdminError("고객 정보를 불러오지 못했습니다.");
    else {
      const next = (data || []) as AdminCustomer[];
      setCustomers(next);
      setCustomerNotes(Object.fromEntries(next.map((customer) => [customer.id, customer.admin_note || ""])));
      setAdminError("");
    }
    setCustomersLoading(false);
  };

  useEffect(() => { if (!loading) { void loadOrders(); void loadAdminProducts(); void loadCustomers(); } }, [loading, user?.id]);

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

  const editProduct = (product: AdminProduct) => {
    setImageUploadMessage("");
    setProductDraft({
      id: product.id,
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: String(product.price),
      bushCount: product.bush_count ? String(product.bush_count) : "",
      salesUnit: product.sales_unit,
      stockQuantity: String(product.stock_quantity),
      imageUrl: product.image_url || "",
      colors: product.colors.map((color) => color.name).join(", "),
      specification: product.metadata?.specification || "",
      note: product.metadata?.note || "",
      stockUnconfirmed: Boolean(product.metadata?.stock_unconfirmed),
      isActive: product.is_active,
    });
  };

  const updateProductDraft = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setProductDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !productDraft) return;
    setImageUploading(true);
    setImageUploadMessage("");
    try {
      const key = productDraft.id || productDraft.sku || crypto.randomUUID();
      const result = await uploadProductImage(file, key);
      updateProductDraft("imageUrl", result.url);
      const saved = Math.max(0, result.originalBytes - result.uploadedBytes);
      setImageUploadMessage(`사진 업로드 완료 · ${Math.round(result.uploadedBytes / 1024)}KB${saved > 0 ? ` · ${Math.round(saved / 1024)}KB 절약` : ""}`);
    } catch (error) {
      setImageUploadMessage(error instanceof Error ? error.message : "사진 업로드에 실패했습니다.");
    } finally {
      setImageUploading(false);
    }
  };

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!productDraft) return;
    setProductSaving(true); setProductMessage("");
    const payload = {
      id: productDraft.id || null,
      sku: productDraft.sku,
      name: productDraft.name,
      description: productDraft.description,
      price: Number(productDraft.price),
      bush_count: productDraft.bushCount ? Number(productDraft.bushCount) : null,
      sales_unit: productDraft.salesUnit,
      stock_quantity: Number(productDraft.stockQuantity),
      image_url: productDraft.imageUrl || null,
      colors: productDraft.colors.split(",").map((color) => color.trim()).filter(Boolean),
      specification: productDraft.specification || null,
      note: productDraft.note || null,
      stock_unconfirmed: productDraft.stockUnconfirmed,
      is_active: productDraft.isActive,
    };
    const { error } = await getSupabaseBrowserClient().rpc("save_admin_product", { p_product: payload });
    setProductSaving(false);
    if (error) { setAdminError(error.message.includes("duplicate") ? "이미 사용 중인 상품 코드입니다." : "상품을 저장하지 못했습니다. 입력값을 확인해 주세요."); return; }
    await Promise.all([loadAdminProducts(), refreshProductCache()]);
    setProductDraft(null);
    setProductMessage("상품 정보가 저장되어 쇼핑몰에 반영되었습니다.");
  };

  const visibleAdminProducts = adminProducts.filter((product) => `${product.sku} ${product.name} ${product.colors.map((color) => color.name).join(" ")}`.toLowerCase().includes(productSearch.toLowerCase()));

  const saveCustomerNote = async (customerId: string) => {
    setCustomerSavingId(customerId);
    setCustomerMessage("");
    const { error } = await getSupabaseBrowserClient().rpc("update_admin_customer_note", {
      p_user_id: customerId,
      p_admin_note: customerNotes[customerId] || "",
    });
    setCustomerSavingId("");
    if (error) { setAdminError("고객 메모를 저장하지 못했습니다."); return; }
    setCustomerMessage("고객 메모가 저장되었습니다.");
    await loadCustomers();
  };

  const visibleCustomers = customers.filter((customer) => {
    const address = customer.default_shipping_address || {};
    return `${customer.name || ""} ${customer.email || ""} ${customer.phone || ""} ${address.address1 || ""} ${customer.admin_note || ""}`.toLowerCase().includes(customerSearch.toLowerCase());
  });

  if (loading) return <main className="store-main page-main"><div className="empty-state"><strong>관리자 계정을 확인하고 있습니다.</strong></div></main>;
  if (!user) return <main className="store-main page-main"><div className="empty-state"><strong>관리자 로그인이 필요합니다.</strong><a href="/login" className="primary-button">로그인하기</a></div></main>;

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo"><span className="brand-mark">JH</span><div><strong>진흥몰 관리자</strong><small>ADMIN CONSOLE</small></div></div>
        <nav>
          <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>상품 관리</button>
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>주문 관리{newCount > 0 && <b>{newCount}</b>}</button>
          <button className={tab === "customers" ? "active" : ""} onClick={() => setTab("customers")}>고객 관리</button>
          <button className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}>계정 보안</button>
        </nav>
        <a href="/">← 쇼핑몰로 돌아가기</a>
      </aside>
      <section className="admin-content">
        <header><div><p>ADMIN</p><h1>운영 현황</h1></div><div className="admin-user">{user.email}<span>진</span></div></header>
        {adminError && <div className="admin-alert"><span>!</span><div><strong>{adminError}</strong><p>관리자 권한과 Supabase 연결 상태를 확인해 주세요.</p></div></div>}
        {newCount > 0 && <div className="admin-new-order-alert"><div><strong>새 주문 {newCount}건이 있습니다.</strong><p>주문 내용을 확인한 뒤 확인 완료를 눌러 주세요.</p></div><button type="button" onClick={() => void markOrdersSeen()}>새 주문 확인 완료</button></div>}
        <section className="admin-metrics"><article><span>오늘 주문</span><strong>{metrics.today}건</strong><small>오늘 접수된 주문</small></article><article><span>입금 대기</span><strong>{metrics.pending}건</strong><small>무통장입금 확인 전</small></article><article><span>배송 준비</span><strong>{metrics.preparing}건</strong><small>운송장 발급 대기</small></article><article><span>재고 확인</span><strong>{products.filter((product) => product.stock === "확인 필요").length}개</strong><small>재고 확인 필요 상품</small></article></section>
        <div className="admin-tabs"><button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>상품 관리</button><button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>주문 관리</button><button className={tab === "customers" ? "active" : ""} onClick={() => setTab("customers")}>고객 관리</button><button className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}>계정 보안</button></div>

        {tab === "products" && <section className="admin-table-panel">
          <div className="panel-heading"><div><h2>상품 관리</h2><p>70개 상품의 가격, 색상, 부쉬·재고와 판매 상태를 관리합니다.</p></div><button type="button" className="primary-button" onClick={() => { setProductDraft({ ...emptyProductDraft }); setProductMessage(""); setImageUploadMessage(""); }}>+ 상품 등록</button></div>
          {productMessage && <p className="admin-product-message">{productMessage}</p>}
          {productDraft && <form className="admin-product-form" onSubmit={saveProduct}>
            <div className="admin-product-form-head"><div><strong>{productDraft.id ? "상품 수정" : "새 상품 등록"}</strong><span>필수 정보와 판매 상태를 입력해 주세요.</span></div><button type="button" className="line-button" onClick={() => setProductDraft(null)}>닫기</button></div>
            <div className="admin-product-fields">
              <label><span>상품 코드</span><input value={productDraft.sku} onChange={(event) => updateProductDraft("sku", event.target.value)} placeholder="비워두면 자동 생성" /></label>
              <label><span>상품명 *</span><input value={productDraft.name} onChange={(event) => updateProductDraft("name", event.target.value)} required /></label>
              <label><span>판매가 *</span><input type="number" min="0" value={productDraft.price} onChange={(event) => updateProductDraft("price", event.target.value)} required /></label>
              <label><span>부쉬</span><input type="number" min="1" value={productDraft.bushCount} onChange={(event) => updateProductDraft("bushCount", event.target.value)} /></label>
              <label><span>판매 단위</span><select value={productDraft.salesUnit} onChange={(event) => updateProductDraft("salesUnit", event.target.value as ProductDraft["salesUnit"])}><option>단</option><option>박스</option><option>카톤</option></select></label>
              <label><span>재고 수량</span><input type="number" min="0" value={productDraft.stockQuantity} onChange={(event) => updateProductDraft("stockQuantity", event.target.value)} required /></label>
              <label className="wide"><span>색상 그룹</span><input value={productDraft.colors} onChange={(event) => updateProductDraft("colors", event.target.value)} placeholder="보라, 빨강, 오렌지, 크림" /></label>
              <label className="wide"><span>규격 표시</span><input value={productDraft.specification} onChange={(event) => updateProductDraft("specification", event.target.value)} placeholder="예: 18부쉬 · 55cm · 10송이" /></label>
              <div className="admin-image-upload wide">
                <div className="admin-image-preview">
                  {productDraft.imageUrl ? <img src={productDraft.imageUrl} alt="업로드한 상품 미리보기" /> : <span>사진 미등록</span>}
                </div>
                <div className="admin-image-upload-copy">
                  <strong>상품 사진</strong>
                  <p>JPG·PNG·WebP, 최대 15MB. 업로드하면 긴 변 1200px WebP로 자동 축소됩니다.</p>
                  <label className={`line-button ${imageUploading ? "disabled" : ""}`}>
                    {imageUploading ? "사진 처리 중" : "사진 선택"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} disabled={imageUploading} hidden />
                  </label>
                  {imageUploadMessage && <small>{imageUploadMessage}</small>}
                </div>
              </div>
              <label className="wide"><span>이미지 주소 (사진 선택 시 자동 입력)</span><input type="url" value={productDraft.imageUrl} onChange={(event) => updateProductDraft("imageUrl", event.target.value)} placeholder="Supabase Storage 공개 이미지 주소" /></label>
              <label className="wide"><span>상품 설명</span><textarea value={productDraft.description} onChange={(event) => updateProductDraft("description", event.target.value)} rows={3} /></label>
              <label className="wide"><span>관리자 메모</span><input value={productDraft.note} onChange={(event) => updateProductDraft("note", event.target.value)} /></label>
            </div>
            <div className="admin-product-switches"><label><input type="checkbox" checked={productDraft.stockUnconfirmed} onChange={(event) => updateProductDraft("stockUnconfirmed", event.target.checked)} /><span>재고 확인 필요 표시</span></label><label><input type="checkbox" checked={productDraft.isActive} onChange={(event) => updateProductDraft("isActive", event.target.checked)} /><span>쇼핑몰에 판매 표시</span></label></div>
            <button type="submit" className="approve-button" disabled={productSaving || imageUploading}>{productSaving ? "저장 중" : imageUploading ? "사진 처리 중" : "상품 저장"}</button>
          </form>}
          <div className="admin-product-toolbar"><label><span className="sr-only">상품 검색</span><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="상품명·상품 코드·색상 검색" /></label><span>총 {visibleAdminProducts.length}개</span></div>
          {productsLoading ? <div className="empty-state"><strong>상품 정보를 불러오고 있습니다.</strong></div> : <div className="admin-table product-admin-table"><div className="table-row table-head"><span>상품</span><span>판매가</span><span>단위·부쉬</span><span>재고·상태</span><span>관리</span></div>{visibleAdminProducts.map((product) => <div className={`table-row ${product.is_active ? "" : "inactive"}`} key={product.id}><span className="admin-product">{product.image_url ? <img src={product.image_url} alt="" /> : <div className="admin-product-placeholder">{product.name}</div>}<span><strong>{product.name}</strong><small>{product.sku} · {product.colors.map((color) => color.name).join(", ") || "색상 미등록"}</small></span></span><span>{formatPrice(product.price)}</span><span>{product.sales_unit} · {product.bush_count ? `${product.bush_count}부쉬` : "부쉬 미설정"}</span><span>{product.stock_quantity}개 · {product.is_active ? "판매중" : "숨김"}</span><span><button type="button" className="line-button" onClick={() => editProduct(product)}>수정</button></span></div>)}</div>}
        </section>}

        {tab === "orders" && <section className="admin-table-panel"><div className="panel-heading"><div><h2>주문 관리</h2><p>입금 확인 후 상태를 변경하고 택배사와 운송장을 입력합니다.</p></div><div className="admin-order-actions"><button className="line-button" type="button" onClick={() => void enableBrowserNotifications()}>브라우저 알림 켜기</button><button className="secondary-button" type="button" onClick={() => void loadOrders()}>새로고침</button></div></div>{notificationMessage && <p className="admin-notification-note">{notificationMessage}</p>}{ordersLoading ? <div className="empty-state"><strong>주문을 불러오고 있습니다.</strong></div> : adminError ? <div className="empty-state"><strong>관리자 권한을 확인해 주세요.</strong></div> : orders.length === 0 ? <div className="empty-state"><strong>아직 주문이 없습니다.</strong></div> : <div className="admin-order-list">{orders.map((order) => { const draft = drafts[order.id] || { status: order.status, courier: "", tracking: "" }; return <article className={order.is_new ? "new-order" : ""} key={order.id}><div className="admin-order-primary"><span>{order.is_new && <b>NEW</b>} {new Date(order.created_at).toLocaleString("ko-KR")}</span><strong>{order.order_number}</strong><p>{order.customer_name} · {order.customer_phone}</p><small>입금자 {order.depositor_name} · {order.item_count}종 · {formatPrice(order.total_amount)}</small></div><label><span>상태</span><select value={draft.status} onChange={(event) => updateDraft(order.id, "status", event.target.value)}>{statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>택배사</span><input value={draft.courier} onChange={(event) => updateDraft(order.id, "courier", event.target.value)} placeholder="예: CJ대한통운" /></label><label><span>운송장</span><input value={draft.tracking} onChange={(event) => updateDraft(order.id, "tracking", event.target.value)} inputMode="numeric" /></label><button type="button" className="approve-button" disabled={savingId === order.id} onClick={() => void saveOrder(order.id)}>{savingId === order.id ? "저장 중" : "변경 저장"}</button></article>; })}</div>}</section>}

        {tab === "customers" && <section className="admin-table-panel">
          <div className="panel-heading"><div><h2>고객 관리</h2><p>가입 고객의 연락처, 배송지와 주문 실적을 확인하고 내부 메모를 관리합니다.</p></div><button type="button" className="secondary-button" onClick={() => void loadCustomers()}>새로고침</button></div>
          {customerMessage && <p className="admin-product-message">{customerMessage}</p>}
          <div className="admin-product-toolbar"><label><span className="sr-only">고객 검색</span><input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="이름·이메일·전화번호·주소 검색" /></label><span>총 {visibleCustomers.length}명</span></div>
          {customersLoading ? <div className="empty-state"><strong>고객 정보를 불러오고 있습니다.</strong></div> : visibleCustomers.length === 0 ? <div className="empty-state"><strong>검색된 고객이 없습니다.</strong></div> : <div className="admin-customer-list">{visibleCustomers.map((customer) => {
            const address = customer.default_shipping_address || {};
            const addressText = [address.postalCode, address.address1, address.address2].filter(Boolean).join(" ");
            return <article key={customer.id}>
              <div className="admin-customer-head"><div><span>{customer.name?.trim()?.slice(0, 1) || "고"}</span><div><strong>{customer.name || "이름 미등록"}</strong><small>{customer.email || "이메일 미등록"}</small></div></div><b>{customer.order_count}회 주문</b></div>
              <dl><div><dt>연락처</dt><dd>{customer.phone || "미등록"}</dd></div><div><dt>누적 구매</dt><dd>{formatPrice(customer.total_spent)}</dd></div><div><dt>가입일</dt><dd>{new Date(customer.created_at).toLocaleDateString("ko-KR")}</dd></div><div><dt>최근 주문</dt><dd>{customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString("ko-KR") : "없음"}</dd></div></dl>
              <div className="admin-customer-address"><strong>기본 배송지</strong><p>{addressText || "등록된 배송지가 없습니다."}</p>{address.memo && <small>배송 메모 · {address.memo}</small>}</div>
              <label className="admin-customer-note"><span>관리자 메모</span><textarea value={customerNotes[customer.id] || ""} onChange={(event) => setCustomerNotes((current) => ({ ...current, [customer.id]: event.target.value }))} maxLength={1000} rows={3} placeholder="거래 특이사항이나 응대 메모를 입력하세요." /></label>
              <button type="button" className="approve-button" disabled={customerSavingId === customer.id} onClick={() => void saveCustomerNote(customer.id)}>{customerSavingId === customer.id ? "저장 중" : "메모 저장"}</button>
            </article>;
          })}</div>}
        </section>}

        {tab === "security" && <section className="admin-security-panel"><div><p>ACCOUNT SECURITY</p><h2>관리자 비밀번호 변경</h2><span>현재 비밀번호를 다시 확인한 후 새 비밀번호로 변경합니다. 비밀번호는 코드나 데이터베이스에 평문으로 저장되지 않습니다.</span></div><form onSubmit={submitPassword} className="admin-security-form"><label><span>현재 비밀번호</span><input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label><span>새 비밀번호</span><input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} required /></label><label><span>새 비밀번호 확인</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></label>{passwordError && <p className="form-error">{passwordError}</p>}{passwordMessage && <p className="form-success">{passwordMessage}</p>}<button type="submit" className="primary-button" disabled={passwordSaving}>{passwordSaving ? "변경 중" : "비밀번호 변경"}</button></form></section>}
      </section>
    </main>
  );
}
