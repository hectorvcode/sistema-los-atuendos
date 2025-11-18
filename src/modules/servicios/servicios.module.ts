import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiciosController } from './controllers/servicios.controller';
import { ServiciosService } from './services/servicios.service';
import { ServicioRepository } from './repositories/servicio.repository';
import { ServicioAlquiler } from './entities/servicio-alquiler.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Empleado } from '../empleados/entities/empleado.entity';
import { Prenda } from '../prendas/entities/prenda.entity';
import { CreationalPatternsModule } from '../../patterns/creational/creational-patterns.module';
// State Pattern imports
import {
  ServicioStateContext,
  PendingState,
  ConfirmedState,
  DeliveredState,
  ReturnedState,
  CancelledState,
} from '../../patterns/behavioral/state';

/**
 * ServiciosModule - Módulo de gestión de servicios de alquiler
 * Implementa:
 * - Builder Pattern para construcción compleja de servicios
 * - Singleton Pattern para generación de consecutivos
 * - Repository Pattern para abstracción de persistencia
 * - State Pattern para gestión del ciclo de vida del servicio
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ServicioAlquiler, Cliente, Empleado, Prenda]),
    // Importar módulo de patrones creacionales para usar Builder y Singleton
    CreationalPatternsModule,
  ],
  controllers: [ServiciosController],
  providers: [
    ServiciosService,
    ServicioRepository,
    // State Pattern providers
    ServicioStateContext,
    PendingState,
    ConfirmedState,
    DeliveredState,
    ReturnedState,
    CancelledState,
  ],
  exports: [ServiciosService, ServicioRepository, ServicioStateContext],
})
export class ServiciosModule {}
