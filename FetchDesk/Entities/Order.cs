namespace fetch_desk.Entities
{
    public enum ItemStatus
    {
        Pending,
        Delivered
    }

    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsPaid { get; set; } = false;
        public DateTime? PaidAt { get; set; }
        public List<OrderItem> Items { get; set; } = [];
    }

    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }

        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
        
        public decimal PriceAtPurchase { get; set; }
        public ItemStatus Status { get; set; } = ItemStatus.Pending;
        public DateTime? DeliveredAt { get; set; }
        public bool IsDelivered => Status == ItemStatus.Delivered;
    }
}
