import { Injectable, Logger } from "@nestjs/common";
import type {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import type { Observable } from "rxjs";
import { tap } from "rxjs";

const safeStringify = (value: unknown) => {
  try {
    const serialized = JSON.stringify(value);

    if (!serialized) {
      return "{}";
    }

    return serialized.length > 700
      ? `${serialized.slice(0, 700)}...<truncated>`
      : serialized;
  } catch {
    return "[unserializable]";
  }
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const method = req.method;
    const url = req.originalUrl ?? req.url;
    const startedAt = Date.now();

    const shouldLogBody = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const bodyPart = shouldLogBody ? ` body=${safeStringify(req.body)}` : "";

    this.logger.log(
      `--> ${method} ${url} ip=${req.ip} params=${safeStringify(req.params)} query=${safeStringify(req.query)}${bodyPart}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startedAt;
          this.logger.log(
            `<-- ${method} ${url} status=${res.statusCode} duration=${durationMs}ms`,
          );
        },
        error: (error: unknown) => {
          const durationMs = Date.now() - startedAt;
          const status =
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            typeof (error as { status?: unknown }).status === "number"
              ? (error as { status: number }).status
              : 500;

          this.logger.warn(
            `<-- ${method} ${url} status=${status} duration=${durationMs}ms (errored)`,
          );
        },
      }),
    );
  }
}
