import "dotenv/config";
import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter.js";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor.js";
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });
    const logger = new Logger("Bootstrap");
    app.useLogger(logger);
    const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            // Allow non-browser clients and same-origin calls with no Origin header.
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("CORS origin not allowed"));
        },
        credentials: true,
    });
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new RequestLoggingInterceptor());
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix("api", {
        exclude: ["health"],
    });
    // Setup Swagger/OpenAPI
    const config = new DocumentBuilder()
        .setTitle("D11 Dashboard API")
        .setDescription("Cricket Fantasy League - D11 Dashboard REST API")
        .setVersion("1.0.0")
        .addTag("health", "Health check endpoint")
        .addTag("leaderboard", "Leaderboard endpoints")
        .addTag("users", "User and season user management")
        .addTag("matches", "Match information and updates")
        .addTag("chips", "Powerup/chip selection and management")
        .addTag("scores", "Score submission and retrieval")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
    const port = Number(process.env.PORT ?? "4000");
    await app.listen(port);
    logger.log(`Server running on port ${port}`);
    logger.log(`Swagger docs available at http://localhost:${port}/docs`);
}
void bootstrap();
//# sourceMappingURL=main.js.map