namespace FetchDesk.Shared
{
    public class TabOrderItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public decimal PriceAtPurchase { get; set; }
        public bool IsDelivered { get; set; }
        public TabProductDto? Product { get; set; }
    }
}