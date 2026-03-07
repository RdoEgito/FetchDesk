using fetch_desk.Entities;
using fetch_desk.Infra;
using FetchDesk.Shared;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace fetch_desk.UseCases.GetOrdersItems
{
    public class GetOrdersItemsHandler(AppDbContext context) : IRequestHandler<GetOrdersItemsQuery, GetOrdersItemsResponse>
    {
        public async Task<GetOrdersItemsResponse> Handle(GetOrdersItemsQuery request, CancellationToken cancellationToken)
        {
            var pendingItems = await context.Orders
            .SelectMany(
                order => order.Items,
                (order, item) => new { Order = order, Item = item }
            )
            //.Where(x => x.Item.Status == ItemStatus.Pending)
            .Select(x => new PendingItemDto
            {
                ItemId = x.Item.Id,
                OrderId = x.Order.Id,
                ProductId = x.Item.ProductId,
                ProductName = x.Item.Product.Name,
                CustomerName = x.Order.CustomerName,
                IsDelivered = x.Item.IsDelivered
            })
            .ToListAsync(cancellationToken);

            return new GetOrdersItemsResponse(pendingItems);
        }
    }
}
