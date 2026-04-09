import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";

@Entity("customers")
export class CustomerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ default: true })
  isTabOpen!: boolean;

  @OneToMany(() => OrderEntity, (order) => order.customer, { cascade: true })
  orders!: OrderEntity[];
}
