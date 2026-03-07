namespace FetchDesk.Shared
{
    public class PendingItemDto
    {
        public Guid ItemId { get; set; }
        public Guid OrderId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public bool IsDelivered { get; set; } = false;
    }
}
