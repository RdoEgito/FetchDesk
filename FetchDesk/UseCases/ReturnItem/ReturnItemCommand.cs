using MediatR;

namespace fetch_desk.UseCases.ReturnItem
{
    public record ReturnItemCommand(Guid CustomerId, Guid ProductId) : IRequest<ReturnItemResult>;
}
