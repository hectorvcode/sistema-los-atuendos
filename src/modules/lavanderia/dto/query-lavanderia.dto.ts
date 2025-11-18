import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Estados posibles para ítems de lavandería
 */
export enum EstadoLavanderia {
  PENDIENTE = 'pendiente',
  ENVIADO = 'enviado',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
}

/**
 * DTO para consultar ítems de lavandería con filtros y paginación
 */
export class QueryLavanderiaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado del ítem',
    enum: EstadoLavanderia,
    example: EstadoLavanderia.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(EstadoLavanderia)
  estado?: EstadoLavanderia;

  @ApiPropertyOptional({
    description: 'Filtrar por prioridad mínima (mayor o igual)',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  prioridadMinima?: number;

  @ApiPropertyOptional({
    description: 'Filtrar solo prendas manchadas',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  esManchada?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo prendas delicadas',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  esDelicada?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo con prioridad administrativa',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  prioridadAdministrativa?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limite?: number;
}
