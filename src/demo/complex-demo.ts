// 유저 프로필 타입
export interface Profile {
  age: number;
  bio: string;
  social: {
    twitter?: string;
    github?: string;
    website?: string;
  };
  preferences: Record<string, any>;
}

// 유저 스키마
export const userSchema = {
  id: "user_001",
  name: "Alice",
  email: "alice@example.com",
  roles: ["admin", "user"],
  profile: {
    age: 30,
    bio: "Loves TypeScript",
    social: {
      twitter: "@alice",
      github: "alicehub",
      website: "https://alice.dev",
    },
    preferences: {
      theme: "dark",
      notifications: true,
      language: "ko-KR",
    },
  },
  createdAt: new Date().toISOString(),
  isActive: true,
};

// 상품 스키마
export const productSchema = {
  id: "prod_001",
  name: "Linex T-shirt",
  price: 19900,
  tags: ["apparel", "linex", "limited"],
  stock: 50,
  options: [
    { color: "blue", size: "M" },
    { color: "black", size: "L" },
  ],
  meta: {
    rating: 4.8,
    reviews: [
      { userId: "user_001", comment: "Great!", stars: 5 },
      { userId: "user_002", comment: "Nice fit.", stars: 4 },
    ],
  },
};

// 주문 클래스 (유저, 상품 의존)
export class Order {
  constructor(
    public orderId: string,
    public userId: string,
    public items: Array<{ productId: string; qty: number }>,
    public status: "pending" | "paid" | "shipped" | "cancelled",
    public createdAt: Date = new Date(),
  ) {}
  getTotal(products: (typeof productSchema)[]): number {
    // 실제 구현은 생략
    return this.items.reduce((sum, item) => sum + 10000 * item.qty, 0);
  }
}

// 결제 함수 (주문 의존)
export function processPayment(
  order: Order,
  amount: number,
): { success: boolean; transactionId?: string } {
  if (amount > 0) {
    return { success: true, transactionId: "txn_" + Date.now() };
  }
  return { success: false };
}

// UI 컴포넌트
export const component = {
  name: "OrderSummary",
  props: {
    orderId: "string",
    showDetails: true,
    items: [{ name: "Linex T-shirt", qty: 2 }],
  },
  render: () => "<div>Order Summary</div>",
  methods: {
    print: () => "Printing summary...",
  },
};

// 서비스 클래스 (내부 의존성)
export class NotificationService {
  subscribers: string[] = [];
  constructor(public name: string) {}
  subscribe(userId: string) {
    this.subscribers.push(userId);
  }
  notifyAll(message: string) {
    return this.subscribers.map((id) => ({ id, message }));
  }
}
