using MediatR;

namespace fetch_desk.UseCases.CloseTab
{
    public class CloseTabCommand(Guid customerId) : IRequest<CloseTabResult>
    {
        public Guid CustomerId { get; } = customerId;
    }
}
