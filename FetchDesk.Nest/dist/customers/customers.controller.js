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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("../entities/customer.entity");
const item_status_enum_1 = require("../entities/item-status.enum");
const order_item_entity_1 = require("../entities/order-item.entity");
const order_entity_1 = require("../entities/order.entity");
const order_gateway_1 = require("../realtime/order.gateway");
let CustomersController = class CustomersController {
    constructor(customers, orders, orderItems, gateway) {
        this.customers = customers;
        this.orders = orders;
        this.orderItems = orderItems;
        this.gateway = gateway;
    }
    async getCustomers() {
        return { customers: await this.customers.find() };
    }
    async getCustomerTab(customerId) {
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
    async closeTab(customerId) {
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
    async deleteItemFromTab(customerId, productId) {
        const openOrders = await this.orders.find({
            where: { customerId, isPaid: false },
            relations: { items: true },
        });
        let itemToRemove = null;
        for (const order of openOrders) {
            itemToRemove =
                order.items?.find((item) => item.productId === productId && item.status !== item_status_enum_1.ItemStatus.Delivered) ??
                    null;
            if (itemToRemove)
                break;
        }
        if (!itemToRemove) {
            return { message: "Item not found or already delivered." };
        }
        const cancelledItemId = itemToRemove.id;
        await this.orderItems.remove(itemToRemove);
        this.gateway.sendItemCancelled(cancelledItemId);
        return { message: "Item removed from tab successfully." };
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)(":customerId/tab"),
    __param(0, (0, common_1.Param)("customerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getCustomerTab", null);
__decorate([
    (0, common_1.Patch)(":customerId/close-tab"),
    __param(0, (0, common_1.Param)("customerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "closeTab", null);
__decorate([
    (0, common_1.Delete)(":customerId/items/:productId"),
    __param(0, (0, common_1.Param)("customerId")),
    __param(1, (0, common_1.Param)("productId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "deleteItemFromTab", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)("customers"),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.CustomerEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        order_gateway_1.OrderGateway])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map