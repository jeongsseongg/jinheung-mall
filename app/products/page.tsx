"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { categories } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { ProductCard } from "@/app/components/ProductCard";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  return <ProductsSearch key={urlQuery} initialQuery={urlQuery} />;
}

function ProductsSearch({ initialQuery }: { initialQuery: string }) {
  const { products } = useProducts();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("전체");
  const [priceBand, setPriceBand] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);

  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.sku ?? ""} ${product.id} ${product.color} ${product.category}`.toLocaleLowerCase("ko-KR").includes(query.trim().toLocaleLowerCase("ko-KR"));
    const matchesCategory = category === "전체" || product.category === category;
    const matchesPrice = priceBand === "all"
      || (priceBand === "under1" && product.consumerPrice <= 1000)
      || (priceBand === "1to2" && product.consumerPrice > 1000 && product.consumerPrice <= 2000)
      || (priceBand === "2to3" && product.consumerPrice > 2000 && product.consumerPrice <= 3000)
      || (priceBand === "over3" && product.consumerPrice > 3000);
    const isSoldOut = product.stockQuantity !== undefined && product.stockQuantity <= 0 && product.stock !== "확인 필요";
    const matchesStock = !stockOnly || !isSoldOut;
    return matchesQuery && matchesCategory && matchesPrice && matchesStock;
  }), [category, priceBand, products, query, stockOnly]);

  return (
    <main className="store-main page-main">
      <div className="page-title-row">
        <div><p className="eyebrow">DETAILED SEARCH</p><h1>상품 상세검색</h1><p>원하는 조건을 선택하면 바로 상품을 좁혀볼 수 있습니다.</p></div>
      </div>
      <section className="search-panel">
        <label className="wide-field"><span>검색어</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 화이트 수국, 그린 가지" /></label>
        <label><span>카테고리</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>가격대</span><select value={priceBand} onChange={(event) => setPriceBand(event.target.value)}><option value="all">전체 가격</option><option value="under1">1천원 이하</option><option value="1to2">1천원 초과~2천원</option><option value="2to3">2천원 초과~3천원</option><option value="over3">3천원 초과</option></select></label>
        <label className="check-field"><input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} /><span>주문 가능 상품만</span></label>
      </section>
      <div className="result-summary"><strong>{filtered.length}개</strong>의 상품을 찾았습니다.<button type="button" onClick={() => { setQuery(""); setCategory("전체"); setPriceBand("all"); setStockOnly(false); }}>초기화</button></div>
      <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      {filtered.length === 0 && <div className="empty-state"><strong>조건에 맞는 상품이 없습니다.</strong><p>검색어 또는 가격대를 다시 선택해주세요.</p></div>}
    </main>
  );
}
