import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("products")
export class ProductEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("numeric", { precision: 12, scale: 2 })
  currentPrice!: number;

  @Column({ default: true })
  isActive!: boolean;
}
