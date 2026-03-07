namespace FetchDesk.Shared
{
    public class TabOrderDto
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<TabOrderItemDto> Items { get; set; } = new();
    }
}