"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice, products } from "@/app/lib/products";

export function CatalogSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const matches = useMemo(() => {
    if (!normalizedQuery) return [];
    return products.filter((product) => [product.name, product.id, product.category, product.color].some((value) => value.toLocaleLowerCase("ko-KR").includes(normalizedQuery))).slice(0, 6);
  }, [normalizedQuery]);
  const previewOpen = focused && normalizedQuery.length > 0;

  return (
    <div className="catalog-search-wrap">
      <form action="/products" className="catalog-main-search">
        <label className="sr-only" htmlFor="catalog-search">상품 검색</label>
        <input
          id="catalog-search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="상품명, 품번, 색상 검색"
          autoComplete="off"
          aria-expanded={previewOpen}
          aria-controls="catalog-search-preview"
        />
        <button type="submit">검색</button>
      </form>

      {previewOpen && <div className="search-preview" id="catalog-search-preview">
        <div className="search-preview-head"><strong>검색 미리보기</strong><span>최대 6개</span></div>
        {matches.length > 0 ? <div className="search-preview-grid">
          {matches.map((product) => <Link href={`/products/${product.id}`} className="search-preview-item" key={product.id}>
            <img src={product.image} alt="" />
            <span><small>{product.category} · {product.color}</small><strong>{product.name}</strong><b>{formatPrice(product.consumerPrice)}</b></span>
          </Link>)}
        </div> : <p className="search-preview-empty">일치하는 상품이 없습니다.</p>}
      </div>}
    </div>
  );
}
