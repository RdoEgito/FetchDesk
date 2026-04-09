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
                url: process.env.DATABASE_URL ??
                    process.env.ConnectionStrings__DefaultConnection ??
                    "postgres://admin:adminpassword@localhost:5432/order_management_db",
                entities: [product_entity_1.ProductEntity, customer_entity_1.CustomerEntity, order_entity_1.OrderEntity, order_item_entity_1.OrderItemEntity],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([product_entity_1.ProductEntity, customer_entity_1.CustomerEntity, order_entity_1.OrderEntity, order_item_entity_1.OrderItemEntity]),
        ],
        controllers: [products_controller_1.ProductsController, orders_controller_1.OrdersController, customers_controller_1.CustomersController, items_controller_1.ItemsController],
        providers: [order_gateway_1.OrderGateway, rabbit_service_1.RabbitService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map