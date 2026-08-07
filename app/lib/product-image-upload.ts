import { getSupabaseBrowserClient } from "./supabase-browser";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSourceBytes = 15 * 1024 * 1024;
const maxDimension = 1200;

function canvasToWebp(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("이미지 변환에 실패했습니다.")), "image/webp", 0.82);
  });
}

async function compressImage(file: File) {
  if (!acceptedTypes.has(file.type)) throw new Error("JPG, PNG, WebP 파일만 업로드할 수 있습니다.");
  if (file.size > maxSourceBytes) throw new Error("원본 사진은 15MB 이하만 업로드할 수 있습니다.");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) { bitmap.close(); throw new Error("이미지를 처리할 수 없습니다."); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvasToWebp(canvas);
}

export async function uploadProductImage(file: File, productKey: string) {
  const blob = await compressImage(file);
  const safeKey = productKey.replace(/[^a-zA-Z0-9-]/g, "-").replace(/-+/g, "-") || crypto.randomUUID();
  const path = `admin/${safeKey}-${Date.now()}.webp`;
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage.from("product-images").upload(path, blob, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;
  return {
    url: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl,
    originalBytes: file.size,
    uploadedBytes: blob.size,
  };
}
