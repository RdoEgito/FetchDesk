import { Body, Controller, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CustomerEntity } from "../entities/customer.entity";
import { OrderItemEntity } from "../entities/order-item.entity";
import { OrderEntity } from "../entities/order.entity";
import { ProductEntity } from "../entities/product.entity";
import { ItemStatus } from "../entities/item-status.enum";
import { RabbitService } from "../rabbit/rabbit.service";

type CreateOrderBody = {
  customerName: string;
  items: Array<{ productId: string; quantity: number }>;
};

@Controller("orders")
export class OrdersController {
  constructor(
    @InjectRepository(CustomerEntity) private readonly customers: Repository<CustomerEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity) private readonly orderItems: Repository<OrderItemEntity>,
    private readonly rabbit: RabbitService
  ) {}

  @Post()
  async createOrder(@Body() body: CreateOrderBody) {
    let customer = await this.customers.findOne({ where: { name: body.customerName } });
    if (!customer) {
      customer = await this.customers.save(
        this.customers.create({ name: body.customerName, isTabOpen: true })
      );
    } else if (!customer.isTabOpen) {
      customer.isTabOpen = true;
      customer = await this.customers.save(customer);
    }

    const productIds = body.items.map((item) => item.productId);
    const productsInDb = await this.products.find({
      where: { id: In(productIds), isActive: true },
    });
    const productsMap = new Map(productsInDb.map((product) => [product.id, product]));

    const order = await this.orders.save(
      this.orders.create({
        customerId: customer.id,
        customerName: customer.name,
        isPaid: false,
        paidAt: null,
      })
    );

    const createdItems: OrderItemEntity[] = [];
    for (const requestedItem of body.items) {
      const product = productsMap.get(requestedItem.productId);
      if (!product) continue;
      for (let i = 0; i < requestedItem.quantity; i += 1) {
        const created = this.orderItems.create({
          orderId: order.id,
          productId: product.id,
          priceAtPurchase: product.currentPrice,
          status: ItemStatus.Pending,
          deliveredAt: null,
        });
        createdItems.push(created);
      }
    }

    const savedItems = await this.orderItems.save(createdItems);

    await this.rabbit.publishOrderPlaced({
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.name,
      items: savedItems.map((item) => {
        const product = productsMap.get(item.productId);
        return {
          itemId: item.id,
          productId: item.productId,
          productName: product?.name ?? "",
        };
      }),
    });

    return {
      message: "Pedido criado com sucesso!",
      orderId: order.id,
      items: savedItems,
    };
  }
}
