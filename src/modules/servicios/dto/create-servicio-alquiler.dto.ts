import { IsInt, IsDateString, IsArray, IsOptional, IsString, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServicioAlquilerDto {
  @ApiProperty({
    description: 'ID del cliente que solicita el alquiler',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  clienteId: number;

  @ApiProperty({
    description: 'ID del empleado que gestiona el servicio',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  @Min(1)
  empleadoId: number;

  @ApiProperty({
    description: 'Fecha del alquiler (formato ISO, no puede ser en el pasado)',
    example: '2025-02-15',
  })
  @IsDateString()
  fechaAlquiler: string;

  @ApiProperty({
    description: 'Array de IDs de prendas a alquilar',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una prenda' })
  @IsInt({ each: true })
  @Type(() => Number)
  prendasIds: number[];

  @ApiPropertyOptional({
    description: 'Observaciones adicionales del servicio',
    example: 'Cliente solicita entrega a domicilio',
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}