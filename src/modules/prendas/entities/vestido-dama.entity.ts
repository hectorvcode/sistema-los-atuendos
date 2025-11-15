import { Column, ChildEntity } from 'typeorm';
import { Prenda } from './prenda.entity';

@ChildEntity('VestidoDama')
export class VestidoDama extends Prenda {
  @Column({
    type: 'boolean',
    default: false,
  })
  tienePedreria: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  esLargo: boolean;

  @Column({
    type: 'int',
    default: 1,
  })
  cantidadPiezas: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  descripcionPiezas: string;
}
