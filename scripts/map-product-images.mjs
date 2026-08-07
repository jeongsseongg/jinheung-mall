import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
let photoRoot = resolve(projectRoot, "상품 첫화면 사진");
let outputPath = resolve(projectRoot, "supabase/product-image-map.json");
const args = process.argv.slice(2);

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === "--photo-root" || argument === "--output") {
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${argument} 뒤에 경로를 입력해주세요.`);
    index += 1;
    if (argument === "--photo-root") photoRoot = resolve(value);
    if (argument === "--output") outputPath = resolve(value);
  } else if (argument.startsWith("--photo-root=")) {
    photoRoot = resolve(argument.slice("--photo-root=".length));
  } else if (argument.startsWith("--output=")) {
    outputPath = resolve(argument.slice("--output=".length));
  } else {
    throw new Error(`알 수 없는 옵션입니다: ${argument}`);
  }
}

const seedSource = readFileSync(resolve(projectRoot, "app/lib/oraedam-products.ts"), "utf8");
const seedMatch = seedSource.match(/export const productSeeds: ProductSeed\[\] = (\[[\s\S]*\]);/);
if (!seedMatch) throw new Error("상품 데이터 배열을 찾지 못했습니다.");

const seeds = JSON.parse(seedMatch[1]);
const photos = readdirSync(photoRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("photo"))
  .sort((a, b) => a.name.localeCompare(b.name, "ko"))
  .flatMap((directory) => readdirSync(resolve(photoRoot, directory.name), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name, "ko", { numeric: true }))
    .map((entry) => {
      const parsed = entry.name.match(/^\d+_(.+)_(\d+(?:부쉬|cm))\.(png|jpg|jpeg|webp)$/i);
      if (!parsed) throw new Error(`파일명 형식을 확인해주세요: ${entry.name}`);
      return {
        directory: directory.name,
        filename: entry.name,
        sourcePath: resolve(photoRoot, directory.name, entry.name),
        productKey: parsed[1],
        specification: parsed[2],
        extension: parsed[3].toLowerCase() === "jpeg" ? "jpg" : parsed[3].toLowerCase(),
      };
    }));

const used = new Set();
const productAliases = {
  "콜러스": "쿨러스",
  "믹스팡팡": "믹스팜팜",
  "카네이션13": "카네션13",
  "수경장미": "수정장미",
  "금국": "들국",
  "미니몰": "미니볼",
};
const productKeyFor = (seed) => {
  if (seed.unit.includes("원형리스")) return `원형리스${seed.name}`;
  if (seed.unit.includes("하트리스")) return `하트리스${seed.name}`;
  return productAliases[seed.name] ?? seed.name;
};

const specificationFor = (seed) => seed.unit.match(/\d+부쉬/)?.[0] ?? seed.unit.match(/\d+cm/)?.[0] ?? "";

const mappings = seeds.map((seed, index) => {
  const key = productKeyFor(seed);
  const specification = specificationFor(seed);
  const exact = photos.findIndex((photo, photoIndex) => !used.has(photoIndex) && photo.productKey === key && photo.specification === specification);
  const fallback = exact >= 0 ? exact : photos.findIndex((photo, photoIndex) => !used.has(photoIndex) && photo.productKey === key);
  if (fallback < 0) throw new Error(`사진을 찾지 못했습니다: ${seed.name} / ${seed.unit} / 검색명 ${key}`);
  used.add(fallback);
  const photo = photos[fallback];
  const number = String(index + 1).padStart(3, "0");
  return {
    index: index + 1,
    sku: `JH-FL-${number}`,
    productName: seed.name,
    unit: seed.unit,
    sourcePath: photo.sourcePath,
    sourceFile: `${photo.directory}/${photo.filename}`,
    storageFile: `JH-FL-${number}.${photo.extension}`,
  };
});

const unused = photos.filter((_, index) => !used.has(index));
if (mappings.length !== seeds.length || unused.length > 0) {
  throw new Error(`매칭 불일치: 상품 ${mappings.length}/${seeds.length}, 미사용 사진 ${unused.length}`);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(mappings, null, 2), "utf8");
console.log(JSON.stringify({ products: seeds.length, photos: photos.length, matched: mappings.length, unused: unused.length, outputPath }));
