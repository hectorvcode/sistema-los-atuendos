import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpleadoDto {
  @ApiProperty({
    description: 'Nombre completo del empleado',
    example: 'María González López',
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    description: 'Número de identificación del empleado (único)',
    example: '9876543210',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  numeroIdentificacion: string;

  @ApiProperty({
    description: 'Dirección de residencia',
    example: 'Carrera 45 #12-34, Medellín',
  })
  @IsString()
  @MaxLength(200)
  direccion: string;

  @ApiProperty({
    description: 'Número telefónico',
    example: '3109876543',
  })
  @IsString()
  @MaxLength(20)
  telefono: string;

  @ApiProperty({
    description: 'Cargo del empleado',
    example: 'Vendedor',
  })
  @IsString()
  @MaxLength(50)
  cargo: string;

  @ApiProperty({
    description: 'Correo electrónico (único)',
    example: 'maria.gonzalez@losatuendos.com',
  })
  @IsEmail()
  @MaxLength(100)
  correoElectronico: string;

  @ApiPropertyOptional({
    description: 'Estado del empleado (activo/inactivo)',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({
    description: 'Fecha de ingreso del empleado (formato ISO)',
    example: '2023-01-15',
  })
  @IsString()
  fechaIngreso: string;

  @ApiPropertyOptional({
    description: 'Salario mensual del empleado',
    example: 2500000,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  salario?: number;
}
