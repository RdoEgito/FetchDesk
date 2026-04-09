import { Server } from "socket.io";
export declare class OrderGateway {
    server: Server;
    sendReceiveNewItems(items: unknown[]): void;
    sendItemCancelled(itemId: string): void;
}
