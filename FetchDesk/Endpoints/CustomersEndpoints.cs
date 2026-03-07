using fetch_desk.UseCases.CloseTab;
using fetch_desk.UseCases.GetCustomers;
using fetch_desk.UseCases.GetCustomerTab;
using fetch_desk.UseCases.ReturnItem;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace fetch_desk.Endpoints
{
    public static class CustomersEndpoints
    {
        public static void AddCustomersEndpoints(this WebApplication app)
        {
            var ordersGroup = app.MapGroup("/customers")
                .WithTags("Customer");

            ordersGroup
                .AddGetCustomers()
                .AddGetCustomerTab()
                .AddCloseTab()
                .AddDeleteItemFromTab();
        }

        private static RouteGroupBuilder AddGetCustomers(this RouteGroupBuilder builder)
        {
            builder.MapGet("", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator) =>
            {
                var request = new GetCustomersQuery();
                var response = await mediator.Send(request);

                return Results.Ok(response);
            })
            .WithName("Get Customers")
            .WithDisplayName("Get Customers")
            .Produces<GetCustomersResponse>(200);

            return builder;
        }

        private static RouteGroupBuilder AddGetCustomerTab(this RouteGroupBuilder builder)
        {
            builder.MapGet("{customerId}/tab", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator,
                [FromRoute] Guid customerId) =>
            {
                var request = new GetCustomerTabQuery(customerId);
                var response = await mediator.Send(request);

                return Results.Ok(response);
            })
            .WithName("Get Customer Tab")
            .WithDisplayName("Get Customer Tab")
            .Produces<GetCustomerTabResponse>(200);

            return builder;
        }

        private static RouteGroupBuilder AddCloseTab(this RouteGroupBuilder builder)
        {
            builder.MapPatch("{customerId}/close-tab", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator,
                [FromRoute] Guid customerId) =>
            {
                var request = new CloseTabCommand(customerId);
                var response = await mediator.Send(request);

                return Results.Ok(new
                {
                    Message = response.Message
                });
            })
            .WithName("Close Tab")
            .WithDisplayName("Close Tab")
            .Produces(200);

            return builder;
        }

        private static RouteGroupBuilder AddDeleteItemFromTab(this RouteGroupBuilder builder)
        {
            builder.MapDelete("/{customerId:guid}/items/{productId:guid}", async (
                HttpContext httpContext,
                [FromServices] IMediator mediator,
                [FromRoute] Guid customerId,
                [FromRoute] Guid productId) =>
            {
                var command = new ReturnItemCommand(customerId, productId);
                var result = await mediator.Send(command);
                
                return Results.Ok(new { Message = "Item removed from tab successfully." });
            })
            .WithName("Delete Item From Tab")
            .WithDisplayName("Delete Item From Tab")
            .Produces(200)
            .Produces(400);
            return builder;
        }
    }
}
