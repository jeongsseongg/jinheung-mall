import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const projectRoot = resolve(import.meta.dirname, "..");
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
  .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });
if (storageError) throw storageError;

const missingImageSkus = products.filter((product) => !product.image_url).map((product) => product.sku);
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
  publiclyReadableProducts: publicProducts.length,
  missingImageSkus,
}));
