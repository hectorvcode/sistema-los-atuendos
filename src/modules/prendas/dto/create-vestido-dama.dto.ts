import {
  IsBoolean,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePrendaDto } from './create-prenda.dto';

export class CreateVestidoDamaDto extends CreatePrendaDto {
  @ApiProperty({
    description: 'Indica si el vestido tiene pedrería',
    example: true,
  })
  @IsBoolean()
  tienePedreria: boolean;

  @ApiProperty({
    description: 'Indica si el vestido es largo',
    example: true,
  })
  @IsBoolean()
  esLargo: boolean;

  @ApiProperty({
    description: 'Cantidad de piezas del vestido',
    example: 2,
  })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  cantidadPiezas: number;

  @ApiPropertyOptional({
    description: 'Descripción de las piezas del vestido',
    example: 'Vestido + bolero',
  })
  @IsString()
  @IsOptional()
  descripcionPiezas?: string;
}
