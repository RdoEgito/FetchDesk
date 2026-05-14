import { Controller, Get, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { OrderEntity } from "../entities/order.entity";

@Controller("reports")
export class ReportsController {
  constructor(
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>
  ) {}

  @Get("daily")
  async getDailyReport(@Query("date") date?: string) {
    const reportDate = date
      ? new Date(`${date}T00:00:00.000Z`)
      : new Date();

    if (isNaN(reportDate.getTime())) {
      return {
        message: "Data inválida. Use o formato yyyy-MM-dd.",
      };
    }

    const startDate = new Date(Date.UTC(reportDate.getUTCFullYear(), reportDate.getUTCMonth(), reportDate.getUTCDate()));
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const orders = await this.orders.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: {
        items: {
          product: true,
        },
      },
    });

    const items = orders.flatMap((order) => order.items || []);
    const totalRevenue = items.reduce((sum, item) => sum + Number(item.priceAtPurchase), 0);
    const totalOrders = orders.length;
    const totalItems = items.length;

    const buyers = orders
      .reduce((acc, order) => {
        const entry = acc.get(order.customerName) ?? { buyerName: order.customerName, orderCount: 0, revenue: 0 };
        entry.orderCount += 1;
        entry.revenue += order.items?.reduce((subSum, item) => subSum + Number(item.priceAtPurchase), 0) ?? 0;
        acc.set(order.customerName, entry);
        return acc;
      }, new Map<string, { buyerName: string; orderCount: number; revenue: number }>())
      .values();

    const buyersList = Array.from(buyers).sort((a, b) => b.revenue - a.revenue || a.buyerName.localeCompare(b.buyerName));

    const products = items
      .reduce((acc, item) => {
        const key = `${item.productId}:${item.product.name}`;
        const entry = acc.get(key) ?? {
          productId: item.productId,
          productName: item.product.name,
          quantity: 0,
          revenue: 0,
        };
        entry.quantity += 1;
        entry.revenue += Number(item.priceAtPurchase);
        acc.set(key, entry);
        return acc;
      }, new Map<string, { productId: string; productName: string; quantity: number; revenue: number }>())
      .values();

    const productsList = Array.from(products).sort((a, b) => b.quantity - a.quantity || a.productName.localeCompare(b.productName));

    return {
      date: startDate.toISOString().slice(0, 10),
      totalOrders,
      totalItems,
      totalRevenue,
      buyers: buyersList,
      products: productsList,
    };
  }
}
