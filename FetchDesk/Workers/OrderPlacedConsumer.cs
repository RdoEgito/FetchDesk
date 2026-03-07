using fetch_desk.Events;
using fetch_desk.Hubs;
using FetchDesk.Shared;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace fetch_desk.Workers
{
    public class OrderPlacedConsumer(
        ILogger<OrderPlacedConsumer> logger,
        IHubContext<OrderHub> hubContext) : IConsumer<OrderPlacedEvent>
    {
        public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
        {
            var message = context.Message;
            logger.LogInformation("Novo pedido recebido na fila! Pedido: {orderId}", message.OrderId);

            var pendingItems = message.Items?.Select(i => new PendingItemDto
            {
                ItemId = i.ItemId,
                OrderId = message.OrderId,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                CustomerName = message.CustomerName,
            }).ToList() ?? [];

            await hubContext.Clients.All.SendAsync("ReceiveNewItems", pendingItems);
        }
    }
}
