namespace FetchDesk.Shared
{
    public class CustomerDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsTabOpen { get; set; }
    }
}
