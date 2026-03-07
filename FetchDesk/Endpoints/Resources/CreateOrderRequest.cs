namespace fetch_desk.Endpoints.Resources
{
    public class CreateOrderRequest(Guid customerId, string customerName, List<OrderItem> products)
    {
        public Guid CustomerId { get; } = customerId;
        public string CustomerName { get; } = customerName;
        public List<OrderItem> Items { get; } = products;
    }

    public class OrderItem(Guid productId, int quantity)
    {
        public Guid ProductId { get; set; } = productId;
        public int Quantity { get; } = quantity;
    }
}
