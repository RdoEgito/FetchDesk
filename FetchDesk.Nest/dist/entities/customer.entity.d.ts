import { OrderEntity } from "./order.entity";
export declare class CustomerEntity {
    id: string;
    name: string;
    isTabOpen: boolean;
    orders: OrderEntity[];
}
