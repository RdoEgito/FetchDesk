import { Repository } from "typeorm";
import { CustomerEntity } from "../entities/customer.entity";
import { OrderItemEntity } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";
import { OrderGateway } from "../realtime/order.gateway";
export declare class CustomersController {
    private readonly customers;
    private readonly orders;
    private readonly orderItems;
    private readonly gateway;
    constructor(customers: Repository<CustomerEntity>, orders: Repository<OrderEntity>, orderItems: Repository<OrderItemEntity>, gateway: OrderGateway);
    getCustomers(): Promise<{
        customers: CustomerEntity[];
    }>;
    getCustomerTab(customerId: string): Promise<{
        name: string;
        isTabOpen: boolean;
        totalAmount: number;
        orders: OrderEntity[];
    }>;
    closeTab(customerId: string): Promise<{
        message: string;
    }>;
    deleteItemFromTab(customerId: string, productId: string): Promise<{
        message: string;
    }>;
}
