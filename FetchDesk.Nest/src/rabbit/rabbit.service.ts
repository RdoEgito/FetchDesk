import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Channel, ChannelModel, connect } from "amqplib";
import { OrderPlacedEvent } from "../events/order-placed.event";
import { OrderGateway } from "../realtime/order.gateway";

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly queueName = "delivery-queue";

  constructor(private readonly gateway: OrderGateway) {}

  async onModuleInit() {
    const rabbitUrl = process.env.RABBITMQ_URL;
    if (!rabbitUrl) {
      this.logger.warn("RABBITMQ_URL not configured. Falling back to direct realtime delivery.");
      return;
    }

    try {
      this.connection = await connect(rabbitUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });

      await this.channel.consume(this.queueName, (message) => {
        if (!message) return;
        try {
          const payload = JSON.parse(message.content.toString()) as OrderPlacedEvent;
          const pendingItems = (payload.items ?? []).map((item) => ({
            itemId: item.itemId,
            orderId: payload.orderId,
            productId: item.productId,
            productName: item.productName,
            customerName: payload.customerName,
          }));
          this.gateway.sendReceiveNewItems(pendingItems);
          this.channel?.ack(message);
        } catch (error) {
          this.logger.error("Failed to process queue message", error as Error);
          this.channel?.nack(message, false, false);
        }
      });
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ", error as Error);
      this.connection = null;
      this.channel = null;
    }
  }

  async publishOrderPlaced(event: OrderPlacedEvent) {
    if (!this.channel) {
      const pendingItems = (event.items ?? []).map((item) => ({
        itemId: item.itemId,
        orderId: event.orderId,
        productId: item.productId,
        productName: item.productName,
        customerName: event.customerName,
      }));
      this.gateway.sendReceiveNewItems(pendingItems);
      return;
    }

    this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
