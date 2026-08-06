"use client";

import { useMemo, useState } from "react";
import { categories, products } from "@/app/lib/products";
import { ProductCard } from "./ProductCard";
import { useStore } from "./StoreProvider";

export function ProductGrid({ compact = false }: { compact?: boolean }) {
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("popular");
  const { role } = useStore();
  const visibleProducts = useMemo(() => {
    const filtered = category === "전체" ? products : products.filter((product) => product.category === category);
    return [...filtered].sort((a, b) => sort === "price-low" ? a.consumerPrice - b.consumerPrice : sort === "new" ? Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) : b.monthlyOrders - a.monthlyOrders);
  }, [category, sort]);

  return (
    <section className="catalog-section" aria-labelledby="catalog-heading">
      <div className="category-scroller" aria-label="상품 카테고리">
        {categories.map((item) => (
          <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>
        ))}
      </div>
      <div className="catalog-heading-row">
        <div>
          <h2 id="catalog-heading">많이 찾는 상품</h2>
          <span>{visibleProducts.length}개 상품</span>
        </div>
        <label className="sort-select">정렬
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="popular">주문 많은 순</option>
            <option value="new">신상품 순</option>
            {role !== "guest" && <option value="price-low">낮은 가격 순</option>}
          </select>
        </label>
      </div>
      <div className={`product-grid ${compact ? "compact" : ""}`}>
        {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
