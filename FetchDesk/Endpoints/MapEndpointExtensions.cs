namespace fetch_desk.Endpoints
{
    public static class MapEndpointExtensions
    {
        public static void MapEndpoints(this WebApplication app)
        {
            app.AddProductsEndpoints();
            app.AddOrdersEndpoints();
            app.AddCustomersEndpoints();
            app.AddOrdersItemsEndpoints();
        }
    }
}
