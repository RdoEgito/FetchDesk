import { Repository } from "typeorm";
import { CustomerEntity } from "../entities/customer.entity";
import { OrderItemEntity } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";
import { ProductEntity } from "../entities/product.entity";
import { RabbitService } from "../rabbit/rabbit.service";
type CreateOrderBody = {
    customerName: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
};
export declare class OrdersController {
    private readonly customers;
    private readonly products;
    private readonly orders;
    private readonly orderItems;
    private readonly rabbit;
    constructor(customers: Repository<CustomerEntity>, products: Repository<ProductEntity>, orders: Repository<OrderEntity>, orderItems: Repository<OrderItemEntity>, rabbit: RabbitService);
    createOrder(body: CreateOrderBody): Promise<{
        message: string;
        orderId: string;
        items: OrderItemEntity[];
    }>;
}
export {};
