import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerEntity } from "./entities/customer.entity";
import { OrderItemEntity } from "./entities/order-item.entity";
import { OrderEntity } from "./entities/order.entity";
import { ProductEntity } from "./entities/product.entity";
import { CustomersController } from "./customers/customers.controller";
import { ItemsController } from "./items/items.controller";
import { OrdersController } from "./orders/orders.controller";
import { ProductsController } from "./products/products.controller";
import { HealthController } from "./health.controller";
import { OrderGateway } from "./realtime/order.gateway";
import { RabbitService } from "./rabbit/rabbit.service";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_HOST ?? "localhost",
      port: parseInt(process.env.DATABASE_PORT ?? "5432"),
      username: process.env.DATABASE_USER ?? "admin",
      password: process.env.DATABASE_PASSWORD ?? "adminpassword",
      database: process.env.DATABASE_NAME ?? "order_management_db",
      entities: [ProductEntity, CustomerEntity, OrderEntity, OrderItemEntity],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([ProductEntity, CustomerEntity, OrderEntity, OrderItemEntity]),
  ],
  controllers: [
    HealthController,
    ProductsController,
    OrdersController,
    CustomersController,
    ItemsController,
  ],
  providers: [OrderGateway, RabbitService],
})
export class AppModule {}
