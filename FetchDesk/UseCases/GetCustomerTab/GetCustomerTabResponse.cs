using fetch_desk.Entities;

namespace fetch_desk.UseCases.GetCustomerTab
{
    public class GetCustomerTabResponse(
        string name,
        bool isTabOpen,
        decimal totalAmount,
        IEnumerable<Order> orders)
    {
        public string Name { get; } = name;
        public bool IsTabOpen { get; } = isTabOpen;
        public decimal TotalAmount { get; } = totalAmount;
        public IEnumerable<Order> Orders { get; } = orders;
    }
}