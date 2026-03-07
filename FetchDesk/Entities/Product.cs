namespace fetch_desk.Entities
{
    public class Product
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
