"use client";

import Link from "@/app/components/SafeLink";
import { ProductCard } from "@/app/components/ProductCard";
import { useStore } from "@/app/components/StoreProvider";
import { useProducts } from "@/app/lib/use-products";

export default function FavoritesPage() {
  const { products } = useProducts();
  const { favorites, addToCart } = useStore();
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));
  const orderableProducts = favoriteProducts.filter((product) => !(product.stockQuantity !== undefined && product.stockQuantity <= 0 && product.stock !== "확인 필요"));
  const stockCheckCount = favoriteProducts.filter((product) => product.stock === "확인 필요").length;

  return (
    <main className="store-main page-main">
      <div className="page-title-row split"><div><p className="eyebrow">QUICK REORDER</p><h1>자주 주문 상품</h1><p>매번 검색하지 않고 등록한 상품을 바로 주문하세요.</p></div>{favoriteProducts.length > 0 && <button type="button" className="primary-button" disabled={orderableProducts.length === 0} onClick={() => orderableProducts.forEach((product) => addToCart(product.id, product.minOrder))}>주문 가능 상품 전체 담기</button>}</div>
      <section className="saved-summary"><div><span>등록 상품</span><strong>{favoriteProducts.length}개</strong></div><div><span>주문 가능</span><strong>{orderableProducts.length}개</strong></div><div><span>재고 확인 필요</span><strong>{stockCheckCount}개</strong></div></section>
      {favoriteProducts.length > 0 ? <div className="product-grid">{favoriteProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><strong>자주 주문한 상품이 없습니다.</strong><p>상품 카드의 하트를 눌러 등록할 수 있습니다.</p><Link href="/" className="primary-button">상품 둘러보기</Link></div>}
    </main>
  );
}
