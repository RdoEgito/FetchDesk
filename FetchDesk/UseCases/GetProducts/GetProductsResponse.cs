using fetch_desk.Entities;

namespace fetch_desk.UseCases.GetProducts
{
    public class GetProductsResponse(IEnumerable<Product> products)
    {
        public IEnumerable<Product> Products { get; } = products;
    }
}