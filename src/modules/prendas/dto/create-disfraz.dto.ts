import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePrendaDto } from './create-prenda.dto';

export class CreateDisfrazDto extends CreatePrendaDto {
  @ApiProperty({
    description: 'Nombre del disfraz',
    example: 'Superhéroe',
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({
    description: 'Categoría del disfraz',
    example: 'Halloween',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Descripción del disfraz',
    example: 'Disfraz completo de superhéroe con capa y máscara',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Edad recomendada',
    example: '6-12 años',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  edadRecomendada?: string;
}
