import { BadRequestException, Controller, Get, NotFoundException, Param, Patch } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ItemStatus } from "../entities/item-status.enum";
import { OrderItemEntity } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";

@Controller("items")
export class ItemsController {
  constructor(
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity) private readonly orderItems: Repository<OrderItemEntity>
  ) {}

  @Get()
  async getOrdersItems() {
    const allOrders = await this.orders.find({
      relations: {
        items: {
          product: true,
        },
      },
    });

    const ordersItems = allOrders.flatMap((order) =>
      (order.items || []).map((item) => ({
        itemId: item.id,
        orderId: order.id,
        productId: item.productId,
        productName: item.product?.name ?? "",
        customerName: order.customerName,
        isDelivered: item.status === ItemStatus.Delivered,
      }))
    );

    return { ordersItems };
  }

  @Patch(":itemId/deliver")
  async deliverItem(@Param("itemId") itemId: string) {
    const item = await this.orderItems.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException();
    if (item.status !== ItemStatus.Delivered) {
      item.status = ItemStatus.Delivered;
      item.deliveredAt = new Date();
      await this.orderItems.save(item);
    }
    return { message: "Item entregue com sucesso!" };
  }

  @Patch(":itemId/deliver/revert")
  async revertDeliverItem(@Param("itemId") itemId: string) {
    const item = await this.orderItems.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException({ message: "Item não encontrado." });
    }
    if (item.status === ItemStatus.Pending) {
      throw new BadRequestException({ message: "Item is not delivered yet!" });
    }
    item.status = ItemStatus.Pending;
    item.deliveredAt = null;
    await this.orderItems.save(item);
    return { message: "Entrega do item revertida com sucesso!" };
  }
}
