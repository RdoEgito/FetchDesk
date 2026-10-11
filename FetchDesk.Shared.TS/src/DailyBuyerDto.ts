export interface DailyBuyerDto {
  buyerName: string;
  orderCount: number;
  revenue: number;
  payments: {
    cashAmount: number;
    cardAmount: number;
  };
}
