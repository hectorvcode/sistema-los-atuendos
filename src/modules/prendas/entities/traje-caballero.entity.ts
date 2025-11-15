import { Column, ChildEntity } from 'typeorm';
import { Prenda } from './prenda.entity';

@ChildEntity('TrajeCaballero')
export class TrajeCaballero extends Prenda {
  @Column({
    type: 'enum',
    enum: ['convencional', 'frac', 'sacoleva', 'otro'],
    default: 'convencional',
  })
  tipo: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  tieneCorbata: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  tieneCorbtain: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  tienePlastron: boolean;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  accesoriosIncluidos: string;
}
