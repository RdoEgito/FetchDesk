import { TabProductDto } from "./TabProductDto";

export interface TabOrderItemDto {
  id: string;
  productId: string;
  priceAtPurchase: number;
  isDelivered: boolean;
  product?: TabProductDto | null;
}
