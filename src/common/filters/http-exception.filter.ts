import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

/**
 * Filtro global para manejo centralizado de excepciones HTTP
 * Transforma todas las excepciones en un formato de respuesta consistente
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extraer mensaje y errores de validación
    const message = this.extractMessage(exceptionResponse);
    const errors = this.extractValidationErrors(exceptionResponse);

    // Construir respuesta de error estandarizada
    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      data: null,
      errorCode: this.getErrorCode(status),
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Incluir stack trace solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = exception.stack;
    }

    // Log del error
    this.logError(exception, request, status);

    response.status(status).json(errorResponse);
  }

  /**
   * Extrae el mensaje de error de la respuesta de la excepción
   */
  private extractMessage(exceptionResponse: string | object): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as any;

      // Si hay un array de mensajes (validación), usar el primero o combinar
      if (Array.isArray(resp.message)) {
        return resp.message.join(', ');
      }

      // Si hay un mensaje único
      if (resp.message) {
        return resp.message;
      }

      // Si hay error
      if (resp.error) {
        return resp.error;
      }
    }

    return 'Error en la petición';
  }

  /**
   * Extrae errores de validación de class-validator
   */
  private extractValidationErrors(exceptionResponse: string | object): Array<{
    field?: string;
    message: string;
    constraint?: string;
  }> | undefined {
    if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as any;

      // Si es un array de errores de validación
      if (Array.isArray(resp.message) && resp.message.length > 0) {
        // Verificar si son objetos con estructura de ValidationError
        if (typeof resp.message[0] === 'object') {
          return resp.message.map((err: any) => ({
            field: err.property || err.field,
            message: Object.values(err.constraints || {}).join(', ') || err.message,
            constraint: err.constraint,
          }));
        }

        // Si son strings simples
        return resp.message.map((msg: string) => ({
          message: msg,
        }));
      }
    }

    return undefined;
  }

  /**
   * Obtiene un código de error basado en el status HTTP
   */
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Registra el error en los logs
   */
  private logError(exception: HttpException, request: Request, status: number) {
    const message = `${request.method} ${request.url} - ${status} - ${exception.message}`;

    if (status >= 500) {
      this.logger.error(message, exception.stack);
    } else if (status >= 400) {
      this.logger.warn(message);
    }
  }
}