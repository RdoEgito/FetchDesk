import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CustomerEntity } from "./customer.entity";

@Entity("customer_payments")
export class CustomerPaymentEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  customerId!: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.payments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "customerId" })
  customer!: CustomerEntity;

  @Column("numeric", { precision: 12, scale: 2 })
  cashAmount!: number;

  @Column("numeric", { precision: 12, scale: 2 })
  cardAmount!: number;

  @CreateDateColumn()
  paidAt!: Date;
}
