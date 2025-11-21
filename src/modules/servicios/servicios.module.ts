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
import { BehavioralPatternsModule } from '../../patterns/behavioral/behavioral-patterns.module';

/**
 * ServiciosModule - Módulo de gestión de servicios de alquiler
 * Implementa:
 * - Builder Pattern para construcción compleja de servicios
 * - Singleton Pattern para generación de consecutivos
 * - Repository Pattern para abstracción de persistencia
 * - State Pattern para gestión del ciclo de vida del servicio
 * - Strategy Pattern para cálculo flexible de precios
 * - Observer Pattern para notificaciones de eventos
 * - Command Pattern para encapsular operaciones con capacidad de undo/redo
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ServicioAlquiler, Cliente, Empleado, Prenda]),
    // Importar módulo de patrones creacionales para usar Builder y Singleton
    CreationalPatternsModule,
    // Importar módulo de patrones de comportamiento
    BehavioralPatternsModule,
  ],
  controllers: [ServiciosController],
  providers: [
    ServiciosService,
    ServicioRepository,
  ],
  exports: [
    ServiciosService,
    ServicioRepository,
  ],
})
export class ServiciosModule {}
