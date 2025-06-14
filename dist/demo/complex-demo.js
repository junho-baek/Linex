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
    constructor(orderId, userId, items, status, createdAt = new Date()) {
        this.orderId = orderId;
        this.userId = userId;
        this.items = items;
        this.status = status;
        this.createdAt = createdAt;
    }
    getTotal(products) {
        // 실제 구현은 생략
        return this.items.reduce((sum, item) => sum + 10000 * item.qty, 0);
    }
}
// 결제 함수 (주문 의존)
export function processPayment(order, amount) {
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
    constructor(name) {
        this.name = name;
        this.subscribers = [];
    }
    subscribe(userId) {
        this.subscribers.push(userId);
    }
    notifyAll(message) {
        return this.subscribers.map((id) => ({ id, message }));
    }
}
// 주소 스키마
export const addressSchema = {
    id: "addr_001",
    userId: "user_001",
    street: "123 Main St",
    city: "Seoul",
    zip: "12345",
    country: "KR",
    isDefault: true,
};
