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
// Strategy Pattern imports
import {
  PricingStrategyContext,
  RegularPricingStrategy,
  VipPricingStrategy,
  SeasonalPricingStrategy,
  BulkPricingStrategy,
  PromotionalPricingStrategy,
} from '../../patterns/behavioral/strategy';

/**
 * ServiciosModule - Módulo de gestión de servicios de alquiler
 * Implementa:
 * - Builder Pattern para construcción compleja de servicios
 * - Singleton Pattern para generación de consecutivos
 * - Repository Pattern para abstracción de persistencia
 * - State Pattern para gestión del ciclo de vida del servicio
 * - Strategy Pattern para cálculo flexible de precios
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
    // Strategy Pattern providers
    PricingStrategyContext,
    RegularPricingStrategy,
    VipPricingStrategy,
    SeasonalPricingStrategy,
    BulkPricingStrategy,
    PromotionalPricingStrategy,
  ],
  exports: [
    ServiciosService,
    ServicioRepository,
    ServicioStateContext,
    PricingStrategyContext,
  ],
})
export class ServiciosModule {}
