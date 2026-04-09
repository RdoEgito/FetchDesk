import { OrderItemRequestDto } from "./OrderItemRequestDto";

export interface CreateOrderRequestDto {
  customerName: string;
  items: OrderItemRequestDto[];
}
