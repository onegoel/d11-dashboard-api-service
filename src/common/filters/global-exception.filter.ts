import { Catch, HttpException, Logger } from "@nestjs/common";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { AxiosError } from "axios";
import type { Request, Response } from "express";

type StatusCodeException = {
  statusCode: number;
  message: string;
};

const extractHttpMessage = (exception: HttpException) => {
  const response = exception.getResponse();

  if (typeof response === "string") {
    return response;
  }

  if (typeof response === "object" && response !== null) {
    if (
      "message" in response &&
      typeof (response as { message?: unknown }).message === "string"
    ) {
      return (response as { message: string }).message;
    }

    if (
      "message" in response &&
      Array.isArray((response as { message?: unknown }).message)
    ) {
      return (response as { message: string[] }).message.join(", ");
    }

    if (
      "error" in response &&
      typeof (response as { error?: unknown }).error === "string"
    ) {
      return (response as { error: string }).error;
    }
  }

  return exception.message;
};

const isStatusCodeException = (
  exception: unknown,
): exception is StatusCodeException => {
  if (typeof exception !== "object" || exception === null) {
    return false;
  }

  return (
    "statusCode" in exception &&
    typeof (exception as { statusCode?: unknown }).statusCode === "number" &&
    "message" in exception &&
    typeof (exception as { message?: unknown }).message === "string"
  );
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const isAxiosException = exception instanceof AxiosError;
    const status = isHttpException
      ? exception.getStatus()
      : isAxiosException
        ? (exception.response?.status ?? 502)
        : isStatusCodeException(exception)
          ? exception.statusCode
          : 500;
    const message = isHttpException
      ? extractHttpMessage(exception)
      : isAxiosException
        ? exception.response?.statusText || exception.message
        : isStatusCodeException(exception)
          ? exception.message
          : "Internal Server Error";

    const requestLabel = `${req.method} ${req.originalUrl ?? req.url}`;

    if (status >= 500) {
      this.logger.error(
        `${requestLabel} -> ${status} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${requestLabel} -> ${status} ${message}`);
    }

    res.status(status).json({
      statusCode: status,
      error: message,
      path: req.originalUrl ?? req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
