import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the error for internal diagnostics
    console.error(`[${request.method}] ${request.url} - Status: ${status}`, exception);

    const isProduction = process.env.NODE_ENV === 'production';
    let safeMessage: any = 'Internal server error';

    if (exception instanceof HttpException) {
      safeMessage = typeof rawMessage === 'object' && rawMessage !== null ? (rawMessage as any).message || rawMessage : rawMessage;
    } else if (!isProduction && exception instanceof Error) {
      safeMessage = exception.message;
    }

    response.status(status).json({
      code: status === 429 ? 'RATE_LIMITED' : status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : status === 400 ? 'BAD_REQUEST' : 'INTERNAL',
      message: safeMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
