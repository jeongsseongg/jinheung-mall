import { categoryFor, type Product } from "./products";
import { getSupabaseBrowserClient } from "./supabase-browser";
import { createClient } from "@supabase/supabase-js";

type ProductColorRow = {
  name: string;
  sort_order: number;
  stock_quantity: number;
};

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  bush_count: number | null;
  sales_unit: "단" | "박스" | "카톤";
  stock_quantity: number;
  image_url: string | null;
  metadata: { specification?: string; note?: string | null; stock_unconfirmed?: boolean } | null;
  product_colors: ProductColorRow[] | null;
};

const stableIdFromSku = (sku: string, databaseId: string) => {
  const canonicalNumber = sku.match(/^JH-FL-(\d{3})$/i)?.[1];
  return canonicalNumber
    ? `oraedam-${String(Number(canonicalNumber)).padStart(2, "0")}`
    : `product-${databaseId}`;
};

const stockLabel = (row: ProductRow): Product["stock"] => {
  if (row.metadata?.stock_unconfirmed) return "확인 필요";
  if (row.stock_quantity <= 0) return "소량";
  if (row.stock_quantity < 20) return "보통";
  return "충분";
};

const mapProduct = (row: ProductRow, index: number): Product => {
  const colors = [...(row.product_colors ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const unit = row.metadata?.specification || (row.bush_count ? `${row.bush_count}부쉬` : row.sales_unit);

  return {
    id: stableIdFromSku(row.sku, row.id),
    databaseId: row.id,
    sku: row.sku,
    name: row.name,
    category: categoryFor(unit),
    color: colors.map((color) => color.name).join(", ") || "색상 문의",
    image: row.image_url,
    consumerPrice: Number(row.price),
    unit,
    salesUnit: row.sales_unit,
    minOrder: 1,
    stock: stockLabel(row),
    stockQuantity: row.stock_quantity,
    isNew: index < 12,
    isBest: index < 8,
    monthlyOrders: 300 - index * 3,
    description: row.description || `${unit} 규격의 조화 상품입니다.`,
    note: row.metadata?.note || undefined,
  };
};

export async function fetchSupabaseProducts(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase public environment variables are missing.");
  const supabase = typeof window === "undefined"
    ? createClient(url, publishableKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } })
    : getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,sku,name,description,price,bush_count,sales_unit,stock_quantity,image_url,metadata,product_colors(name,sort_order,stock_quantity)")
    .eq("is_active", true)
    .order("sku");

  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
}
