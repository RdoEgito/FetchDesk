"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let OrderGateway = class OrderGateway {
    sendReceiveNewItems(items) {
        this.server.emit("ReceiveNewItems", items);
    }
    sendItemCancelled(itemId) {
        this.server.emit("ItemCancelled", itemId);
    }
};
exports.OrderGateway = OrderGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OrderGateway.prototype, "server", void 0);
exports.OrderGateway = OrderGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
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
], OrderGateway);
//# sourceMappingURL=order.gateway.js.map