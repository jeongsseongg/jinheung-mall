"use client";

import { useEffect, useState } from "react";
import { products as fallbackProducts, type Product } from "./products";
import { fetchSupabaseProducts } from "./supabase-products";

let cachedProducts: Product[] | null = null;
let pendingRequest: Promise<Product[]> | null = null;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(cachedProducts ?? fallbackProducts);
  const [source, setSource] = useState<"supabase" | "fallback">(cachedProducts ? "supabase" : "fallback");

  useEffect(() => {
    let active = true;
    pendingRequest ??= fetchSupabaseProducts();
    pendingRequest
      .then((nextProducts) => {
        if (nextProducts.length !== 70) throw new Error(`Expected 70 products, received ${nextProducts.length}.`);
        cachedProducts = nextProducts;
        if (active) {
          setProducts(nextProducts);
          setSource("supabase");
        }
      })
      .catch(() => {
        pendingRequest = null;
        if (active) {
          setProducts(fallbackProducts);
          setSource("fallback");
        }
      });

    return () => { active = false; };
  }, []);

  return { products, source };
}
