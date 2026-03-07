using fetch_desk.Entities;
using fetch_desk.Hubs;
using fetch_desk.Infra;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace fetch_desk.UseCases.ReturnItem
{
    public class ReturnItemHandler(AppDbContext context, IHubContext<OrderHub> hubContext) : IRequestHandler<ReturnItemCommand, ReturnItemResult>
    {
        public async Task<ReturnItemResult> Handle(ReturnItemCommand request, CancellationToken cancellationToken)
        {
            var openOrders = await context.Orders
                .Include(o => o.Items)
                .Where(o => o.CustomerId == request.CustomerId && !o.IsPaid)
                .ToListAsync(cancellationToken);

            OrderItem? itemToRemove = null;

            foreach (var order in openOrders)
            {
                itemToRemove = order.Items.FirstOrDefault(i =>
                    i.ProductId == request.ProductId && !i.IsDelivered);

                if (itemToRemove != null)
                {
                    break;
                }
            }

            if (itemToRemove == null)
            {
                return new ReturnItemResult(false, "Item not found or already delivered.");
            }

            var cancelledItemId = itemToRemove.Id;

            context.OrderItems.Remove(itemToRemove);
            await context.SaveChangesAsync(cancellationToken);

            await hubContext.Clients.All.SendAsync("ItemCancelled", cancelledItemId, cancellationToken);

            return new ReturnItemResult(true, "Item successfully returned.");
        }
    }
}
