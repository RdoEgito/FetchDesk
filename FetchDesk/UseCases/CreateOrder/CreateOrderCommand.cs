using MediatR;
using static fetch_desk.UseCases.CreateOrder.CreateOrderCommand;

namespace fetch_desk.UseCases.CreateOrder
{
    public class CreateOrderCommand(string customerName, IEnumerable<OrderRequestItem> items) : IRequest<CreateOrderResult>
    {
        public Guid CustomerId { get; set; } = Guid.NewGuid();
        public string CustomerName { get; set; } = customerName;
        public IEnumerable<OrderRequestItem> Items { get; } = items;

        public class OrderRequestItem(Guid productId, int quantity)
        {
            public Guid ProductId { get; } = productId;
            public int Quantity { get; } = quantity;
        }
    }
}
