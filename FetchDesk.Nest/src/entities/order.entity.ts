import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CustomerEntity } from "./customer.entity";
import { OrderItemEntity } from "./order-item.entity";

@Entity("orders")
export class OrderEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  customerId!: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "customerId" })
  customer!: CustomerEntity;

  @Column()
  customerName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: false })
  isPaid!: boolean;

  @Column({ type: "timestamp", nullable: true })
  paidAt!: Date | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items!: OrderItemEntity[];
}
