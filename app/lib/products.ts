import { productSeeds } from "./oraedam-products";

export type Product = {
  id: string;
  databaseId?: string;
  sku?: string;
  name: string;
  category: string;
  color: string;
  image: string | null;
  consumerPrice: number;
  unit: string;
  salesUnit: "단" | "박스" | "카톤";
  minOrder: number;
  stock: "충분" | "보통" | "소량" | "확인 필요";
  stockQuantity?: number;
  isNew?: boolean;
  isBest?: boolean;
  monthlyOrders: number;
  description: string;
  note?: string;
};

export const categories = [
  "전체",
  "꽃가지",
  "부쉬",
  "그린소재",
  "대형조화",
  "화분 · 화기",
  "시즌상품",
];

export const categoryFor = (unit: string) => {
  if (unit.includes("리스")) return "화분 · 화기";
  if (unit.includes("60cm") || unit.includes("55cm")) return "대형조화";
  return "부쉬";
};

const productImages: Record<string, string> = {
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

export const products: Product[] = productSeeds.map((seed, index) => {
  const id = `oraedam-${String(index + 1).padStart(2, "0")}`;

  return {
    id,
    name: seed.name,
    category: categoryFor(seed.unit),
    color: seed.color,
    image: productImages[seed.name] ?? null,
    consumerPrice: seed.basePrice,
    unit: seed.unit,
    salesUnit: "단",
    minOrder: 1,
    stock: "충분",
    isNew: index < 12,
    isBest: index < 8,
    monthlyOrders: 300 - index * 3,
    description: `${seed.color} 색상으로 준비된 ${seed.unit} 규격의 조화입니다.`,
    note: seed.note || undefined,
  };
});

export const formatPrice = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export const getProduct = (id: string) => products.find((product) => product.id === id);
