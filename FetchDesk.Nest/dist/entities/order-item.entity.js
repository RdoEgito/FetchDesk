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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItemEntity = void 0;
const typeorm_1 = require("typeorm");
const item_status_enum_1 = require("./item-status.enum");
const order_entity_1 = require("./order.entity");
const product_entity_1 = require("./product.entity");
let OrderItemEntity = class OrderItemEntity {
};
exports.OrderItemEntity = OrderItemEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_entity_1.OrderEntity, (order) => order.items, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "orderId" }),
    __metadata("design:type", order_entity_1.OrderEntity)
], OrderItemEntity.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.ProductEntity, { onDelete: "RESTRICT" }),
    (0, typeorm_1.JoinColumn)({ name: "productId" }),
    __metadata("design:type", product_entity_1.ProductEntity)
], OrderItemEntity.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], OrderItemEntity.prototype, "priceAtPurchase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: item_status_enum_1.ItemStatus, default: item_status_enum_1.ItemStatus.Pending }),
    __metadata("design:type", String)
], OrderItemEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], OrderItemEntity.prototype, "deliveredAt", void 0);
exports.OrderItemEntity = OrderItemEntity = __decorate([
    (0, typeorm_1.Entity)("order_items")
], OrderItemEntity);
//# sourceMappingURL=order-item.entity.js.map