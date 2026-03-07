using fetch_desk.Infra;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace fetch_desk.UseCases.CloseTab
{
    public class CloseTabHandler(AppDbContext context) : IRequestHandler<CloseTabCommand, CloseTabResult>
    {
        public async Task<CloseTabResult> Handle(CloseTabCommand request, CancellationToken cancellationToken)
        {
            var customer = await context.Customers
                .Include(c => c.Orders.Where(o => !o.IsPaid))
                .FirstOrDefaultAsync(c => c.Id == request.CustomerId, cancellationToken);

            if (customer == null)
            {
                return new CloseTabResult(
                    message: "Customer not found.",
                    status: 404
                );
            }

            customer.IsTabOpen = false;

            foreach (var order in customer.Orders)
            {
                order.IsPaid = true;
                order.PaidAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync(cancellationToken);

            return new CloseTabResult(
                message: $"Tab for customer {customer.Name} has been closed and orders marked as paid.",
                status: 200
            );
        }
    }
}
