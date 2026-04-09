export type OrderPlacedEvent = {
  orderId: string;
  customerId: string;
  customerName: string;
  items: Array<{
    itemId: string;
    productId: string;
    productName: string;
  }>;
};
