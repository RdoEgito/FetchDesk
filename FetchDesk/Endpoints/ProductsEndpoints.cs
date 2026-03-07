using fetch_desk.Entities;
using fetch_desk.Infra;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace fetch_desk.Endpoints
{
    public static class ProductsEndpoints
    {
        public static void AddProductsEndpoints(this WebApplication app)
        {
            var productsGroup = app.MapGroup("/products")
                .WithTags("Products");

            productsGroup
                .AddGetProductsEndpoint()
                .AddGetProductByIdEndpoint()
                .AddCreateProductEndpoint()
                .AddUpdateProductEndpoint()
                .AddDeleteProductEndpoint();
        }

        private static RouteGroupBuilder AddGetProductsEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapGet("/", async ([FromServices] AppDbContext context) =>
            {
                var products = await context.Products.ToListAsync();

                return Results.Ok(new { Products = products });
            })
            .WithName("Get Products")
            .WithDisplayName("Get Products");

            return builder;
        }

        private static RouteGroupBuilder AddGetProductByIdEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapGet("/{id:guid}", async (Guid id, [FromServices] AppDbContext context) =>
            {
                var product = await context.Products.FindAsync(id);

                return product is not null ? Results.Ok(product) : Results.NotFound();
            })
            .WithName("Get Product By Id")
            .WithDisplayName("Get Product By Id");

            return builder;
        }

        private static RouteGroupBuilder AddCreateProductEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapPost("/", async (
                [FromBody] CreateProductRequest request,
                [FromServices] AppDbContext context) =>
            {
                var product = new Product
                {
                    Name = request.Name,
                    CurrentPrice = request.CurrentPrice,
                    IsActive = true
                };

                context.Products.Add(product);
                await context.SaveChangesAsync();

                return Results.Created($"/products/{product.Id}", product);
            })
            .WithName("Create Product")
            .WithDisplayName("Create Product");

            return builder;
        }

        private static RouteGroupBuilder AddUpdateProductEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapPut("/{id:guid}", async (
                Guid id,
                [FromBody] UpdateProductRequest request,
                [FromServices] AppDbContext context) =>
            {
                var product = await context.Products.FindAsync(id);

                if (product is null)
                {
                    return Results.NotFound();
                }

                product.Name = request.Name;
                product.CurrentPrice = request.CurrentPrice;
                product.IsActive = request.IsActive;

                await context.SaveChangesAsync();

                return Results.NoContent();
            })
            .WithName("Update Product")
            .WithDisplayName("Update Product");

            return builder;
        }

        private static RouteGroupBuilder AddDeleteProductEndpoint(this RouteGroupBuilder builder)
        {
            builder.MapDelete("/{id:guid}", async (Guid id, [FromServices] AppDbContext context) =>
            {
                var product = await context.Products.FindAsync(id);

                if (product is null)
                {
                    return Results.NotFound();
                }

                product.IsActive = false;
                await context.SaveChangesAsync();

                return Results.NoContent();
            })
            .WithName("Delete Product")
            .WithDisplayName("Delete Product");

            return builder;
        }
    }

    public record CreateProductRequest(string Name, decimal CurrentPrice);

    public record UpdateProductRequest(string Name, decimal CurrentPrice, bool IsActive);
}