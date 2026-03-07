using fetch_desk.Entities;
using fetch_desk.Infra;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace fetch_desk.UseCases.GetCustomerTab
{
    public class GetCustomerTabHandler(AppDbContext context) : IRequestHandler<GetCustomerTabQuery, GetCustomerTabResponse>
    {
        public async Task<GetCustomerTabResponse> Handle(GetCustomerTabQuery request, CancellationToken cancellationToken)
        {
            var customer = await context.Customers
                .Include(c => c.Orders.Where(o => !o.IsPaid))
                    .ThenInclude(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.Id == request.CustomerId, cancellationToken);

            if (customer == null)
            {
                return new GetCustomerTabResponse(
                    name: "Unknown Customer",
                    isTabOpen: false,
                    totalAmount: 0,
                    orders: []
                );
            }

            var totalAmount = customer.CalculateTotalTab();

            return new GetCustomerTabResponse(
                name: customer.Name,
                isTabOpen: customer.IsTabOpen,
                totalAmount: totalAmount,
                orders: customer.Orders
            );
        }
    }
}
