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
  private reconnectPromise: Promise<void> | null = null;

  constructor(private readonly gateway: OrderGateway) {}

  async onModuleInit() {
    await this.connectRabbit().catch((error) => {
      this.logger.error("Failed to connect to RabbitMQ on startup", error as Error);
    });
  }

  private isChannelUsable(channel: Channel | null): channel is Channel {
    return Boolean(channel) && !(channel as Channel & { closed?: boolean }).closed;
  }

  private async connectRabbit() {
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
        this.connection = await connect(rabbitUrl);

        this.connection.on("error", (error) => {
          this.logger.error("RabbitMQ connection error", error as Error);
        });

        this.connection.on("close", () => {
          this.logger.warn("RabbitMQ connection closed. The next publish will attempt to reconnect.");
          this.channel = null;
          this.connection = null;
        });

        this.channel = await this.connection.createChannel();

        this.channel.on("error", (error) => {
          this.logger.error("RabbitMQ channel error", error as Error);
        });

        this.channel.on("close", () => {
          this.logger.warn("RabbitMQ channel closed. Reconnecting on the next publish.");
          this.channel = null;
        });

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
      } finally {
        this.reconnectPromise = null;
      }
    })();

    await this.reconnectPromise;
  }

  private fallbackToRealtime(event: OrderPlacedEvent) {
    const pendingItems = (event.items ?? []).map((item) => ({
      itemId: item.itemId,
      orderId: event.orderId,
      productId: item.productId,
      productName: item.productName,
      customerName: event.customerName,
    }));

    this.gateway.sendReceiveNewItems(pendingItems);
  }

  async publishOrderPlaced(event: OrderPlacedEvent) {
    try {
      await this.connectRabbit();

      if (!this.isChannelUsable(this.channel)) {
        throw new Error("RabbitMQ channel is not available");
      }

      this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(event)), {
        persistent: true,
      });
    } catch (error) {
      this.channel = null;
      this.connection = null;
      this.logger.warn(
        "RabbitMQ unavailable while creating order; using realtime delivery instead.",
        error as Error
      );
      this.fallbackToRealtime(event);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}
