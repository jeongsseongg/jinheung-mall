"use client";

import { products } from "./products";

export function useProducts() {
  return { products, source: "snapshot" as const };
}
