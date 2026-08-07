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

const projectUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const secretKey = env.SUPABASE_SECRET_KEY;
if (!projectUrl || !secretKey) throw new Error("Supabase 서버 환경변수가 없습니다.");

const seedSource = readFileSync(resolve(projectRoot, "app/lib/oraedam-products.ts"), "utf8");
const seedMatch = seedSource.match(/export const productSeeds: ProductSeed\[\] = (\[[\s\S]*\]);/);
if (!seedMatch) throw new Error("상품 데이터 배열을 찾지 못했습니다.");

const seeds = JSON.parse(seedMatch[1]);
const mappings = JSON.parse(readFileSync(resolve(projectRoot, "supabase/product-image-map.json"), "utf8"));
if (seeds.length !== 70 || mappings.length !== 70) throw new Error("상품 또는 이미지가 70개가 아닙니다.");

const supabase = createClient(projectUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const bucketName = "product-images";
const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
if (bucketListError) throw bucketListError;

if (!buckets.some((bucket) => bucket.name === bucketName)) {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (error) throw error;
} else {
  const { error } = await supabase.storage.updateBucket(bucketName, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (error) throw error;
}

const mimeTypes = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
const imageUrls = new Map();

for (const mapping of mappings) {
  const extension = mapping.storageFile.split(".").pop().toLowerCase();
  const imageBytes = readFileSync(mapping.sourcePath);
  const { error } = await supabase.storage.from(bucketName).upload(mapping.storageFile, imageBytes, {
    contentType: mimeTypes[extension],
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`${mapping.sku} 이미지 업로드 실패: ${error.message}`);
  const { data } = supabase.storage.from(bucketName).getPublicUrl(mapping.storageFile);
  imageUrls.set(mapping.sku, data.publicUrl);
}

const productRows = seeds.map((seed, index) => {
  const number = String(index + 1).padStart(3, "0");
  const sku = `JH-FL-${number}`;
  const bushCount = Number(seed.unit.match(/(\d+)부쉬/)?.[1] ?? 0) || null;
  return {
    sku,
    slug: `jh-flower-${number}`,
    name: seed.name,
    description: `${seed.color} 색상 그룹의 ${seed.unit} 조화 상품`,
    price: Number(seed.basePrice),
    bush_count: bushCount,
    sales_unit: "단",
    image_url: imageUrls.get(sku),
    is_active: true,
    metadata: { specification: seed.unit, note: seed.note || null, stock_unconfirmed: true },
  };
});

const { data: savedProducts, error: productsError } = await supabase
  .from("products")
  .upsert(productRows, { onConflict: "sku" })
  .select("id,sku");
if (productsError) throw productsError;

const productIds = new Map(savedProducts.map((product) => [product.sku, product.id]));
const colorRows = seeds.flatMap((seed, index) => {
  const sku = `JH-FL-${String(index + 1).padStart(3, "0")}`;
  const productId = productIds.get(sku);
  if (!productId) throw new Error(`${sku} DB ID를 찾지 못했습니다.`);
  const uniqueColors = [...new Set(seed.color.split(",").map((color) => color.trim()).filter(Boolean))];
  return uniqueColors.map((name, sortOrder) => ({
    product_id: productId,
    name,
    sort_order: sortOrder,
  }));
});

const { error: colorsError } = await supabase
  .from("product_colors")
  .upsert(colorRows, { onConflict: "product_id,name" });
if (colorsError) throw colorsError;

console.log(JSON.stringify({ bucket: bucketName, uploadedImages: imageUrls.size, products: savedProducts.length, colors: colorRows.length }));
