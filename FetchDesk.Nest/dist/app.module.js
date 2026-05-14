"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_entity_1 = require("./entities/customer.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_entity_1 = require("./entities/order.entity");
const product_entity_1 = require("./entities/product.entity");
const customers_controller_1 = require("./customers/customers.controller");
const items_controller_1 = require("./items/items.controller");
const orders_controller_1 = require("./orders/orders.controller");
const products_controller_1 = require("./products/products.controller");
const reports_controller_1 = require("./reports/reports.controller");
const health_controller_1 = require("./health.controller");
const order_gateway_1 = require("./realtime/order.gateway");
const rabbit_service_1 = require("./rabbit/rabbit.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: "postgres",
                url: process.env.DATABASE_URL,
                host: process.env.DATABASE_HOST ?? "localhost",
                port: parseInt(process.env.DATABASE_PORT ?? "5432"),
                username: process.env.DATABASE_USER ?? "admin",
                password: process.env.DATABASE_PASSWORD ?? "adminpassword",
                database: process.env.DATABASE_NAME ?? "order_management_db",
                ssl: process.env.DATABASE_SSL === "true"
                    ? { rejectUnauthorized: false }
                    : undefined,
                entities: [product_entity_1.ProductEntity, customer_entity_1.CustomerEntity, order_entity_1.OrderEntity, order_item_entity_1.OrderItemEntity],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([product_entity_1.ProductEntity, customer_entity_1.CustomerEntity, order_entity_1.OrderEntity, order_item_entity_1.OrderItemEntity]),
        ],
        controllers: [
            health_controller_1.HealthController,
            products_controller_1.ProductsController,
            orders_controller_1.OrdersController,
            customers_controller_1.CustomersController,
            items_controller_1.ItemsController,
            reports_controller_1.ReportsController,
        ],
        providers: [order_gateway_1.OrderGateway, rabbit_service_1.RabbitService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map