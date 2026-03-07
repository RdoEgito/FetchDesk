using fetch_desk.CrossCutting;
using MediatR;

namespace fetch_desk.UseCases.RevertDeliverItem
{
    public class RevertDeliverItemCommand(Guid itemId) : IRequest<HandleResult>
    {
        public Guid ItemId { get; init; } = itemId;
    }
}