"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../entities/customer.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const order_entity_1 = require("../entities/order.entity");
const product_entity_1 = require("../entities/product.entity");
const item_status_enum_1 = require("../entities/item-status.enum");
const rabbit_service_1 = require("../rabbit/rabbit.service");
let OrdersController = class OrdersController {
    constructor(customers, products, orders, orderItems, rabbit) {
        this.customers = customers;
        this.products = products;
        this.orders = orders;
        this.orderItems = orderItems;
        this.rabbit = rabbit;
    }
    async createOrder(body) {
        let customer = await this.customers.findOne({ where: { name: body.customerName } });
        if (!customer) {
            customer = await this.customers.save(this.customers.create({ name: body.customerName, isTabOpen: true }));
        }
        else if (!customer.isTabOpen) {
            customer.isTabOpen = true;
            customer = await this.customers.save(customer);
        }
        const productIds = body.items.map((item) => item.productId);
        const productsInDb = await this.products.find({
            where: { id: (0, typeorm_2.In)(productIds), isActive: true },
        });
        const productsMap = new Map(productsInDb.map((product) => [product.id, product]));
        const order = await this.orders.save(this.orders.create({
            customerId: customer.id,
            customerName: customer.name,
            isPaid: false,
            paidAt: null,
        }));
        const createdItems = [];
        for (const requestedItem of body.items) {
            const product = productsMap.get(requestedItem.productId);
            if (!product)
                continue;
            for (let i = 0; i < requestedItem.quantity; i += 1) {
                const created = this.orderItems.create({
                    orderId: order.id,
                    productId: product.id,
                    priceAtPurchase: product.currentPrice,
                    status: item_status_enum_1.ItemStatus.Pending,
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
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)("orders"),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.CustomerEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        rabbit_service_1.RabbitService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map