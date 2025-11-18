import {
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EstadoPrenda {
  DISPONIBLE = 'disponible',
  ALQUILADA = 'alquilada',
  LAVANDERIA = 'lavanderia',
  MANTENIMIENTO = 'mantenimiento',
}

export class CreatePrendaDto {
  @ApiProperty({
    description: 'Tipo de prenda (vestido-dama, traje-caballero, disfraz)',
    example: 'vestido-dama',
  })
  @IsString()
  @MaxLength(50)
  tipo: string;

  @ApiProperty({
    description: 'Referencia única de la prenda',
    example: 'VD-001',
  })
  @IsString()
  @MaxLength(50)
  referencia: string;

  @ApiProperty({
    description: 'Color de la prenda',
    example: 'Rojo',
  })
  @IsString()
  @MaxLength(30)
  color: string;

  @ApiProperty({
    description: 'Marca de la prenda',
    example: 'Elegance',
  })
  @IsString()
  @MaxLength(50)
  marca: string;

  @ApiProperty({
    description: 'Talla de la prenda',
    example: 'M',
  })
  @IsString()
  @MaxLength(10)
  talla: string;

  @ApiProperty({
    description: 'Valor de alquiler por día',
    example: 150.5,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  valorAlquiler: number;

  @ApiPropertyOptional({
    description: 'Estado de la prenda',
    enum: EstadoPrenda,
    default: EstadoPrenda.DISPONIBLE,
  })
  @IsEnum(EstadoPrenda)
  @IsOptional()
  estado?: EstadoPrenda;

  @ApiPropertyOptional({
    description: 'Indica si la prenda está disponible',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  disponible?: boolean;

  // Propiedades específicas opcionales que se validarán según el tipo
  @ApiPropertyOptional()
  @IsOptional()
  propiedadesEspecificas?: Record<string, any>;
}
