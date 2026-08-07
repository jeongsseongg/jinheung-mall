import { getProduct, products } from "@/app/lib/products";
import { ProductDetailClient } from "@/app/components/ProductDetailClient";
import { fetchSupabaseProducts } from "@/app/lib/supabase-products";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product = getProduct(id);

  if (!product) {
    try {
      const liveProducts = await fetchSupabaseProducts();
      product = liveProducts.find((item) => item.id === id);
    } catch {
      product = undefined;
    }
  }

  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
