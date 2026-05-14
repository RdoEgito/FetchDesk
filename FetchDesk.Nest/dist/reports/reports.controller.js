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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
let ReportsController = class ReportsController {
    constructor(orders) {
        this.orders = orders;
    }
    async getDailyReport(date) {
        const reportDate = date
            ? new Date(`${date}T00:00:00.000Z`)
            : new Date();
        if (isNaN(reportDate.getTime())) {
            return {
                message: "Data inválida. Use o formato yyyy-MM-dd.",
            };
        }
        const startDate = new Date(Date.UTC(reportDate.getUTCFullYear(), reportDate.getUTCMonth(), reportDate.getUTCDate()));
        const endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + 1);
        const orders = await this.orders.find({
            where: {
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: {
                items: {
                    product: true,
                },
            },
        });
        const items = orders.flatMap((order) => order.items || []);
        const totalRevenue = items.reduce((sum, item) => sum + Number(item.priceAtPurchase), 0);
        const totalOrders = orders.length;
        const totalItems = items.length;
        const buyers = orders
            .reduce((acc, order) => {
            const entry = acc.get(order.customerName) ?? {
                buyerName: order.customerName,
                orderCount: 0,
                revenue: 0,
                orders: []
            };
            entry.orderCount += 1;
            entry.revenue += order.items?.reduce((subSum, item) => subSum + Number(item.priceAtPurchase), 0) ?? 0;
            entry.orders.push({
                id: order.id,
                isPaid: order.isPaid,
                total: order.items?.reduce((subSum, item) => subSum + Number(item.priceAtPurchase), 0) ?? 0,
                items: order.items?.map(item => ({
                    productId: item.productId,
                    productName: item.product.name,
                    quantity: 1,
                    unitPrice: Number(item.priceAtPurchase),
                })) ?? []
            });
            acc.set(order.customerName, entry);
            return acc;
        }, new Map())
            .values();
        const buyersList = Array.from(buyers).sort((a, b) => b.revenue - a.revenue || a.buyerName.localeCompare(b.buyerName));
        const products = items
            .reduce((acc, item) => {
            const key = `${item.productId}:${item.product.name}`;
            const entry = acc.get(key) ?? {
                productId: item.productId,
                productName: item.product.name,
                quantity: 0,
                revenue: 0,
            };
            entry.quantity += 1;
            entry.revenue += Number(item.priceAtPurchase);
            acc.set(key, entry);
            return acc;
        }, new Map())
            .values();
        const productsList = Array.from(products).sort((a, b) => b.quantity - a.quantity || a.productName.localeCompare(b.productName));
        return {
            date: startDate.toISOString().slice(0, 10),
            totalOrders,
            totalItems,
            totalRevenue,
            buyers: buyersList,
            products: productsList,
        };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)("daily"),
    __param(0, (0, common_1.Query)("date")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getDailyReport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)("reports"),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map