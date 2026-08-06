import { getProduct, products } from "@/app/lib/products";
import { ProductDetailClient } from "@/app/components/ProductDetailClient";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id) ?? products[0];
  return <ProductDetailClient product={product} />;
}
