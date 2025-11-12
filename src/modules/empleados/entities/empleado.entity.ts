import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ServicioAlquiler } from '../../servicios/entities/servicio-alquiler.entity';

@Entity('empleados')
export class Empleado extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  numeroIdentificacion: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  direccion: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  telefono: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  cargo: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  correoElectronico: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  activo: boolean;

  @Column({
    type: 'date',
  })
  fechaIngreso: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  salario: number;

  // Relación One-to-Many con ServicioAlquiler
  @OneToMany(() => ServicioAlquiler, (servicio) => servicio.empleado)
  servicios: ServicioAlquiler[];
}
