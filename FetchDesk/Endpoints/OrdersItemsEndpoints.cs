using fetch_desk.UseCases.DeliverItem;
using fetch_desk.UseCases.GetOrdersItems;
using fetch_desk.UseCases.RevertDeliverItem;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace fetch_desk.Endpoints
{
    public static class OrdersItems
    {
        public static void AddOrdersItemsEndpoints(this WebApplication app)
        {
            var itemsGroup = app.MapGroup("/items")
                .WithTags("Items");

            itemsGroup
                .AddGetOrdersItemsEndpoint()
                .AddDeliverItemEndpoint()
                .AddRevertDeliverItemEndpoint();
        }

        private static RouteGroupBuilder AddGetOrdersItemsEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapGet("/", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator) =>
            {
                var query = new GetOrdersItemsQuery();
                var response = await mediator.Send(query);

                return Results.Ok(response);
            })
            .WithName("Get Orders Items")
            .WithDisplayName("Get Orders Items")
            .Produces<GetOrdersItemsResponse>(200);

            return builder;
        }

        private static RouteGroupBuilder AddDeliverItemEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapPatch("{itemId}/deliver", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator,
                [FromRoute] Guid itemId) =>
            {
                var request = new DeliverItemRequest(itemId);
                var response = await mediator.Send(request);

                return Results.Ok(new
                {
                    Message = "Item entregue com sucesso!"
                });
            })
            .WithName("Deliver Item")
            .WithDisplayName("Deliver Item")
            .Produces(200);

            return builder;
        }

        private static RouteGroupBuilder AddRevertDeliverItemEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapPatch("{itemId}/deliver/revert", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator,
                [FromRoute] Guid itemId) =>
            {
                var request = new RevertDeliverItemCommand(itemId);
                var result = await mediator.Send(request);

                if (result.IsNotFound())
                {
                    return Results.NotFound(new
                    {
                        Message = result.Message ?? "Item não encontrado."
                    });
                }

                if (!result.IsSuccess())
                {
                    return Results.StatusCode(result.StatusCode);
                }

                return Results.Ok(new
                {
                    Message = "Entrega do item revertida com sucesso!"
                });
            })
            .WithName("Revert Deliver Item")
            .WithDisplayName("Revert Deliver Item")
            .Produces(404)
            .Produces(400)
            .Produces(200);

            return builder;
        }
    }
}
