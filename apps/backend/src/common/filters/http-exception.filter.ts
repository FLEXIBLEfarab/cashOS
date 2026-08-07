import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../types/api-response.type';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Внутренняя ошибка сервера';
    let error: string | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const resp = exceptionResponse as Record<string, unknown>;

      // Если class-validator вернул массив ошибок — объединяем в строку
      message = Array.isArray(resp['message'])
        ? (resp['message'] as string[]).join('; ')
        : ((resp['message'] as string | undefined) ?? message);

      error = resp['error'] as string | undefined;
    }

    this.logger.error(
      `[${request.method}] ${request.url} ⟶ HTTP ${status}: ${message}`,
    );

    const body: ApiResponse = {
      statusCode: status,
      message,
      error,
    };

    response.status(status).json(body);
  }
}

/**
 * Перехватчик для необработанных ошибок (не HttpException).
 * Возвращает 500 без стека трасировки в ответе.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const message =
      exception instanceof Error
        ? exception.message
        : 'Неизвестная ошибка сервера';

    this.logger.error(
      `Unhandled Exception [${request.method}] ${request.url}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: ApiResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера. Попробуйте позже.',
      error: 'Internal Server Error',
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
