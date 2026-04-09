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
exports.ItemsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_status_enum_1 = require("../entities/item-status.enum");
const order_item_entity_1 = require("../entities/order-item.entity");
const order_entity_1 = require("../entities/order.entity");
let ItemsController = class ItemsController {
    constructor(orders, orderItems) {
        this.orders = orders;
        this.orderItems = orderItems;
    }
    async getOrdersItems() {
        const allOrders = await this.orders.find({
            relations: {
                items: {
                    product: true,
                },
            },
        });
        const ordersItems = allOrders.flatMap((order) => (order.items || []).map((item) => ({
            itemId: item.id,
            orderId: order.id,
            productId: item.productId,
            productName: item.product?.name ?? "",
            customerName: order.customerName,
            isDelivered: item.status === item_status_enum_1.ItemStatus.Delivered,
        })));
        return { ordersItems };
    }
    async deliverItem(itemId) {
        const item = await this.orderItems.findOne({ where: { id: itemId } });
        if (!item)
            throw new common_1.NotFoundException();
        if (item.status !== item_status_enum_1.ItemStatus.Delivered) {
            item.status = item_status_enum_1.ItemStatus.Delivered;
            item.deliveredAt = new Date();
            await this.orderItems.save(item);
        }
        return { message: "Item entregue com sucesso!" };
    }
    async revertDeliverItem(itemId) {
        const item = await this.orderItems.findOne({ where: { id: itemId } });
        if (!item) {
            throw new common_1.NotFoundException({ message: "Item não encontrado." });
        }
        if (item.status === item_status_enum_1.ItemStatus.Pending) {
            throw new common_1.BadRequestException({ message: "Item is not delivered yet!" });
        }
        item.status = item_status_enum_1.ItemStatus.Pending;
        item.deliveredAt = null;
        await this.orderItems.save(item);
        return { message: "Entrega do item revertida com sucesso!" };
    }
};
exports.ItemsController = ItemsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "getOrdersItems", null);
__decorate([
    (0, common_1.Patch)(":itemId/deliver"),
    __param(0, (0, common_1.Param)("itemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "deliverItem", null);
__decorate([
    (0, common_1.Patch)(":itemId/deliver/revert"),
    __param(0, (0, common_1.Param)("itemId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ItemsController.prototype, "revertDeliverItem", null);
exports.ItemsController = ItemsController = __decorate([
    (0, common_1.Controller)("items"),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ItemsController);
//# sourceMappingURL=items.controller.js.map