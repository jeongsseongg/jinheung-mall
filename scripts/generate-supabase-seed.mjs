import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const sourcePath = resolve(projectRoot, "app/lib/oraedam-products.ts");
const outputPath = resolve(projectRoot, "supabase/migrations/002_seed_products.sql");
const source = readFileSync(sourcePath, "utf8");
const match = source.match(/export const productSeeds: ProductSeed\[\] = (\[[\s\S]*\]);/);

if (!match) throw new Error("productSeeds 배열을 찾지 못했습니다.");

const seeds = JSON.parse(match[1]);
const imageByName = {
  "믹스동백": "/products/mix-dongbaek-12bush.png",
  "불국": "/products/bulguk-12bush.png",
  "믹스백합": "/products/mix-baekhap-12bush.png",
  "봉장미": "/products/bong-jangmi-12bush.png",
  "믹스봉장미": "/products/mix-bong-jangmi-12bush.png",
  "부케금잔화36": "/products/bouquet-geumjanhwa-36bush.png",
  "별장미": "/products/byeol-jangmi-12bush.png",
  "백합9": "/products/baekhap-9bush.png",
  "부케장미24": "/products/bouquet-jangmi-24bush.png",
  "부케카네션": "/products/bouquet-carnation-24bush.png",
};

const sqlText = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const nullableText = (value) => value ? sqlText(value) : "null";

const statements = [
  "begin;",
  "",
  "-- 재고는 실제 수량 확인 전까지 0으로 시작합니다.",
];

seeds.forEach((seed, index) => {
  const number = String(index + 1).padStart(3, "0");
  const sku = `JH-FL-${number}`;
  const slug = `jh-flower-${number}`;
  const bushMatch = seed.unit.match(/(\d+)부쉬/);
  const bushCount = bushMatch ? Number(bushMatch[1]) : null;
  const colors = seed.color.split(",").map((color) => color.trim()).filter(Boolean);
  const metadata = JSON.stringify({ specification: seed.unit, note: seed.note || null, stock_unconfirmed: true });

  statements.push(
    `insert into public.products (sku, slug, name, description, price, bush_count, sales_unit, stock_quantity, image_url, is_active, metadata)`,
    `values (${sqlText(sku)}, ${sqlText(slug)}, ${sqlText(seed.name)}, ${sqlText(`${seed.color} 색상 그룹의 ${seed.unit} 조화 상품`)}, ${Number(seed.basePrice)}, ${bushCount ?? "null"}, '단', 0, ${nullableText(imageByName[seed.name])}, true, ${sqlText(metadata)}::jsonb)`,
    `on conflict (sku) do update set name = excluded.name, description = excluded.description, price = excluded.price, bush_count = excluded.bush_count, sales_unit = excluded.sales_unit, image_url = excluded.image_url, metadata = excluded.metadata, updated_at = now();`,
    "",
  );

  colors.forEach((color, colorIndex) => {
    statements.push(
      `insert into public.product_colors (product_id, name, stock_quantity, sort_order)`,
      `select id, ${sqlText(color)}, 0, ${colorIndex} from public.products where sku = ${sqlText(sku)}`,
      `on conflict (product_id, name) do update set sort_order = excluded.sort_order;`,
      "",
    );
  });
});

statements.push("commit;", "");
writeFileSync(outputPath, statements.join("\n"), "utf8");
console.log(JSON.stringify({ products: seeds.length, colors: seeds.reduce((total, seed) => total + seed.color.split(",").filter(Boolean).length, 0), outputPath }));
