using fetch_desk.Entities;

namespace fetch_desk.UseCases.CloseTab
{
    public class CloseTabResult(
        string message,
        int status)
    {
        public string Message { get; } = message;
        public int Status { get; } = status;
    }
}