import { IsArray, ArrayMinSize, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para enviar un lote de ítems a lavandería
 * Permite procesamiento por lotes para optimizar operaciones
 */
export class EnviarLoteDto {
  @ApiProperty({
    description: 'IDs de los ítems de lavandería a enviar en lote',
    example: [1, 2, 3, 4, 5],
    type: [Number],
    isArray: true,
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un ítem para enviar' })
  @IsNumber({}, { each: true })
  itemsIds: number[];
}