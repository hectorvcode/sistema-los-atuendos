import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO base para respuestas exitosas de la API
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Código de estado HTTP',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Operación completada exitosamente',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Datos de la respuesta',
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales',
    example: { version: '1.0.0' },
  })
  meta?: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp de la respuesta en formato ISO',
    example: '2025-01-13T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Path de la petición',
    example: '/api/v1/prendas',
  })
  path: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
  }
}

/**
 * DTO para respuestas de error
 */
export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Código de estado HTTP',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensaje de error',
    example: 'Datos inválidos en la petición',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Código de error interno',
    example: 'VALIDATION_ERROR',
  })
  errorCode?: string;

  @ApiPropertyOptional({
    description: 'Detalles del error',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string', example: 'email' },
        message: { type: 'string', example: 'Email must be a valid email address' },
        constraint: { type: 'string', example: 'isEmail' },
      },
    },
  })
  errors?: Array<{
    field?: string;
    message: string;
    constraint?: string;
  }>;

  @ApiProperty({
    description: 'Timestamp del error',
    example: '2025-01-13T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Path de la petición',
    example: '/api/v1/prendas',
  })
  path: string;

  @ApiPropertyOptional({
    description: 'Stack trace (solo en desarrollo)',
  })
  stack?: string;
}

/**
 * DTO para metadatos de paginación
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    description: 'Elementos por página',
    example: 10,
  })
  itemsPerPage: number;

  @ApiProperty({
    description: 'Total de elementos',
    example: 50,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Indica si hay página siguiente',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Indica si hay página anterior',
    example: false,
  })
  hasPreviousPage: boolean;
}

/**
 * DTO para respuestas paginadas
 */
export class PaginatedApiResponseDto<T = any> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  declare meta: PaginationMetaDto;
}