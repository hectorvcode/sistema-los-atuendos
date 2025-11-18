import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosController } from './controllers/empleados.controller';
import { EmpleadosService } from './services/empleados.service';
import { EmpleadoRepository } from './repositories/empleado.repository';
import { Empleado } from './entities/empleado.entity';
import { ServicioAlquiler } from '../servicios/entities/servicio-alquiler.entity';

/**
 * EmpleadosModule - Módulo de gestión de empleados
 * Implementa CRUD completo y consulta de servicios por empleado
 */
@Module({
  imports: [TypeOrmModule.forFeature([Empleado, ServicioAlquiler])],
  controllers: [EmpleadosController],
  providers: [EmpleadosService, EmpleadoRepository],
  exports: [EmpleadosService, EmpleadoRepository],
})
export class EmpleadosModule {}
