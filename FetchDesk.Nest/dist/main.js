"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((req, res, next) => {
        res.set({
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        });
        next();
    });
    const allowedOrigins = [
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:8080",
        process.env.FRONTEND_URL,
        "https://fetchdesk-pi.vercel.app",
        "https://your-app.vercel.app",
        "https://rdoegito.github.io",
        "https://fetchdesk.pages.dev",
        "https://fetchdesk-client.onrender.com",
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS origin denied: ${origin}`));
            }
        },
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