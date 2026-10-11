import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CustomerPaymentEntity } from "./customer-payment.entity";
import { OrderEntity } from "./order.entity";

@Entity("customers")
export class CustomerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ default: true })
  isTabOpen!: boolean;

  @Column("text", { nullable: true })
  observation!: string | null;

  @OneToMany(() => OrderEntity, (order) => order.customer, { cascade: true })
  orders!: OrderEntity[];

  @OneToMany(() => CustomerPaymentEntity, (payment) => payment.customer)
  payments!: CustomerPaymentEntity[];
}
