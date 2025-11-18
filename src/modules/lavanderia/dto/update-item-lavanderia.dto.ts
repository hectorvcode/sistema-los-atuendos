import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoLavanderia } from './query-lavanderia.dto';

/**
 * DTO para actualizar el estado de un ítem de lavandería
 */
export class UpdateItemLavanderiaDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado del ítem de lavandería',
    enum: EstadoLavanderia,
    example: EstadoLavanderia.EN_PROCESO,
  })
  @IsOptional()
  @IsEnum(EstadoLavanderia)
  estado?: EstadoLavanderia;
}
