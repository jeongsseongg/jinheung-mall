"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import Link from "./SafeLink";

export function CatalogSearch() {
  const { products } = useProducts();
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const matches = useMemo(() => {
    if (!normalizedQuery) return [];
    return products.filter((product) => [product.name, product.sku ?? "", product.id, product.category, product.color].some((value) => value.toLocaleLowerCase("ko-KR").includes(normalizedQuery))).slice(0, 6);
  }, [normalizedQuery, products]);
  const previewOpen = focused && normalizedQuery.length > 0;

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setFocused(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFocused(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  return (
    <div className="catalog-search-wrap" ref={searchRef}>
      <form action="/products" className="catalog-main-search">
        <label className="sr-only" htmlFor="catalog-search">상품 검색</label>
        <input
          id="catalog-search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="상품명, 품번, 색상 검색"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={previewOpen}
          aria-controls="catalog-search-preview"
        />
        <button type="submit">검색</button>
      </form>

      {previewOpen && <div className="search-preview" id="catalog-search-preview">
        <div className="search-preview-head"><strong>검색 미리보기</strong><span>최대 6개</span></div>
        {matches.length > 0 ? <div className="search-preview-grid">
          {matches.map((product) => <Link className="search-preview-item" key={product.id} href={`/products/${product.id}`}>
            {product.image ? <img src={product.image} alt="" loading="lazy" decoding="async" /> : <span className="search-preview-image-fallback">이미지 준비 중</span>}
            <span><small>{product.category} · {product.color}</small><strong>{product.name}</strong><b>{formatPrice(product.consumerPrice)}</b></span>
          </Link>)}
        </div> : <p className="search-preview-empty">일치하는 상품이 없습니다.</p>}
      </div>}
    </div>
  );
}
