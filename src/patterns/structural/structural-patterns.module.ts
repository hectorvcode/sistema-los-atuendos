// src/patterns/structural/structural-patterns.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { Prenda } from '../../modules/prendas/entities/prenda.entity';

// Composite Pattern (ya existente)
import { CompositeManagerService } from './composite/services/composite-manager.service';

// Decorator Pattern (nuevo)
import { DecoratorService } from './decorator/decorator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Prenda])],
  providers: [
    // Composite Pattern
    CompositeManagerService,

    // Decorator Pattern
    DecoratorService,
  ],
  exports: [
    // Composite Pattern
    CompositeManagerService,

    // Decorator Pattern
    DecoratorService,
  ],
})
export class StructuralPatternsModule {}
