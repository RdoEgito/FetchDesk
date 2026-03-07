using fetch_desk.Entities;

namespace fetch_desk.UseCases.GetCustomers
{
    public class GetCustomersResponse(IEnumerable<Customer> customers)
    {
        public IEnumerable<Customer> Customers { get; } = customers;
    }
}