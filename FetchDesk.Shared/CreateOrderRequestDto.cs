namespace FetchDesk.Shared
{
    public class CreateOrderRequestDto
    {
        public string CustomerName { get; set; }
        public List<OrderItemRequestDto> Items { get; set; } = new();
    }
}
