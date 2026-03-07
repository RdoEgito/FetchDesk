using fetch_desk.Entities;
using FetchDesk.Shared;

namespace fetch_desk.UseCases.GetOrdersItems
{
    public class GetOrdersItemsResponse(List<PendingItemDto> ordersItems)
    {
        public List<PendingItemDto> OrdersItems { get; } = ordersItems;
    }
}