export type Product = {
  id: string;
  name: string;
  category: string;
  color: string;
  image: string;
  consumerPrice: number;
  businessPrice: number;
  unit: string;
  minOrder: number;
  stock: "충분" | "보통" | "소량";
  isNew?: boolean;
  isBest?: boolean;
  monthlyOrders: number;
  description: string;
};

export const categories = [
  "전체",
  "꽃가지",
  "부쉬",
  "그린소재",
  "대형조화",
  "화분·화기",
  "시즌상품",
];

export const products: Product[] = [
  {
    id: "peony-blush",
    name: "프리미엄 피오니 가지",
    category: "꽃가지",
    color: "블러쉬핑크",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 2800,
    businessPrice: 2200,
    unit: "12개 / 1단",
    minOrder: 1,
    stock: "충분",
    isBest: true,
    monthlyOrders: 184,
    description: "풍성한 겹과 자연스러운 색감으로 매장 디스플레이와 센터피스에 잘 어울리는 피오니 조화입니다.",
  },
  {
    id: "tulip-cream",
    name: "리얼 터치 튤립 10송이",
    category: "부쉬",
    color: "크림",
    image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 3000,
    businessPrice: 2400,
    unit: "10송이 / 1부쉬",
    minOrder: 2,
    stock: "충분",
    isNew: true,
    monthlyOrders: 147,
    description: "부드러운 촉감과 은은한 크림 컬러가 특징인 데일리 베스트 상품입니다.",
  },
  {
    id: "eucalyptus-gray",
    name: "유칼립투스 롱 브랜치",
    category: "그린소재",
    color: "그레이그린",
    image: "https://images.unsplash.com/photo-1509423350716-97f2360af8e4?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 1800,
    businessPrice: 1400,
    unit: "6개 / 1단",
    minOrder: 3,
    stock: "보통",
    isBest: true,
    monthlyOrders: 231,
    description: "긴 라인과 차분한 그레이그린 잎으로 대형 연출과 공간 장식에 활용하기 좋습니다.",
  },
  {
    id: "hydrangea-white",
    name: "소프트 수국 부쉬",
    category: "부쉬",
    color: "오프화이트",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 2600,
    businessPrice: 2100,
    unit: "5송이 / 1부쉬",
    minOrder: 2,
    stock: "충분",
    monthlyOrders: 126,
    description: "볼륨감 있는 수국 헤드가 빠르게 공간을 채워주는 실용적인 장식용 조화입니다.",
  },
  {
    id: "rose-coral",
    name: "가든 로즈 스프레이",
    category: "꽃가지",
    color: "코랄",
    image: "https://images.unsplash.com/photo-1495231916356-a86217efff12?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 2300,
    businessPrice: 1800,
    unit: "12개 / 1단",
    minOrder: 2,
    stock: "소량",
    isNew: true,
    monthlyOrders: 98,
    description: "여러 크기의 꽃송이가 한 가지에 구성되어 자연스러운 부케와 화병 연출이 가능합니다.",
  },
  {
    id: "olive-branch",
    name: "내추럴 올리브 브랜치",
    category: "그린소재",
    color: "올리브그린",
    image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 1700,
    businessPrice: 1300,
    unit: "8개 / 1단",
    minOrder: 3,
    stock: "충분",
    monthlyOrders: 203,
    description: "잔잔한 올리브 잎과 유연한 줄기로 카페, 쇼룸, 촬영 공간에 자연스럽게 어울립니다.",
  },
  {
    id: "orchid-white",
    name: "화이트 호접란 스템",
    category: "대형조화",
    color: "화이트",
    image: "https://images.unsplash.com/photo-1496483648148-47c686dc86a8?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 2900,
    businessPrice: 2300,
    unit: "4개 / 1단",
    minOrder: 1,
    stock: "보통",
    isBest: true,
    monthlyOrders: 74,
    description: "길고 우아한 라인으로 로비, 웨딩, 고급 매장 연출에 적합한 대형 호접란입니다.",
  },
  {
    id: "mimosa-yellow",
    name: "미모사 소프트 부쉬",
    category: "시즌상품",
    color: "옐로우",
    image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1000&q=88",
    consumerPrice: 2100,
    businessPrice: 1600,
    unit: "6개 / 1단",
    minOrder: 2,
    stock: "충분",
    isNew: true,
    monthlyOrders: 119,
    description: "작은 꽃망울과 산뜻한 노란색으로 봄 시즌 진열과 포인트 장식에 잘 어울립니다.",
  },
];

export const formatPrice = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export const getProduct = (id: string) => products.find((product) => product.id === id);
