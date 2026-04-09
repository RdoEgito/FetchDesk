import { ItemStatus } from "./item-status.enum";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "./product.entity";
export declare class OrderItemEntity {
    id: string;
    orderId: string;
    order: OrderEntity;
    productId: string;
    product: ProductEntity;
    priceAtPurchase: number;
    status: ItemStatus;
    deliveredAt: Date | null;
}
