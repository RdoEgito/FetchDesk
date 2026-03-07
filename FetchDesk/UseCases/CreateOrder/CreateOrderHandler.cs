using fetch_desk.Entities;
using fetch_desk.Events;
using fetch_desk.Infra;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace fetch_desk.UseCases.CreateOrder
{
    public class CreateOrderHandler(AppDbContext context, IPublishEndpoint publishEndpoint) : IRequestHandler<CreateOrderCommand, CreateOrderResult>
    {
        public async Task<CreateOrderResult> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            Customer? customer;
            customer = await FindOrCreateCustomerAsync(request, cancellationToken)
                ?? throw new Exception("Failed to find or create customer.");

            var productIds = request.Items.Select(p => p.ProductId).ToList();
            var productsInDb = await context.Products
                .Where(p => productIds.Contains(p.Id) && p.IsActive)
                .ToDictionaryAsync(p => p.Id, cancellationToken);

            var orderItems = new List<OrderItem>();
            var eventItems = new List<OrderPlacedEvent.OrderItemDto>();

            foreach (var requestedItem in request.Items)
            {
                if (productsInDb.TryGetValue(requestedItem.ProductId, out var product))
                {
                    for (int i = 0; i < requestedItem.Quantity; i++)
                    {
                        var orderItem = new OrderItem
                        {
                            ProductId = product.Id,
                            PriceAtPurchase = product.CurrentPrice,
                        };
                        orderItems.Add(orderItem);

                        eventItems.Add(new OrderPlacedEvent.OrderItemDto
                        {
                            ItemId = orderItem.Id,
                            ProductId = product.Id,
                            ProductName = product.Name,
                        });
                    }
                }
            }

            var order = new Order
            {
                CustomerId = customer.Id,
                CustomerName = customer.Name,
                Items = orderItems
            };

            context.Orders.Add(order);
            await context.SaveChangesAsync(cancellationToken);

            var orderEvent = new OrderPlacedEvent
            {
                OrderId = order.Id,
                CustomerId = order.CustomerId,
                CustomerName = order.CustomerName,
                Items = eventItems
            };

            await publishEndpoint.Publish(orderEvent, cancellationToken);

            return new CreateOrderResult(order.Id, order.Items);
        }

        private async Task<Customer> FindOrCreateCustomerAsync(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            Customer? customer = await context.Customers
                .FirstOrDefaultAsync(c => c.Name == request.CustomerName, cancellationToken);

            if (customer == null)
            {
                customer = new Customer
                {
                    Name = request.CustomerName,
                    IsTabOpen = true
                };
                await context.Customers.AddAsync(customer, cancellationToken);
            }
            else
            {
                if (!customer.IsTabOpen)
                {
                    customer.IsTabOpen = true;
                    context.Customers.Update(customer);
                }
            }

            return customer;
        }
    }
}
