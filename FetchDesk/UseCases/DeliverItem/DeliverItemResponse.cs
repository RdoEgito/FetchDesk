namespace fetch_desk.UseCases.DeliverItem
{
    public class DeliverItemResponse
    {
        public DeliverItemResponse(string outputMessage, Guid? itemId = null)
        {
            OutputMessage = outputMessage;
            ItemId = itemId;
        }

        public string OutputMessage { get; }
        public Guid? ItemId { get; }
    }
}