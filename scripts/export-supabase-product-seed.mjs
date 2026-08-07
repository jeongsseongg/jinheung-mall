import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const projectRoot = resolve(import.meta.dirname, "..");
const outputPath = resolve(projectRoot, "supabase/migrations/002_seed_products.sql");
const envText = readFileSync(resolve(projectRoot, ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/)
  .filter((line) => line && !line.startsWith("#") && line.includes("="))
  .map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: products, error: productError } = await supabase
  .from("products")
  .select("id,sku,slug,name,description,price,bush_count,sales_unit,stock_quantity,image_url,is_active,metadata")
  .order("sku");
if (productError) throw productError;

const { data: colors, error: colorError } = await supabase
  .from("product_colors")
  .select("product_id,name,stock_quantity,sort_order")
  .order("sort_order");
if (colorError) throw colorError;

if (products.length !== 70) throw new Error(`Expected 70 products, received ${products.length}.`);

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const nullable = (value) => value === null || value === undefined ? "null" : quote(value);
const productSkuById = new Map(products.map((product) => [product.id, product.sku]));
const statements = [
  "begin;",
  "",
  "-- 진흥몰 상품 70개와 색상 옵션 279개",
  "-- 같은 SKU와 같은 색상은 중복 생성하지 않고 갱신합니다.",
  "",
];

for (const product of products) {
  statements.push(
    "insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)",
    `values (${quote(product.sku)}, ${quote(product.slug)}, ${quote(product.name)}, ${nullable(product.description)}, ${Number(product.price)}, ${product.bush_count ?? "null"}, ${quote(product.sales_unit)}, ${Number(product.stock_quantity)}, ${nullable(product.image_url)}, ${product.is_active ? "true" : "false"}, ${quote(JSON.stringify(product.metadata ?? {}))}::jsonb)`,
    "on conflict (sku) do update set",
    "  slug = excluded.slug, name = excluded.name, description = excluded.description,",
    "  price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit,",
    "  stock_quantity = excluded.stock_quantity, image_url = excluded.image_url,",
    "  is_active = excluded.is_active, metadata = excluded.metadata, updated_at = now();",
    "",
  );
}

for (const color of colors) {
  const sku = productSkuById.get(color.product_id);
  if (!sku) throw new Error(`Missing product for color ${color.name}.`);
  statements.push(
    "insert into public.product_colors (product_id, name, stock_quantity, sort_order)",
    `select id, ${quote(color.name)}, ${Number(color.stock_quantity)}, ${Number(color.sort_order)} from public.products where sku = ${quote(sku)}`,
    "on conflict (product_id, name) do update set",
    "  stock_quantity = excluded.stock_quantity, sort_order = excluded.sort_order;",
    "",
  );
}

statements.push("commit;", "");
writeFileSync(outputPath, statements.join("\n"), "utf8");
console.log(JSON.stringify({ products: products.length, colors: colors.length, outputPath }));
