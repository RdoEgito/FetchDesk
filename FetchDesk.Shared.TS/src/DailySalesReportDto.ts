import type { DailyBuyerDto } from "./DailyBuyerDto";
import type { DailyProductDto } from "./DailyProductDto";

export interface DailySalesReportDto {
  date: string;
  totalOrders: number;
  totalItems: number;
  totalRevenue: number;
  buyers: DailyBuyerDto[];
  products: DailyProductDto[];
}
