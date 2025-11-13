import { IsString, IsBoolean, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrdenEmpleados {
  NOMBRE_ASC = 'nombre_asc',
  NOMBRE_DESC = 'nombre_desc',
  CARGO_ASC = 'cargo_asc',
  CARGO_DESC = 'cargo_desc',
  FECHA_INGRESO_ASC = 'fecha_ingreso_asc',
  FECHA_INGRESO_DESC = 'fecha_ingreso_desc',
}

export class QueryEmpleadosDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre (búsqueda parcial)',
    example: 'María',
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Buscar por identificación',
    example: '9876543210',
  })
  @IsString()
  @IsOptional()
  numeroIdentificacion?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por cargo',
    example: 'Vendedor',
  })
  @IsString()
  @IsOptional()
  cargo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Ordenamiento de los resultados',
    enum: OrdenEmpleados,
    default: OrdenEmpleados.NOMBRE_ASC,
  })
  @IsEnum(OrdenEmpleados)
  @IsOptional()
  orden?: OrdenEmpleados;

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