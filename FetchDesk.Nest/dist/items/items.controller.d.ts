import { Repository } from "typeorm";
import { OrderItemEntity } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";
export declare class ItemsController {
    private readonly orders;
    private readonly orderItems;
    constructor(orders: Repository<OrderEntity>, orderItems: Repository<OrderItemEntity>);
    getOrdersItems(): Promise<{
        ordersItems: {
            itemId: string;
            orderId: string;
            productId: string;
            productName: string;
            customerName: string;
            isDelivered: boolean;
        }[];
    }>;
    deliverItem(itemId: string): Promise<{
        message: string;
    }>;
    revertDeliverItem(itemId: string): Promise<{
        message: string;
    }>;
}
