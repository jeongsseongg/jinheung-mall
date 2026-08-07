"use client";

import { useEffect, useState } from "react";
import { products as snapshotProducts, type Product } from "./products";
import { fetchSupabaseProducts } from "./supabase-products";

let productCache: Product[] | null = null;
let productRequest: Promise<Product[]> | null = null;
const listeners = new Set<(items: Product[]) => void>();

async function loadProducts(force = false) {
  if (productCache && !force) return productCache;
  if (!productRequest || force) {
    productRequest = fetchSupabaseProducts()
      .then((items) => {
        productCache = items.length > 0 ? items : snapshotProducts;
        listeners.forEach((listener) => listener(productCache!));
        return productCache;
      })
      .catch(() => productCache ?? snapshotProducts)
      .finally(() => { productRequest = null; });
  }
  return productRequest;
}

export async function refreshProductCache() {
  productCache = null;
  return loadProducts(true);
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(productCache ?? snapshotProducts);
  const [loading, setLoading] = useState(!productCache);

  useEffect(() => {
    let active = true;
    const listener = (items: Product[]) => { if (active) setProducts(items); };
    listeners.add(listener);
    void loadProducts().then((items) => {
      if (active) { setProducts(items); setLoading(false); }
    });
    return () => { active = false; listeners.delete(listener); };
  }, []);

  return { products, loading, source: productCache ? "supabase" as const : "snapshot" as const };
}
