"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rabbit_service_1 = require("./rabbit.service");
describe('RabbitService', () => {
    it('falls back to realtime delivery when channel is closed', async () => {
        const sendReceiveNewItems = jest.fn();
        const service = new rabbit_service_1.RabbitService({ sendReceiveNewItems });
        service.channel = {
            sendToQueue: jest.fn(() => {
                throw Object.assign(new Error('Channel closed'), { code: 404 });
            }),
        };
        await expect(service.publishOrderPlaced({
            orderId: 'order-1',
            customerId: 'customer-1',
            customerName: 'Maria',
            items: [{ itemId: 'item-1', productId: 'prod-1', productName: 'Cafe' }],
        })).resolves.toBeUndefined();
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
//# sourceMappingURL=rabbit.service.spec.js.map