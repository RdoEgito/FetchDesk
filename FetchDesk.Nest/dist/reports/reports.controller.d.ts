import { Repository } from "typeorm";
import { OrderEntity } from "../entities/order.entity";
export declare class ReportsController {
    private readonly orders;
    constructor(orders: Repository<OrderEntity>);
    getDailyReport(date?: string): Promise<{
        message: string;
        date?: undefined;
        totalOrders?: undefined;
        totalItems?: undefined;
        totalRevenue?: undefined;
        buyers?: undefined;
        products?: undefined;
    } | {
        date: string;
        totalOrders: number;
        totalItems: number;
        totalRevenue: number;
        buyers: any[];
        products: {
            productId: string;
            productName: string;
            quantity: number;
            revenue: number;
        }[];
        message?: undefined;
    }>;
}
