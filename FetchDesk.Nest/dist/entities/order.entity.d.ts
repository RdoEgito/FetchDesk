import { CustomerEntity } from "./customer.entity";
import { OrderItemEntity } from "./order-item.entity";
export declare class OrderEntity {
    id: string;
    customerId: string;
    customer: CustomerEntity;
    customerName: string;
    createdAt: Date;
    isPaid: boolean;
    paidAt: Date | null;
    items: OrderItemEntity[];
}
