"use client";

import { useMemo, useState } from "react";
import { categories, products } from "@/app/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("popular");
  const [categoryOpen, setCategoryOpen] = useState(true);
  const categoryCounts = useMemo(() => Object.fromEntries(categories.map((item) => [item, item === "전체" ? products.length : products.filter((product) => product.category === item).length])), []);
  const visibleProducts = useMemo(() => {
    const filtered = category === "전체" ? products : products.filter((product) => product.category === category);
    return [...filtered].sort((a, b) => sort === "price-low" ? a.consumerPrice - b.consumerPrice : sort === "new" ? Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) : b.monthlyOrders - a.monthlyOrders);
  }, [category, sort]);

  return (
    <section className="catalog-section" aria-labelledby="catalog-heading">
      <div className="catalog-menu-bar">
        <button type="button" className="category-toggle" aria-expanded={categoryOpen} aria-controls="category-panel" onClick={() => setCategoryOpen((open) => !open)}>
          <span>카테고리</span>
          <b>{categoryOpen ? "닫기" : "열기"}</b>
        </button>
        <p>총 <strong>{visibleProducts.length}</strong>개 상품</p>
      </div>

      <div className={`catalog-body ${categoryOpen ? "category-is-open" : ""}`}>
        {categoryOpen && <aside className="category-panel" id="category-panel">
          <strong>카테고리</strong>
          <nav aria-label="카테고리 목록">
            {categories.map((item) => (
              <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>
                <span>{item}</span><small>{categoryCounts[item]}</small>
              </button>
            ))}
          </nav>
        </aside>}

        <div className="catalog-product-area">
          <div className="category-scroller" aria-label="상품 카테고리">
            {categories.map((item, index) => (
              <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}><small>{String(index + 1).padStart(2, "0")}</small>{item}</button>
            ))}
          </div>
          <div className="catalog-heading-row">
            <div>
              <h2 id="catalog-heading">{category === "전체" ? "전체 상품" : category}</h2>
              <span>표시 가격은 VAT가 포함된 예시 가격입니다.</span>
            </div>
            <label className="sort-select">정렬
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="popular">주문 많은 순</option>
                <option value="new">신상품 순</option>
                <option value="price-low">낮은 가격 순</option>
              </select>
            </label>
          </div>
          <div className={`product-grid ${compact ? "compact" : ""}`}>
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
