using fetch_desk.Entities;

namespace fetch_desk.UseCases.CreateOrder
{
    public class CreateOrderResult
    {
        public CreateOrderResult(Guid id, List<OrderItem> items)
        {
            Id = id;
            Items = items;
        }

        public Guid Id { get; }
        public List<OrderItem> Items { get; }
    }
}
