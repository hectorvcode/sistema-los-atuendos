import {
  IsInt,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrdenServicios {
  NUMERO_ASC = 'numero_asc',
  NUMERO_DESC = 'numero_desc',
  FECHA_ASC = 'fecha_asc',
  FECHA_DESC = 'fecha_desc',
  VALOR_ASC = 'valor_asc',
  VALOR_DESC = 'valor_desc',
}

export class QueryServiciosDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  clienteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de empleado',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  empleadoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del servicio',
    example: 'confirmado',
  })
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (formato ISO)',
    example: '2025-02-01',
  })
  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (formato ISO)',
    example: '2025-02-28',
  })
  @IsDateString()
  @IsOptional()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Solo servicios vigentes (confirmados o entregados)',
    example: true,
  })
  @IsOptional()
  vigentes?: boolean;

  @ApiPropertyOptional({
    description: 'Ordenamiento de los resultados',
    enum: OrdenServicios,
    default: OrdenServicios.FECHA_DESC,
  })
  @IsEnum(OrdenServicios)
  @IsOptional()
  orden?: OrdenServicios;

  @ApiPropertyOptional({
    description: 'Página actual (inicia en 1)',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  pagina?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    default: 10,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limite?: number;
}
