import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Prenda } from '../../prendas/entities/prenda.entity';

@Entity('items_lavanderia')
export class ItemLavanderia extends BaseEntity {
  @Column({
    type: 'int',
    default: 0,
  })
  prioridad: number;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'enviado', 'en_proceso', 'completado'],
    default: 'pendiente',
  })
  estado: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaRegistro: Date;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  fechaEnvio: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  esManchada: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  esDelicada: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  prioridadAdministrativa: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  observaciones: string;

  // Relación Many-to-One con Prenda
  @ManyToOne(() => Prenda, {
    eager: true,
  })
  @JoinColumn({ name: 'prenda_id' })
  prenda: Prenda;
}
