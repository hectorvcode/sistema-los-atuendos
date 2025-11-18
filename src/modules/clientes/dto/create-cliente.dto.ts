import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({
    description: 'Número de identificación del cliente (único)',
    example: '1234567890',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  numeroIdentificacion: string;

  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez García',
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({
    description: 'Dirección de residencia',
    example: 'Calle 123 #45-67, Bogotá',
  })
  @IsString()
  @MaxLength(200)
  direccion: string;

  @ApiProperty({
    description: 'Número telefónico',
    example: '3001234567',
  })
  @IsString()
  @MaxLength(20)
  telefono: string;

  @ApiProperty({
    description: 'Correo electrónico (único)',
    example: 'juan.perez@email.com',
  })
  @IsEmail()
  @MaxLength(100)
  correoElectronico: string;

  @ApiPropertyOptional({
    description: 'Estado del cliente (activo/inactivo)',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del cliente (formato ISO)',
    example: '1990-05-15',
  })
  @IsDateString()
  @IsOptional()
  fechaNacimiento?: Date;
}
