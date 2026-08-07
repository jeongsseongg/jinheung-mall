import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const projectRoot = resolve(import.meta.dirname, "..");
const envPath = resolve(projectRoot, ".env.local");
const envText = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const envFile = Object.fromEntries(envText.split(/\r?\n/)
  .filter((line) => line && !line.startsWith("#") && line.includes("="))
  .map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));

const env = { ...envFile, ...process.env };
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || !env.SUPABASE_SECRET_KEY) {
  throw new Error("Supabase 검증 환경변수가 없습니다.");
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const publicClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: products, error: productError } = await supabase
  .from("products")
  .select("id,sku,image_url")
  .order("sku");
if (productError) throw productError;

const { count: colorCount, error: colorError } = await supabase
  .from("product_colors")
  .select("id", { count: "exact", head: true });
if (colorError) throw colorError;

const { data: files, error: storageError } = await supabase.storage
  .from("product-images")
  .list("optimized", { limit: 1000, sortBy: { column: "name", order: "asc" } });
if (storageError) throw storageError;

const missingImageSkus = products.filter((product) => !product.image_url).map((product) => product.sku);
const nonOptimizedImageSkus = products
  .filter((product) => !product.image_url?.includes("/product-images/optimized/"))
  .map((product) => product.sku);
const { data: publicProducts, error: publicProductError } = await publicClient
  .from("products")
  .select("sku,image_url,product_colors(name)")
  .eq("is_active", true);
if (publicProductError) throw publicProductError;

console.log(JSON.stringify({
  products: products.length,
  productsWithImage: products.length - missingImageSkus.length,
  colorOptions: colorCount,
  storageFiles: files.length,
  optimizedStorageFiles: files.length,
  publiclyReadableProducts: publicProducts.length,
  missingImageSkus,
  nonOptimizedImageSkus,
}));
