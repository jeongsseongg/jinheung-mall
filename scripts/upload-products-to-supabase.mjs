import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const projectRoot = resolve(import.meta.dirname, "..");
const bucketName = "product-images";
const storagePrefix = "optimized";
const maxDimension = 1200;
const webpQuality = 82;
const cacheControl = "31536000";

function parseArguments(argv) {
  const options = {
    dryRun: false,
    help: false,
    mapPath: resolve(projectRoot, "supabase/product-image-map.json"),
    photoRoot: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else if (argument === "--map" || argument === "--photo-root") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} 뒤에 경로를 입력해주세요.`);
      }
      index += 1;
      if (argument === "--map") options.mapPath = resolve(value);
      if (argument === "--photo-root") options.photoRoot = resolve(value);
    } else if (argument.startsWith("--map=")) {
      options.mapPath = resolve(argument.slice("--map=".length));
    } else if (argument.startsWith("--photo-root=")) {
      options.photoRoot = resolve(argument.slice("--photo-root=".length));
    } else {
      throw new Error(`알 수 없는 옵션입니다: ${argument}`);
    }
  }

  return options;
}

function printHelp() {
  console.log([
    "상품 이미지를 WebP로 최적화한 뒤 Supabase Storage와 products.image_url을 갱신합니다.",
    "",
    "사용법:",
    "  node scripts/upload-products-to-supabase.mjs [--dry-run] [--map <파일>] [--photo-root <폴더>]",
    "",
    "옵션:",
    "  --dry-run          로컬 변환과 검증만 실행하며 네트워크 요청을 보내지 않습니다.",
    "  --map              product-image-map.json 경로를 지정합니다.",
    "  --photo-root       매핑의 sourceFile을 해석할 원본 사진 폴더를 지정합니다.",
  ].join("\n"));
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      const key = line.slice(0, separator).replace(/^export\s+/, "").trim();
      let value = line.slice(separator + 1).trim();
      if (
        value.length >= 2
        && ((value.startsWith('"') && value.endsWith('"'))
          || (value.startsWith("'") && value.endsWith("'")))
      ) {
        value = value.slice(1, -1);
      }
      return [key, value];
    }));
}

function readProductSeeds() {
  const seedSource = readFileSync(resolve(projectRoot, "app/lib/oraedam-products.ts"), "utf8");
  const seedMatch = seedSource.match(/export const productSeeds: ProductSeed\[\] = (\[[\s\S]*\]);/);
  if (!seedMatch) throw new Error("상품 데이터 배열을 찾지 못했습니다.");
  return JSON.parse(seedMatch[1]);
}

function readMappings(mapPath) {
  if (!existsSync(mapPath)) {
    throw new Error("상품 이미지 매핑 파일이 없습니다. map-product-images.mjs를 먼저 실행하거나 --map 경로를 지정해주세요.");
  }

  const mappings = JSON.parse(readFileSync(mapPath, "utf8"));
  if (!Array.isArray(mappings)) throw new Error("상품 이미지 매핑은 배열이어야 합니다.");
  return mappings;
}

function orderAndValidateMappings(seeds, mappings) {
  if (seeds.length === 0 || mappings.length !== seeds.length) {
    throw new Error(`상품과 이미지 수가 일치하지 않습니다: 상품 ${seeds.length}개, 이미지 ${mappings.length}개`);
  }

  const bySku = new Map();
  for (const mapping of mappings) {
    if (!mapping || typeof mapping.sku !== "string" || !/^JH-FL-\d{3}$/.test(mapping.sku)) {
      throw new Error("이미지 매핑에 올바르지 않은 SKU가 있습니다.");
    }
    if (bySku.has(mapping.sku)) throw new Error(`중복 이미지 매핑입니다: ${mapping.sku}`);
    if (typeof mapping.sourceFile !== "string" && typeof mapping.sourcePath !== "string") {
      throw new Error(`${mapping.sku} 원본 이미지 경로가 없습니다.`);
    }
    bySku.set(mapping.sku, mapping);
  }

  return seeds.map((_, index) => {
    const sku = `JH-FL-${String(index + 1).padStart(3, "0")}`;
    const mapping = bySku.get(sku);
    if (!mapping) throw new Error(`이미지 매핑이 없습니다: ${sku}`);
    return mapping;
  });
}

function isPathInside(rootPath, candidatePath) {
  const pathFromRoot = relative(rootPath, candidatePath);
  return pathFromRoot === "" || (!pathFromRoot.startsWith("..") && !isAbsolute(pathFromRoot));
}

function resolveSourcePath(mapping, explicitPhotoRoot) {
  const defaultPhotoRoot = resolve(projectRoot, "상품 첫화면 사진");
  const photoRoot = explicitPhotoRoot ?? defaultPhotoRoot;

  if (typeof mapping.sourceFile === "string" && mapping.sourceFile.trim()) {
    const sourcePath = resolve(photoRoot, mapping.sourceFile);
    if (!isPathInside(photoRoot, sourcePath)) {
      throw new Error(`${mapping.sku} sourceFile이 원본 사진 폴더 밖을 가리킵니다.`);
    }
    if (existsSync(sourcePath)) return sourcePath;
  }

  if (!explicitPhotoRoot && typeof mapping.sourcePath === "string" && existsSync(mapping.sourcePath)) {
    return resolve(mapping.sourcePath);
  }

  throw new Error(`${mapping.sku} 원본 이미지를 찾지 못했습니다. --photo-root 경로를 확인해주세요.`);
}

async function optimizeImage(mapping, photoRoot) {
  const sourcePath = resolveSourcePath(mapping, photoRoot);
  const sourceStat = statSync(sourcePath);
  if (!sourceStat.isFile()) throw new Error(`${mapping.sku} 원본 경로가 파일이 아닙니다.`);

  const { data, info } = await sharp(sourcePath, {
    failOn: "error",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: webpQuality,
      alphaQuality: 90,
      smartSubsample: true,
      preset: "photo",
      effort: 5,
    })
    .toBuffer({ resolveWithObject: true });

  if (
    info.format !== "webp"
    || !info.width
    || !info.height
    || info.width > maxDimension
    || info.height > maxDimension
    || data.length === 0
  ) {
    throw new Error(`${mapping.sku} WebP 변환 결과가 올바르지 않습니다.`);
  }

  const digest = createHash("sha256").update(data).digest("hex").slice(0, 16);
  return {
    sku: mapping.sku,
    buffer: data,
    sourceBytes: sourceStat.size,
    outputBytes: data.length,
    width: info.width,
    height: info.height,
    storageFile: `${storagePrefix}/${mapping.sku}-${digest}.webp`,
  };
}

function buildSummary(images) {
  const sourceBytes = images.reduce((total, image) => total + image.sourceBytes, 0);
  const outputBytes = images.reduce((total, image) => total + image.outputBytes, 0);
  const savedBytes = Math.max(0, sourceBytes - outputBytes);
  const reductionPercent = sourceBytes > 0
    ? Number(((savedBytes / sourceBytes) * 100).toFixed(2))
    : 0;

  return {
    images: images.length,
    sourceBytes,
    outputBytes,
    savedBytes,
    reductionPercent,
    maxOutputWidth: Math.max(...images.map((image) => image.width)),
    maxOutputHeight: Math.max(...images.map((image) => image.height)),
    format: "webp",
    quality: webpQuality,
    maxDimension,
    cacheControlSeconds: Number(cacheControl),
  };
}

function isDuplicateObjectError(error) {
  const status = String(error?.statusCode ?? error?.status ?? "");
  return status === "409" || /duplicate|already exists/i.test(error?.message ?? "");
}

async function ensureBucket(supabase) {
  const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
  if (bucketListError) throw new Error(`Storage 버킷 조회 실패: ${bucketListError.message}`);

  const bucketOptions = {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  };

  const bucketExists = (buckets ?? []).some((bucket) => bucket.name === bucketName);
  const { error } = bucketExists
    ? await supabase.storage.updateBucket(bucketName, bucketOptions)
    : await supabase.storage.createBucket(bucketName, bucketOptions);
  if (error) throw new Error(`Storage 버킷 준비 실패: ${error.message}`);
}

async function listExistingOptimizedImages(supabase) {
  const { data, error } = await supabase.storage.from(bucketName).list(storagePrefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });
  if (error) throw new Error(`기존 최적화 이미지 조회 실패: ${error.message}`);
  return new Set((data ?? []).map((file) => `${storagePrefix}/${file.name}`));
}

async function uploadOptimizedImages(supabase, images) {
  const existingFiles = await listExistingOptimizedImages(supabase);
  const imageUrls = new Map();
  let uploadedImages = 0;
  let reusedImages = 0;

  for (const image of images) {
    if (existingFiles.has(image.storageFile)) {
      reusedImages += 1;
    } else {
      const { error } = await supabase.storage.from(bucketName).upload(image.storageFile, image.buffer, {
        contentType: "image/webp",
        cacheControl,
        upsert: false,
      });
      if (error && !isDuplicateObjectError(error)) {
        throw new Error(`${image.sku} 이미지 업로드 실패: ${error.message}`);
      }
      if (error) reusedImages += 1;
      else uploadedImages += 1;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(image.storageFile);
    if (!data.publicUrl) throw new Error(`${image.sku} 공개 이미지 URL을 만들지 못했습니다.`);
    imageUrls.set(image.sku, data.publicUrl);
  }

  return { imageUrls, uploadedImages, reusedImages };
}

async function saveProducts(supabase, seeds, imageUrls) {
  const productRows = seeds.map((seed, index) => {
    const number = String(index + 1).padStart(3, "0");
    const sku = `JH-FL-${number}`;
    const bushCount = Number(seed.unit.match(/(\d+)부쉬/)?.[1] ?? 0) || null;
    const imageUrl = imageUrls.get(sku);
    if (!imageUrl) throw new Error(`${sku} 이미지 URL이 없습니다.`);

    return {
      sku,
      slug: `jh-flower-${number}`,
      name: seed.name,
      description: `${seed.color} 색상 그룹의 ${seed.unit} 조화 상품`,
      price: Number(seed.basePrice),
      bush_count: bushCount,
      sales_unit: "단",
      image_url: imageUrl,
      is_active: true,
      metadata: { specification: seed.unit, note: seed.note || null, stock_unconfirmed: true },
    };
  });

  const { data: savedProducts, error: productsError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "sku" })
    .select("id,sku");
  if (productsError) throw new Error(`상품 저장 실패: ${productsError.message}`);
  if (!savedProducts || savedProducts.length !== productRows.length) {
    throw new Error("저장된 상품 수가 예상과 다릅니다.");
  }

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
  if (colorsError) throw new Error(`상품 색상 저장 실패: ${colorsError.message}`);

  return { products: savedProducts.length, colors: colorRows.length };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const seeds = readProductSeeds();
  const mappings = orderAndValidateMappings(seeds, readMappings(options.mapPath));
  const optimizedImages = [];

  for (const mapping of mappings) {
    optimizedImages.push(await optimizeImage(mapping, options.photoRoot));
  }

  const conversion = buildSummary(optimizedImages);
  if (options.dryRun) {
    console.log(JSON.stringify({
      mode: "dry-run",
      networkRequests: 0,
      sourceFilesModified: 0,
      conversion,
    }));
    return;
  }

  const envFile = parseEnvFile(resolve(projectRoot, ".env.local"));
  const projectUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? envFile.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/+$/, "");
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? envFile.SUPABASE_SECRET_KEY;
  if (!projectUrl || !secretKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SECRET_KEY가 필요합니다.");
  }

  const supabase = createClient(projectUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  await ensureBucket(supabase);
  const upload = await uploadOptimizedImages(supabase, optimizedImages);
  const database = await saveProducts(supabase, seeds, upload.imageUrls);

  console.log(JSON.stringify({
    mode: "upload",
    bucket: bucketName,
    uploadedImages: upload.uploadedImages,
    reusedImages: upload.reusedImages,
    products: database.products,
    colors: database.colors,
    conversion,
  }));
}

try {
  await main();
} catch (error) {
  console.error(`상품 이미지 처리 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
  process.exitCode = 1;
}
