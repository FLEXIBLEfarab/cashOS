import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/api-response.type';

/**
 * Оборачивает все успешные ответы контроллеров
 * в стандартный конверт { statusCode, message, data }.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const statusCode: number =
      context.switchToHttp().getResponse<{ statusCode: number }>().statusCode;

    return next.handle().pipe(
      map(
        (data): ApiResponse<T> => ({
          statusCode,
          message: 'Успешно',
          data,
        }),
      ),
    );
  }
}
