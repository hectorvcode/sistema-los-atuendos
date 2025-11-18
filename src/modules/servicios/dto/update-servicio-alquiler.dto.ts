import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum EstadoServicio {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  ENTREGADO = 'entregado',
  DEVUELTO = 'devuelto',
  CANCELADO = 'cancelado',
}

export class UpdateServicioAlquilerDto {
  @ApiPropertyOptional({
    description: 'Fecha de devolución del alquiler',
    example: '2025-02-20',
  })
  @IsDateString()
  @IsOptional()
  fechaDevolucion?: string;

  @ApiPropertyOptional({
    description: 'Estado del servicio',
    enum: EstadoServicio,
    example: EstadoServicio.CONFIRMADO,
  })
  @IsEnum(EstadoServicio)
  @IsOptional()
  estado?: EstadoServicio;

  @ApiPropertyOptional({
    description: 'Observaciones del servicio',
    example: 'Cliente confirmó entrega',
  })
  @IsString()
  @IsOptional()
  observaciones?: string;
}
