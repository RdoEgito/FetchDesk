import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ItemStatus } from "./item-status.enum";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "./product.entity";

@Entity("order_items")
export class OrderItemEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  orderId!: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: OrderEntity;

  @Column("uuid")
  productId!: string;

  @ManyToOne(() => ProductEntity, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "productId" })
  product!: ProductEntity;

  @Column("numeric", { precision: 12, scale: 2 })
  priceAtPurchase!: number;

  @Column({ type: "enum", enum: ItemStatus, default: ItemStatus.Pending })
  status!: ItemStatus;

  @Column({ type: "timestamp", nullable: true })
  deliveredAt!: Date | null;
}
