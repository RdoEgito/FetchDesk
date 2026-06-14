import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { OrderPlacedEvent } from "../events/order-placed.event";
import { OrderGateway } from "../realtime/order.gateway";
export declare class RabbitService implements OnModuleInit, OnModuleDestroy {
    private readonly gateway;
    private readonly logger;
    private connection;
    private channel;
    private readonly queueName;
    private reconnectPromise;
    constructor(gateway: OrderGateway);
    onModuleInit(): Promise<void>;
    private isChannelUsable;
    private connectRabbit;
    private fallbackToRealtime;
    publishOrderPlaced(event: OrderPlacedEvent): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
