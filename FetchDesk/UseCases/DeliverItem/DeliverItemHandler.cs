using fetch_desk.Entities;
using fetch_desk.Infra;
using MediatR;

namespace fetch_desk.UseCases.DeliverItem
{
    public class DeliverItemHandler(AppDbContext context) : IRequestHandler<DeliverItemRequest, DeliverItemResponse>
    {
        public async Task<DeliverItemResponse> Handle(DeliverItemRequest request, CancellationToken cancellationToken)
        {
            var item = await context.OrderItems.FindAsync(request.ItemId, cancellationToken);

            if (item is null)
                return new DeliverItemResponse("Not found!");

            if (item.Status == ItemStatus.Delivered)
                return new DeliverItemResponse("Already delivered!");

            item.Status = ItemStatus.Delivered;
            item.DeliveredAt = DateTime.UtcNow;

            await context.SaveChangesAsync(cancellationToken);

            return new DeliverItemResponse("Item delivered successfully!", item.Id);
        }
    }
}
