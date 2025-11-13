import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { Prenda } from '../../modules/prendas/entities/prenda.entity';
import { VestidoDama } from '../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../modules/prendas/entities/traje-caballero.entity';
import { Disfraz } from '../../modules/prendas/entities/disfraz.entity';

// Composite Pattern
import { CompositeManagerService } from './composite/services/composite-manager.service';
import { ConjuntoBuilder } from './composite/builders/conjunto-builder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prenda, VestidoDama, TrajeCaballero, Disfraz]),
  ],
  providers: [
    // Composite Pattern
    CompositeManagerService,
    ConjuntoBuilder,
  ],
  exports: [
    // Composite Pattern
    CompositeManagerService,
    ConjuntoBuilder,
  ],
})
export class StructuralPatternsModule {}
