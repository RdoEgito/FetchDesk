using fetch_desk.Infra;
using MediatR;

namespace fetch_desk.UseCases.GetProducts
{
    public class GetItemsHandler(AppDbContext context) : IRequestHandler<GetProductsQuery, GetProductsResponse>
    {
        public async Task<GetProductsResponse> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        {
            var products = context.Products
                .Where(p => p.IsActive)
                .ToList();

            return new GetProductsResponse(products);
        }
    }
}
