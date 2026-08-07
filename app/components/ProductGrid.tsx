"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, type Product } from "@/app/lib/products";
import { useProducts } from "@/app/lib/use-products";
import { ProductCard } from "./ProductCard";

const colorOptions = [
  { id: "all", label: "전체", color: "#ffffff" },
  { id: "white", label: "화이트", color: "#f3f3f1" },
  { id: "pink", label: "핑크", color: "#f38aaa" },
  { id: "red", label: "레드", color: "#c9252d" },
  { id: "yellow", label: "옐로우", color: "#f8ba22" },
  { id: "purple", label: "퍼플", color: "#8e61aa" },
  { id: "blue", label: "블루", color: "#4f8fd9" },
  { id: "green", label: "그린", color: "#16724a" },
  { id: "brown", label: "브라운", color: "#93613f" },
  { id: "other", label: "기타", color: "#c9c9c9" },
];

const colorGroup = (product: Product) => {
  const value = product.color;
  if (/핑크|코랄/.test(value)) return "pink";
  if (/화이트|크림/.test(value)) return "white";
  if (/레드/.test(value)) return "red";
  if (/옐로/.test(value)) return "yellow";
  if (/퍼플/.test(value)) return "purple";
  if (/블루/.test(value)) return "blue";
  if (/그린|올리브/.test(value)) return "green";
  if (/브라운/.test(value)) return "brown";
  return "other";
};

export function ProductGrid({ compact = false }: { compact?: boolean }) {
  const { products } = useProducts();
  const [category, setCategory] = useState("전체");
  const [sort, setSort] = useState("popular");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedColor, setSelectedColor] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const categoryCounts = useMemo(() => Object.fromEntries(categories.map((item) => [item, item === "전체" ? products.length : products.filter((product) => product.category === item).length])), [products]);

  useEffect(() => {
    const mobileView = window.matchMedia("(max-width: 640px)");
    const applyDefault = () => setCategoryOpen(!mobileView.matches);
    applyDefault();
    mobileView.addEventListener("change", applyDefault);
    return () => mobileView.removeEventListener("change", applyDefault);
  }, []);

  const visibleProducts = useMemo(() => {
    const minimum = minPrice === "" ? 0 : Number(minPrice);
    const maximum = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);
    const filtered = products.filter((product) => {
      const categoryMatch = category === "전체" || product.category === category;
      const priceMatch = product.consumerPrice >= minimum && product.consumerPrice <= maximum;
      const colorMatch = selectedColor === "all" || colorGroup(product) === selectedColor;
      const stockMatch = stockFilter === "all"
        || (stockFilter === "available" && (product.stockQuantity ?? 0) > 0)
        || (stockFilter === "exclude-low" && product.stock !== "소량" && product.stock !== "확인 필요");
      return categoryMatch && priceMatch && colorMatch && stockMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-low") return a.consumerPrice - b.consumerPrice;
      if (sort === "price-high") return b.consumerPrice - a.consumerPrice;
      if (sort === "new") return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
      return (Number(Boolean(b.image)) - Number(Boolean(a.image))) || (b.monthlyOrders - a.monthlyOrders);
    });
  }, [category, maxPrice, minPrice, selectedColor, sort, stockFilter]);

  const setPriceRange = (minimum: number | null, maximum: number | null) => {
    setMinPrice(minimum === null ? "" : String(minimum));
    setMaxPrice(maximum === null ? "" : String(maximum));
  };

  const resetFilters = () => {
    setCategory("전체");
    setMinPrice("");
    setMaxPrice("");
    setSelectedColor("all");
    setStockFilter("all");
    setSort("popular");
  };

  return (
    <section className="catalog-section" aria-labelledby="catalog-heading">
      <div className="catalog-menu-bar">
        <button type="button" className="category-toggle" aria-expanded={categoryOpen} aria-controls="category-panel" onClick={() => setCategoryOpen((open) => !open)}>
          <span>필터</span>
          <em>{category} · {selectedColor === "all" ? "전체 색상" : colorOptions.find((item) => item.id === selectedColor)?.label}</em>
          <b>{categoryOpen ? "닫기" : "열기"}</b>
        </button>
        <p>총 <strong>{visibleProducts.length}</strong>개 상품</p>
      </div>

      <div className={`catalog-body ${categoryOpen ? "category-is-open" : ""}`}>
        {categoryOpen && <aside className="category-panel" id="category-panel">
          <section className="filter-section">
            <h3>카테고리</h3>
            <nav className="category-list" aria-label="카테고리 목록">
              {categories.map((item) => (
                <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>
                  <span>{item}</span><small>{categoryCounts[item]}</small>
                </button>
              ))}
            </nav>
          </section>

          <section className="filter-section">
            <h3>가격</h3>
            <div className="price-input-row">
              <label><span className="sr-only">최소 가격</span><input type="number" min="0" max="3000" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="최소" /><b>원</b></label>
              <i>~</i>
              <label><span className="sr-only">최대 가격</span><input type="number" min="0" max="3000" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="최대" /><b>원</b></label>
            </div>
            <div className="price-quick-grid">
              <button type="button" onClick={() => setPriceRange(null, 1000)}>1천원 이하</button>
              <button type="button" onClick={() => setPriceRange(1000, 2000)}>1천~2천원</button>
              <button type="button" onClick={() => setPriceRange(2000, 3000)}>2천~3천원</button>
              <button type="button" onClick={() => setPriceRange(null, null)}>전체 가격</button>
            </div>
          </section>

          <section className="filter-section">
            <h3>색상</h3>
            <div className="color-filter-grid">
              {colorOptions.map((item) => <button key={item.id} type="button" className={selectedColor === item.id ? "selected" : ""} aria-pressed={selectedColor === item.id} onClick={() => setSelectedColor(item.id)}>
                <span style={{ backgroundColor: item.color }} /><small>{item.label}</small>
              </button>)}
            </div>
          </section>

          <section className="filter-section">
            <h3>재고 상태</h3>
            <label className="filter-radio"><input type="radio" name="stock" checked={stockFilter === "all"} onChange={() => setStockFilter("all")} /><span>전체</span><small>{products.length}</small></label>
            <label className="filter-radio"><input type="radio" name="stock" checked={stockFilter === "available"} onChange={() => setStockFilter("available")} /><span>재고 보유 상품</span><small>{products.length}</small></label>
            <label className="filter-radio"><input type="radio" name="stock" checked={stockFilter === "exclude-low"} onChange={() => setStockFilter("exclude-low")} /><span>소량 재고 제외</span><small>{products.filter((product) => product.stock !== "소량").length}</small></label>
          </section>

          <section className="filter-section">
            <h3>정렬</h3>
            {[
              ["popular", "추천순"],
              ["new", "신상품순"],
              ["price-low", "낮은 가격순"],
              ["price-high", "높은 가격순"],
            ].map(([value, label]) => <label className="filter-radio" key={value}><input type="radio" name="sort" checked={sort === value} onChange={() => setSort(value)} /><span>{label}</span></label>)}
          </section>

          <button type="button" className="filter-reset" onClick={resetFilters}>필터 초기화</button>
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
                <option value="popular">추천순</option>
                <option value="new">신상품순</option>
                <option value="price-low">낮은 가격순</option>
                <option value="price-high">높은 가격순</option>
              </select>
            </label>
          </div>
          {visibleProducts.length > 0 ? <div className={`product-grid ${compact ? "compact" : ""}`}>
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div> : <div className="empty-state filter-empty"><strong>조건에 맞는 상품이 없습니다.</strong><p>필터를 초기화하고 다시 확인해 주세요.</p><button type="button" className="secondary-button" onClick={resetFilters}>필터 초기화</button></div>}
        </div>
      </div>
    </section>
  );
}
