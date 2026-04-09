import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    next();
  });

  app.enableCors({
    origin: [
      // Development
      "http://localhost",
      "http://localhost:5173",
      "http://localhost:8080",
      // Production
      process.env.FRONTEND_URL || "https://your-app.vercel.app",
      // Legacy URLs
      "https://rdoegito.github.io",
      "https://fetchdesk.pages.dev",
      "https://fetchdesk-client.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  await app.listen(8080);
}

bootstrap();
