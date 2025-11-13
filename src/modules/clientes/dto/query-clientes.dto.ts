import { IsString, IsBoolean, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrdenClientes {
  NOMBRE_ASC = 'nombre_asc',
  NOMBRE_DESC = 'nombre_desc',
  FECHA_ASC = 'fecha_asc',
  FECHA_DESC = 'fecha_desc',
}

export class QueryClientesDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre (búsqueda parcial)',
    example: 'Juan',
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Buscar por identificación',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  numeroIdentificacion?: string;

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
    enum: OrdenClientes,
    default: OrdenClientes.NOMBRE_ASC,
  })
  @IsEnum(OrdenClientes)
  @IsOptional()
  orden?: OrdenClientes;

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