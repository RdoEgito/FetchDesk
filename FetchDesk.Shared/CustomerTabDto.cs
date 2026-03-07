namespace FetchDesk.Shared
{
    public class CustomerTabDto
    {
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public List<TabItemDto> Items { get; set; } = [];
        public decimal TotalAmount => Items.Sum(i => i.SubTotal);
    }
}