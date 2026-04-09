import { Controller, Delete, Get, Param, Patch } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomerEntity } from "../entities/customer.entity";
import { ItemStatus } from "../entities/item-status.enum";
import { OrderItemEntity } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";
import { OrderGateway } from "../realtime/order.gateway";

@Controller("customers")
export class CustomersController {
  constructor(
    @InjectRepository(CustomerEntity) private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity) private readonly orderItems: Repository<OrderItemEntity>,
    private readonly gateway: OrderGateway
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
      };
    }

    const openOrders = (customer.orders || []).filter((order) => !order.isPaid);
    const totalAmount = openOrders
      .flatMap((order) => order.items || [])
      .reduce((sum, item) => sum + Number(item.priceAtPurchase), 0);

    return {
      name: customer.name,
      isTabOpen: customer.isTabOpen,
      totalAmount,
      orders: openOrders,
    };
  }

  @Patch(":customerId/close-tab")
  async closeTab(@Param("customerId") customerId: string) {
    const customer = await this.customers.findOne({
      where: { id: customerId },
      relations: { orders: true },
    });

    if (!customer) {
      return { message: "Customer not found." };
    }

    customer.isTabOpen = false;
    await this.customers.save(customer);

    const openOrders = await this.orders.find({
      where: { customerId, isPaid: false },
    });

    for (const order of openOrders) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
    await this.orders.save(openOrders);

    return {
      message: `Tab for customer ${customer.name} has been closed and orders marked as paid.`,
    };
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
