using fetch_desk.UseCases.CreateOrder;
using FetchDesk.Shared;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace fetch_desk.Endpoints
{
    public static class OrderEndpoints
    {
        public static void AddOrdersEndpoints(this WebApplication app)
        {
            var ordersGroup = app.MapGroup("/orders")
                .WithTags("Orders");

            ordersGroup
                .AddCreateOrderEndpoint();
        }

        public static RouteGroupBuilder AddCreateOrderEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapPost("/", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator,
                [FromBody] CreateOrderRequestDto request) =>
            {
                var command = new CreateOrderCommand(
                    request.CustomerName,
                    request.Items.Select(x => new CreateOrderCommand.OrderRequestItem(x.ProductId, x.Quantity))
                );
                var result = await mediator.Send(command);

                return Results.Ok(new
                {
                    Message = "Pedido criado com sucesso!",
                    OrderId = result.Id,
                    Items = result.Items
                });
            })
            .WithName("Create Order")
            .WithDisplayName("Create Order")
            .Produces(200);

            return builder;
        }
    }
}
