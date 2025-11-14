/**
 * Interfaz estándar para todas las respuestas de la API
 * Garantiza consistencia en la estructura de responses
 */
export interface ApiResponse<T = any> {
  /**
   * Indica si la operación fue exitosa
   */
  success: boolean;

  /**
   * Código de estado HTTP
   */
  statusCode: number;

  /**
   * Mensaje descriptivo de la operación
   */
  message: string;

  /**
   * Datos de la respuesta (opcional)
   */
  data?: T;

  /**
   * Metadatos adicionales (paginación, timestamps, etc.)
   */
  meta?: Record<string, any>;

  /**
   * Timestamp de la respuesta
   */
  timestamp: string;

  /**
   * Path de la petición
   */
  path: string;
}

/**
 * Interfaz para respuestas de error
 */
export interface ApiErrorResponse extends ApiResponse<null> {
  /**
   * Código de error interno de la aplicación
   */
  errorCode?: string;

  /**
   * Detalles del error (solo en desarrollo)
   */
  errors?: Array<{
    field?: string;
    message: string;
    constraint?: string;
  }>;

  /**
   * Stack trace (solo en desarrollo)
   */
  stack?: string;
}

/**
 * Interfaz para respuestas paginadas
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}