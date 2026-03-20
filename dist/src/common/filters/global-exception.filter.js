var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
import { Catch, HttpException, Logger } from "@nestjs/common";
const extractHttpMessage = (exception) => {
    const response = exception.getResponse();
    if (typeof response === "string") {
        return response;
    }
    if (typeof response === "object" && response !== null) {
        if ("error" in response &&
            typeof response.error === "string") {
            return response.error;
        }
        if ("message" in response &&
            typeof response.message === "string") {
            return response.message;
        }
        if ("message" in response &&
            Array.isArray(response.message)) {
            return response.message.join(", ");
        }
    }
    return exception.message;
};
const isStatusCodeException = (exception) => {
    if (typeof exception !== "object" || exception === null) {
        return false;
    }
    return ("statusCode" in exception &&
        typeof exception.statusCode === "number" &&
        "message" in exception &&
        typeof exception.message === "string");
};
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();
        const isHttpException = exception instanceof HttpException;
        const status = isHttpException
            ? exception.getStatus()
            : isStatusCodeException(exception)
                ? exception.statusCode
                : 500;
        const message = isHttpException
            ? extractHttpMessage(exception)
            : isStatusCodeException(exception)
                ? exception.message
                : "Internal Server Error";
        const requestLabel = `${req.method} ${req.originalUrl ?? req.url}`;
        if (status >= 500) {
            this.logger.error(`${requestLabel} -> ${status} ${message}`, exception instanceof Error ? exception.stack : undefined);
        }
        else {
            this.logger.warn(`${requestLabel} -> ${status} ${message}`);
        }
        res.status(status).json({
            statusCode: status,
            error: message,
            path: req.originalUrl ?? req.url,
            timestamp: new Date().toISOString(),
        });
    }
};
GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    Catch()
], GlobalExceptionFilter);
export { GlobalExceptionFilter };
//# sourceMappingURL=global-exception.filter.js.map