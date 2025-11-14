import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Interceptor global para transformar respuestas exitosas
 * Aplica formato estandarizado a todas las respuestas de la API
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Si la respuesta ya está en el formato ApiResponse, devolverla tal cual
        if (this.isApiResponse(data)) {
          return data;
        }

        // Transformar respuesta a formato estandarizado
        return this.transformResponse(data, request, response.statusCode);
      }),
    );
  }

  /**
   * Verifica si la data ya está en formato ApiResponse
   */
  private isApiResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'success' in data &&
      'statusCode' in data &&
      'timestamp' in data &&
      'path' in data
    );
  }

  /**
   * Transforma la data en formato ApiResponse estandarizado
   */
  private transformResponse(
    data: any,
    request: Request,
    statusCode: number,
  ): ApiResponse<T> {
    // Extraer metadatos si existen (para paginación)
    const meta = this.extractMeta(data);

    // Extraer datos reales
    const responseData = this.extractData(data);

    return {
      success: true,
      statusCode,
      message: this.generateSuccessMessage(request.method, statusCode),
      data: responseData,
      meta,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  /**
   * Extrae metadatos de paginación si existen
   */
  private extractMeta(data: any): Record<string, any> | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }

    // Si tiene estructura de paginación estándar
    if ('total' in data && 'pagina' in data) {
      return {
        currentPage: data.pagina,
        itemsPerPage: data.limite,
        totalItems: data.total,
        totalPages: data.totalPaginas,
        hasNextPage: data.pagina < data.totalPaginas,
        hasPreviousPage: data.pagina > 1,
      };
    }

    // Si tiene meta explícito
    if ('meta' in data) {
      return data.meta;
    }

    return undefined;
  }

  /**
   * Extrae los datos reales de la respuesta
   */
  private extractData(data: any): any {
    if (!data) {
      return null;
    }

    // Si tiene estructura de paginación, extraer el array de datos
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data;
    }

    return data;
  }

  /**
   * Genera mensaje de éxito basado en el método HTTP y status code
   */
  private generateSuccessMessage(method: string, statusCode: number): string {
    const messages: Record<string, Record<number, string>> = {
      GET: {
        200: 'Datos obtenidos exitosamente',
        204: 'Sin contenido',
      },
      POST: {
        200: 'Operación completada exitosamente',
        201: 'Recurso creado exitosamente',
      },
      PUT: {
        200: 'Recurso actualizado exitosamente',
      },
      PATCH: {
        200: 'Recurso modificado exitosamente',
      },
      DELETE: {
        200: 'Recurso eliminado exitosamente',
        204: 'Recurso eliminado exitosamente',
      },
    };

    return (
      messages[method]?.[statusCode] || 'Operación completada exitosamente'
    );
  }
}