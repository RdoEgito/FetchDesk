import { RabbitService } from './rabbit.service';

describe('RabbitService', () => {
  it('falls back to realtime delivery when channel is closed', async () => {
    const sendReceiveNewItems = jest.fn();
    const service = new RabbitService({ sendReceiveNewItems } as any);

    (service as any).channel = {
      sendToQueue: jest.fn(() => {
        throw Object.assign(new Error('Channel closed'), { code: 404 });
      }),
    };

    await expect(
      service.publishOrderPlaced({
        orderId: 'order-1',
        customerId: 'customer-1',
        customerName: 'Maria',
        items: [{ itemId: 'item-1', productId: 'prod-1', productName: 'Cafe' }],
      })
    ).resolves.toBeUndefined();

    expect(sendReceiveNewItems).toHaveBeenCalledWith([
      {
        itemId: 'item-1',
        orderId: 'order-1',
        productId: 'prod-1',
        productName: 'Cafe',
        customerName: 'Maria',
      },
    ]);
  });
});
