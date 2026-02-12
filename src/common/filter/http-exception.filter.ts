import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ApiResponse } from '../dto/api-response';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const res = exceptionResponse as Record<string, any>;
                message = res.message ?? exception.message;
                errors = res.errors ?? undefined;
            }
        }

        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error('Unhandled exception', {
                status,
                message,
                path: request.url,
                method: request.method,
                stack: exception instanceof Error ? exception.stack : undefined,
            });
        } else {
            this.logger.warn('HTTP exception', {
                status,
                message,
                path: request.url,
                method: request.method,
            });
        }

        const body = ApiResponse.error(errors, message, status);

        response.status(status).json(body);
    }
}
