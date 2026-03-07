using MediatR;

namespace fetch_desk.UseCases.GetCustomerTab
{
    public class GetCustomerTabQuery(Guid customerId) : IRequest<GetCustomerTabResponse>
    {
        public Guid CustomerId { get; } = customerId;
    }
}
