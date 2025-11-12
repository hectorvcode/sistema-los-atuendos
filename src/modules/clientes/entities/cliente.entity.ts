import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ServicioAlquiler } from '../../servicios/entities/servicio-alquiler.entity';

@Entity('clientes')
export class Cliente extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  numeroIdentificacion: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  nombre: string;

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
    nullable: true,
  })
  fechaNacimiento: Date;

  // Relación One-to-Many con ServicioAlquiler
  @OneToMany(() => ServicioAlquiler, (servicio) => servicio.cliente)
  servicios: ServicioAlquiler[];
}
