import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Interceptor para logging automático de peticiones y respuestas
 * Útil para monitoreo y debugging
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';

    const startTime = Date.now();

    // Log de petición entrante
    this.logger.log(`→ ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsedTime = Date.now() - startTime;
          const { statusCode } = response;

          // Log de respuesta exitosa
          this.logger.log(
            `← ${method} ${url} - ${statusCode} - ${elapsedTime}ms`,
          );
        },
        error: (error) => {
          const elapsedTime = Date.now() - startTime;
          const statusCode = error?.status || 500;

          // Log de error
          this.logger.error(
            `← ${method} ${url} - ${statusCode} - ${elapsedTime}ms - ${error?.message}`,
          );
        },
      }),
    );
  }
}