import { TabOrderItemDto } from "./TabOrderItemDto";

export interface TabOrderDto {
  id: string;
  createdAt: string;
  items: TabOrderItemDto[];
}
