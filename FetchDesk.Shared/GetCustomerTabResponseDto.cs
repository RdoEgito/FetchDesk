namespace FetchDesk.Shared
{
    public class GetCustomerTabResponseDto
    {
        public string Name { get; set; } = string.Empty;
        public bool IsTabOpen { get; set; }
        public decimal TotalAmount { get; set; }
        public List<TabOrderDto> Orders { get; set; } = new();
    }
}