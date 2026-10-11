import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { CustomerEntity } from "../entities/customer.entity";
import { CustomerPaymentEntity } from "../entities/customer-payment.entity";
import { ItemStatus } from "../entities/item-status.enum";
import { OrderItemEntity } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";
import { OrderGateway } from "../realtime/order.gateway";

type CloseTabPaymentBody = {
  cashAmount: number;
  cardAmount: number;
};

@Controller("customers")
export class CustomersController {
  constructor(
    @InjectRepository(CustomerEntity) private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity) private readonly orderItems: Repository<OrderItemEntity>,
    private readonly gateway: OrderGateway,
    private readonly dataSource: DataSource
  ) {}

  @Get()
  async getCustomers() {
    return { customers: await this.customers.find() };
  }

  @Get(":customerId/tab")
  async getCustomerTab(@Param("customerId") customerId: string) {
    const customer = await this.customers.findOne({
      where: { id: customerId },
      relations: {
        orders: {
          items: {
            product: true,
          },
        },
      },
    });

    if (!customer) {
      return {
        name: "Unknown Customer",
        isTabOpen: false,
        totalAmount: 0,
        orders: [],
        paidTodayOrders: [],
      };
    }

    const openOrders = (customer.orders || []).filter((order) => !order.isPaid);
    const today = new Date();
    const startOfToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
    const paidOrdersToday = (customer.orders || []).filter(
      (order) =>
        order.isPaid &&
        order.createdAt >= startOfToday &&
        order.createdAt < startOfTomorrow
    );
    const totalAmount = openOrders
      .flatMap((order) => order.items || [])
      .reduce((sum, item) => sum + Number(item.priceAtPurchase), 0);

    return {
      name: customer.name,
      isTabOpen: customer.isTabOpen,
      totalAmount,
      orders: openOrders,
      paidTodayOrders: paidOrdersToday,
    };
  }

  @Patch(":customerId/close-tab")
  async closeTab(
    @Param("customerId") customerId: string,
    @Body() body: CloseTabPaymentBody
  ) {
    const cashAmount = Number(body?.cashAmount);
    const cardAmount = Number(body?.cardAmount);
    if (
      !Number.isFinite(cashAmount) ||
      !Number.isFinite(cardAmount) ||
      cashAmount < 0 ||
      cardAmount < 0
    ) {
      throw new BadRequestException("Informe valores válidos para dinheiro e maquineta.");
    }

    return this.dataSource.transaction(async (manager) => {
      const customer = await manager.findOne(CustomerEntity, {
        where: { id: customerId },
      });
      if (!customer) {
        throw new NotFoundException("Cliente não encontrado.");
      }

      const openOrders = await manager.find(OrderEntity, {
        where: { customerId, isPaid: false },
        relations: { items: true },
      });
      const totalCents = openOrders
        .flatMap((order) => order.items || [])
        .reduce((sum, item) => sum + Math.round(Number(item.priceAtPurchase) * 100), 0);
      const paymentCents =
        Math.round(cashAmount * 100) + Math.round(cardAmount * 100);

      if (paymentCents !== totalCents) {
        throw new BadRequestException(
          "A soma dos valores em dinheiro e maquineta deve corresponder ao total da conta."
        );
      }

      const paidAt = new Date();
      await manager.save(
        CustomerPaymentEntity,
        manager.create(CustomerPaymentEntity, {
          customerId,
          cashAmount: Math.round(cashAmount * 100) / 100,
          cardAmount: Math.round(cardAmount * 100) / 100,
          paidAt,
        })
      );

      customer.isTabOpen = false;
      await manager.save(customer);

      for (const order of openOrders) {
        order.isPaid = true;
        order.paidAt = paidAt;
      }
      await manager.save(openOrders);

      return {
        message: `Conta de ${customer.name} fechada e pedidos marcados como pagos.`,
      };
    });
  }

  @Delete(":customerId/items/:productId")
  async deleteItemFromTab(
    @Param("customerId") customerId: string,
    @Param("productId") productId: string
  ) {
    const openOrders = await this.orders.find({
      where: { customerId, isPaid: false },
      relations: { items: true },
    });

    let itemToRemove: OrderItemEntity | null = null;
    for (const order of openOrders) {
      itemToRemove =
        order.items?.find((item) => item.productId === productId && item.status !== ItemStatus.Delivered) ??
        null;
      if (itemToRemove) break;
    }

    if (!itemToRemove) {
      return { message: "Item not found or already delivered." };
    }

    const cancelledItemId = itemToRemove.id;
    await this.orderItems.remove(itemToRemove);
    this.gateway.sendItemCancelled(cancelledItemId);

    return { message: "Item removed from tab successfully." };
  }
}
