namespace fetch_desk.Entities
{
    public class Customer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public bool IsTabOpen { get; set; } = true;
        public List<Order> Orders { get; set; } = new();

        public decimal CalculateTotalTab()
        {
            return Orders.SelectMany(order => order.Items).Sum(item => item.PriceAtPurchase);
        }
    }
}
