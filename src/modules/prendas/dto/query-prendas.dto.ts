import { IsString, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrdenPrendas {
  TALLA_ASC = 'talla_asc',
  TALLA_DESC = 'talla_desc',
  VALOR_ASC = 'valor_asc',
  VALOR_DESC = 'valor_desc',
  REFERENCIA_ASC = 'referencia_asc',
  REFERENCIA_DESC = 'referencia_desc',
}

export class QueryPrendasDto {
  @ApiPropertyOptional({
    description: 'Talla de la prenda',
    example: 'M',
  })
  @IsString()
  @IsOptional()
  talla?: string;

  @ApiPropertyOptional({
    description: 'Tipo de prenda',
    example: 'vestido-dama',
  })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Estado de la prenda',
    example: 'disponible',
  })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Color de la prenda',
    example: 'Rojo',
  })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Ordenamiento de los resultados',
    enum: OrdenPrendas,
    default: OrdenPrendas.REFERENCIA_ASC,
  })
  @IsEnum(OrdenPrendas)
  @IsOptional()
  orden?: OrdenPrendas;

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
