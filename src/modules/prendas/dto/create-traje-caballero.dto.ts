import {
  IsBoolean,
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePrendaDto } from './create-prenda.dto';

export enum TipoTraje {
  CONVENCIONAL = 'convencional',
  FRAC = 'frac',
  SACOLEVA = 'sacoleva',
  OTRO = 'otro',
}

export class CreateTrajeCaballeroDto extends CreatePrendaDto {
  @ApiProperty({
    description: 'Tipo de traje',
    enum: TipoTraje,
    example: TipoTraje.CONVENCIONAL,
  })
  @IsEnum(TipoTraje)
  tipoTraje: TipoTraje;

  @ApiProperty({
    description: 'Indica si incluye corbata',
    example: true,
  })
  @IsBoolean()
  tieneCorbata: boolean;

  @ApiProperty({
    description: 'Indica si incluye corbatín',
    example: false,
  })
  @IsBoolean()
  tieneCorbtain: boolean;

  @ApiProperty({
    description: 'Indica si incluye plastrón',
    example: false,
  })
  @IsBoolean()
  tienePlastron: boolean;

  @ApiPropertyOptional({
    description: 'Accesorios incluidos con el traje',
    example: 'Gemelos, fajín y zapatos',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  accesoriosIncluidos?: string;
}
