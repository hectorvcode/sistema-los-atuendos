import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { ItemLavanderia } from './entities/item-lavanderia.entity';
import { Prenda } from '../prendas/entities/prenda.entity';

// Controladores
import { LavanderiaController } from './controllers/lavanderia.controller';

// Servicios
import { LavanderiaService } from './services/lavanderia.service';

// Repositorios
import { LavanderiaRepository } from './repositories/lavanderia.repository';

// Importar módulo de patrones estructurales para Decorator
import { StructuralPatternsModule } from '../../patterns/structural/structural-patterns.module';

/**
 * LavanderiaModule - Módulo de gestión de lavandería
 *
 * Implementa:
 * - Patrón Decorator para cálculo dinámico de prioridades
 * - Patrón Repository con Adapter para persistencia
 * - Cola ordenada por prioridad
 * - Procesamiento por lotes
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ItemLavanderia, Prenda]),
    StructuralPatternsModule, // Para usar DecoratorService
  ],
  controllers: [LavanderiaController],
  providers: [
    LavanderiaService,
    LavanderiaRepository,
  ],
  exports: [
    LavanderiaService,
    LavanderiaRepository,
  ],
})
export class LavanderiaModule {}