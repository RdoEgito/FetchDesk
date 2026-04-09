import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: [
      "https://localhost:5005",
      "http://localhost:5005",
      "https://localhost:7259",
      "https://localhost:7173",
      "http://localhost:5138",
      "https://rdoegito.github.io",
      "https://fetchdesk.pages.dev",
      "https://fetchdesk-client.onrender.com",
    ],
    credentials: true,
  },
  path: "/orderhub",
})
export class OrderGateway {
  @WebSocketServer()
  server!: Server;

  sendReceiveNewItems(items: unknown[]) {
    this.server.emit("ReceiveNewItems", items);
  }

  sendItemCancelled(itemId: string) {
    this.server.emit("ItemCancelled", itemId);
  }
}
