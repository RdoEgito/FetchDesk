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
var RabbitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitService = void 0;
const common_1 = require("@nestjs/common");
const amqplib_1 = require("amqplib");
const order_gateway_1 = require("../realtime/order.gateway");
let RabbitService = RabbitService_1 = class RabbitService {
    constructor(gateway) {
        this.gateway = gateway;
        this.logger = new common_1.Logger(RabbitService_1.name);
        this.connection = null;
        this.channel = null;
        this.queueName = "delivery-queue";
        this.reconnectPromise = null;
    }
    async onModuleInit() {
        await this.connectRabbit().catch((error) => {
            this.logger.error("Failed to connect to RabbitMQ on startup", error);
        });
    }
    isChannelUsable(channel) {
        return Boolean(channel) && !channel.closed;
    }
    async connectRabbit() {
        if (this.isChannelUsable(this.channel)) {
            return;
        }
        if (this.reconnectPromise) {
            await this.reconnectPromise;
            return;
        }
        const rabbitUrl = process.env.RABBITMQ_URL;
        if (!rabbitUrl) {
            this.logger.warn("RABBITMQ_URL not configured. Falling back to direct realtime delivery.");
            return;
        }
        this.reconnectPromise = (async () => {
            try {
                this.connection = await (0, amqplib_1.connect)(rabbitUrl);
                this.connection.on("error", (error) => {
                    this.logger.error("RabbitMQ connection error", error);
                });
                this.connection.on("close", () => {
                    this.logger.warn("RabbitMQ connection closed. The next publish will attempt to reconnect.");
                    this.channel = null;
                    this.connection = null;
                });
                this.channel = await this.connection.createChannel();
                this.channel.on("error", (error) => {
                    this.logger.error("RabbitMQ channel error", error);
                });
                this.channel.on("close", () => {
                    this.logger.warn("RabbitMQ channel closed. Reconnecting on the next publish.");
                    this.channel = null;
                });
                await this.channel.assertQueue(this.queueName, { durable: true });
                await this.channel.consume(this.queueName, (message) => {
                    if (!message)
                        return;
                    try {
                        const payload = JSON.parse(message.content.toString());
                        const pendingItems = (payload.items ?? []).map((item) => ({
                            itemId: item.itemId,
                            orderId: payload.orderId,
                            productId: item.productId,
                            productName: item.productName,
                            customerName: payload.customerName,
                        }));
                        this.gateway.sendReceiveNewItems(pendingItems);
                        this.channel?.ack(message);
                    }
                    catch (error) {
                        this.logger.error("Failed to process queue message", error);
                        this.channel?.nack(message, false, false);
                    }
                });
            }
            finally {
                this.reconnectPromise = null;
            }
        })();
        await this.reconnectPromise;
    }
    fallbackToRealtime(event) {
        const pendingItems = (event.items ?? []).map((item) => ({
            itemId: item.itemId,
            orderId: event.orderId,
            productId: item.productId,
            productName: item.productName,
            customerName: event.customerName,
        }));
        this.gateway.sendReceiveNewItems(pendingItems);
    }
    async publishOrderPlaced(event) {
        try {
            await this.connectRabbit();
            if (!this.isChannelUsable(this.channel)) {
                throw new Error("RabbitMQ channel is not available");
            }
            this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(event)), {
                persistent: true,
            });
        }
        catch (error) {
            this.channel = null;
            this.connection = null;
            this.logger.warn("RabbitMQ unavailable while creating order; using realtime delivery instead.", error);
            this.fallbackToRealtime(event);
        }
    }
    async onModuleDestroy() {
        await this.channel?.close();
        await this.connection?.close();
    }
};
exports.RabbitService = RabbitService;
exports.RabbitService = RabbitService = RabbitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [order_gateway_1.OrderGateway])
], RabbitService);
//# sourceMappingURL=rabbit.service.js.map