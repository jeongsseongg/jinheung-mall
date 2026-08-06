import { productSeeds } from "./oraedam-products";

export type Product = {
  id: string;
  name: string;
  category: string;
  color: string;
  image: string | null;
  consumerPrice: number;
  businessPrice: number;
  unit: string;
  minOrder: number;
  stock: "충분" | "보통" | "소량";
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

const categoryFor = (unit: string) => {
  if (unit.includes("리스")) return "화분 · 화기";
  if (unit.includes("60cm") || unit.includes("55cm")) return "대형조화";
  return "부쉬";
};

export const products: Product[] = productSeeds.map((seed, index) => {
  const id = `oraedam-${String(index + 1).padStart(2, "0")}`;

  return {
    id,
    name: seed.name,
    category: categoryFor(seed.unit),
    color: seed.color,
    image: null,
    consumerPrice: seed.basePrice,
    businessPrice: seed.basePrice,
    unit: seed.unit,
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
