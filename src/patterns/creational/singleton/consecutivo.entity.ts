import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('consecutivos')
export class Consecutivo {
  @PrimaryColumn({
    type: 'varchar',
    length: 50,
  })
  tipo: string;

  @Column({
    type: 'int',
    default: 0,
  })
  ultimoNumero: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  ultimaActualizacion: Date;
}
