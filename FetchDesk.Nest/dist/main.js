"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            "http://localhost",
            "https://localhost",
            "http://127.0.0.1",
            "https://127.0.0.1",
            "http://localhost:5000",
            "http://localhost:5173",
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
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    await app.listen(8080);
}
bootstrap();
//# sourceMappingURL=main.js.map