import {
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para configuraciones de decoradores de prioridad
 * Alineado con las interfaces del DecoratorService
 */
export class ConfiguracionesDecoradorDto {
  @ApiPropertyOptional({
    description: 'Configuración de prioridad para prendas manchadas',
    example: { tipo: 'vino', gravedad: 'severa' },
  })
  @IsOptional()
  mancha?: {
    tipo: string;
    gravedad: 'leve' | 'moderada' | 'severa';
  };

  @ApiPropertyOptional({
    description: 'Configuración de prioridad para prendas delicadas',
    example: { razon: 'tejido delicado', cuidadoEspecial: true },
  })
  @IsOptional()
  delicada?: {
    razon: string;
    cuidadoEspecial: boolean;
  };

  @ApiPropertyOptional({
    description: 'Configuración de prioridad administrativa',
    example: {
      nivel: 'urgente',
      razon: 'evento importante',
      solicitadoPor: 'Gerencia',
    },
  })
  @IsOptional()
  administrativa?: {
    nivel: 'urgente' | 'alta' | 'media';
    razon: string;
    solicitadoPor: string;
    fechaLimite?: Date;
  };
}

/**
 * DTO para crear un ítem de lavandería
 * Integra el patrón Decorator para cálculo dinámico de prioridades
 */
export class CreateItemLavanderiaDto {
  @ApiProperty({
    description: 'Referencia de la prenda a enviar a lavandería',
    example: 'VD-001',
  })
  @IsNumber()
  prendaId: number;

  @ApiPropertyOptional({
    description: 'Indica si la prenda está manchada (aplica decorator)',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esManchada?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si la prenda es delicada (aplica decorator)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esDelicada?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si tiene prioridad administrativa (aplica decorator)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  prioridadAdministrativa?: boolean;

  @ApiPropertyOptional({
    description: 'Configuraciones adicionales para decoradores de prioridad',
    type: ConfiguracionesDecoradorDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ConfiguracionesDecoradorDto)
  configuraciones?: ConfiguracionesDecoradorDto;
}
