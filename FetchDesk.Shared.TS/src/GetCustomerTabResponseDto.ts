import { TabOrderDto } from "./TabOrderDto";

export interface GetCustomerTabResponseDto {
  name: string;
  isTabOpen: boolean;
  totalAmount: number;
  orders: TabOrderDto[];
}
