import { Entity, Column, TableInheritance, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ServicioAlquiler } from '../../servicios/entities/servicio-alquiler.entity';

@Entity('prendas')
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
export abstract class Prenda extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  referencia: string;

  @Column({
    type: 'varchar',
    length: 30,
  })
  color: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  marca: string;

  @Column({
    type: 'varchar',
    length: 10,
  })
  talla: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorAlquiler: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  disponible: boolean;

  @Column({
    type: 'enum',
    enum: ['disponible', 'alquilada', 'lavanderia', 'mantenimiento'],
    default: 'disponible',
  })
  estado: string;

  // Relación Many-to-Many con ServicioAlquiler
  @ManyToMany(() => ServicioAlquiler, (servicio) => servicio.prendas)
  servicios: ServicioAlquiler[];
}
