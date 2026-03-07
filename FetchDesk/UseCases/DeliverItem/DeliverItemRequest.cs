using MediatR;

namespace fetch_desk.UseCases.DeliverItem
{
    public class DeliverItemRequest(Guid itemId) : IRequest<DeliverItemResponse>
    {
        public Guid ItemId { get; init; } = itemId;
    }
}