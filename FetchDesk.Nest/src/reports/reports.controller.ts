import { Controller, Get, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { And, LessThan, MoreThanOrEqual, Repository } from "typeorm";
import { OrderEntity } from "../entities/order.entity";

const parseDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
};

@Controller("reports")
export class ReportsController {
  constructor(
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>
  ) {}

  @Get("daily")
  async getDailyReport(
    @Query("date") date?: string,
    @Query("startDate") startDateValue?: string,
    @Query("endDate") endDateValue?: string
  ) {
    const startDate = startDateValue
      ? parseDate(startDateValue)
      : date
        ? parseDate(date)
        : parseDate(new Date().toISOString().slice(0, 10));
    const endDate = endDateValue ? parseDate(endDateValue) : startDate;

    if (!startDate || !endDate) {
      return {
        message: "Data inválida. Use o formato yyyy-MM-dd.",
      };
    }

    if (endDate < startDate) {
      return {
        message: "A data final deve ser igual ou posterior à data inicial.",
      };
    }

    const endExclusive = new Date(endDate);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    const orders = await this.orders.find({
      where: {
        createdAt: And(MoreThanOrEqual(startDate), LessThan(endExclusive)),
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
        const entry = acc.get(order.customerName) ?? { 
          buyerName: order.customerName, 
          orderCount: 0, 
          revenue: 0,
          orders: [] 
        };
        entry.orderCount += 1;
        entry.revenue += order.items?.reduce((subSum, item) => subSum + Number(item.priceAtPurchase), 0) ?? 0;
        entry.orders.push({
          id: order.id,
          isPaid: order.isPaid,
          total: order.items?.reduce((subSum, item) => subSum + Number(item.priceAtPurchase), 0) ?? 0,
          items: order.items?.map(item => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: 1,
            unitPrice: Number(item.priceAtPurchase),
          })) ?? []
        });
        acc.set(order.customerName, entry);
        return acc;
      }, new Map<string, any>())
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

  @Get("dates")
  async getDatesWithOrders(@Query("month") month?: string) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return { message: "Mês inválido. Use o formato yyyy-MM." };
    }

    const monthStart = parseDate(`${month}-01`);
    if (!monthStart) {
      return { message: "Mês inválido. Use o formato yyyy-MM." };
    }

    const nextMonth = new Date(monthStart);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    const orders = await this.orders.find({
      select: { createdAt: true },
      where: {
        createdAt: And(MoreThanOrEqual(monthStart), LessThan(nextMonth)),
      },
    });

    return {
      dates: Array.from(
        new Set(orders.map((order) => order.createdAt.toISOString().slice(0, 10)))
      ).sort(),
    };
  }
}
