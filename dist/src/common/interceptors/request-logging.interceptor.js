var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, Logger } from "@nestjs/common";
import { tap } from "rxjs";
const safeStringify = (value) => {
    try {
        const serialized = JSON.stringify(value);
        if (!serialized) {
            return "{}";
        }
        return serialized.length > 700
            ? `${serialized.slice(0, 700)}...<truncated>`
            : serialized;
    }
    catch {
        return "[unserializable]";
    }
};
let RequestLoggingInterceptor = class RequestLoggingInterceptor {
    logger = new Logger("HTTP");
    intercept(context, next) {
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const method = req.method;
        const url = req.originalUrl ?? req.url;
        const startedAt = Date.now();
        const shouldLogBody = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
        const bodyPart = shouldLogBody ? ` body=${safeStringify(req.body)}` : "";
        this.logger.log(`--> ${method} ${url} ip=${req.ip} params=${safeStringify(req.params)} query=${safeStringify(req.query)}${bodyPart}`);
        return next.handle().pipe(tap({
            next: () => {
                const durationMs = Date.now() - startedAt;
                this.logger.log(`<-- ${method} ${url} status=${res.statusCode} duration=${durationMs}ms`);
            },
            error: (error) => {
                const durationMs = Date.now() - startedAt;
                const status = typeof error === "object" &&
                    error !== null &&
                    "status" in error &&
                    typeof error.status === "number"
                    ? error.status
                    : 500;
                this.logger.warn(`<-- ${method} ${url} status=${status} duration=${durationMs}ms (errored)`);
            },
        }));
    }
};
RequestLoggingInterceptor = __decorate([
    Injectable()
], RequestLoggingInterceptor);
export { RequestLoggingInterceptor };
//# sourceMappingURL=request-logging.interceptor.js.map