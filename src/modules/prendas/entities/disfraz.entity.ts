import { Column, ChildEntity } from 'typeorm';
import { Prenda } from './prenda.entity';

@ChildEntity()
export class Disfraz extends Prenda {
  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  categoria: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  descripcion: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  edadRecomendada: string;
}
