using fetch_desk.Infra;
using MediatR;

namespace fetch_desk.UseCases.GetCustomers
{
    public class GetCustomersHandler(AppDbContext context) : IRequestHandler<GetCustomersQuery, GetCustomersResponse>
    {
        public async Task<GetCustomersResponse> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
        {
            var customers = context.Customers.ToList();

            return new GetCustomersResponse(customers);
        }
    }
}
