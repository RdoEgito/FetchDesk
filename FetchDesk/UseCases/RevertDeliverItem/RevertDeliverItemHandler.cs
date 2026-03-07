using fetch_desk.CrossCutting;
using fetch_desk.Entities;
using fetch_desk.Infra;
using MediatR;

namespace fetch_desk.UseCases.RevertDeliverItem
{
    public class RevertDeliverItemHandler(AppDbContext context) : IRequestHandler<RevertDeliverItemCommand, HandleResult>
    {
        public async Task<HandleResult> Handle(RevertDeliverItemCommand request, CancellationToken cancellationToken)
        {
            var item = await context.OrderItems.FindAsync(request.ItemId, cancellationToken);

            if (item is null)
                return HandleResult.AsNotFound();

            if (item.Status == ItemStatus.Pending)
                return HandleResult.AsBadRequest("Item is not delivered yet!");

            item.Status = ItemStatus.Pending;
            item.DeliveredAt = null;

            await context.SaveChangesAsync(cancellationToken);

            return HandleResult.AsSuccess();
        }
    }
}
