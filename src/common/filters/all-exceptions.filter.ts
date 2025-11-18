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
 * Filtro global para capturar TODAS las excepciones (incluso no-HTTP)
 * Garantiza que siempre se devuelva una respuesta en formato consistente
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let stack: string | undefined;

    // Si es una HttpException, extraer información
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = this.extractMessage(exceptionResponse);
      stack = exception.stack;
    }
    // Si es un Error estándar
    else if (exception instanceof Error) {
      message = exception.message || message;
      stack = exception.stack;
    }
    // Si es un objeto con statusCode (error de validación de class-validator)
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      'statusCode' in exception
    ) {
      const exceptionObj = exception as any;
      status = exceptionObj.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exceptionObj.message || message;

      // Si hay errores de validación, formatearlos
      if (exceptionObj.errors && Array.isArray(exceptionObj.errors)) {
        const errorMessages = exceptionObj.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(', ');
        message = `Error de validación: ${errorMessages}`;
      }
    }
    // Si es algo desconocido
    else if (typeof exception === 'string') {
      message = exception;
    }

    // Construir respuesta de error estandarizada
    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      data: null,
      errorCode: this.getErrorCode(status),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Incluir stack trace solo en desarrollo
    if (process.env.NODE_ENV === 'development' && stack) {
      errorResponse.stack = stack;
    }

    // Log del error crítico
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      stack,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Extrae el mensaje de error
   */
  private extractMessage(exceptionResponse: string | object): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as any;

      if (Array.isArray(resp.message)) {
        return resp.message.join(', ');
      }

      if (resp.message) {
        return resp.message;
      }

      if (resp.error) {
        return resp.error;
      }
    }

    return 'Error en la petición';
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
}
