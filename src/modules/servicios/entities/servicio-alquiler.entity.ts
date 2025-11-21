import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Empleado } from '../../empleados/entities/empleado.entity';
import { Prenda } from '../../prendas/entities/prenda.entity';

@Entity('servicios_alquiler')
export class ServicioAlquiler extends BaseEntity {
  @Column({
    type: 'int',
    unique: true,
  })
  numero: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaSolicitud: Date;

  @Column({
    type: 'date',
  })
  fechaAlquiler: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  fechaDevolucion: Date;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'confirmado', 'entregado', 'devuelto', 'cancelado'],
    default: 'pendiente',
  })
  estado: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  valorTotal: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  observaciones: string;

  // Relación Many-to-One con Cliente
  @ManyToOne(() => Cliente, (cliente) => cliente.servicios, {
    eager: true, // Cargar automáticamente la relación
  })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  // Relación Many-to-One con Empleado
  @ManyToOne(() => Empleado, (empleado) => empleado.servicios, {
    eager: true,
  })
  @JoinColumn({ name: 'empleado_id' })
  empleado: Empleado;

  // Relación Many-to-Many con Prendas
  @ManyToMany(() => Prenda, (prenda) => prenda.servicios, {
    eager: true,
  })
  @JoinTable({
    name: 'servicios_prendas',
    joinColumn: {
      name: 'servicio_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'prenda_id',
      referencedColumnName: 'id',
    },
  })
  prendas: Prenda[];
}
