// src/patterns/structural/composite/composite.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

// Services
import { CompositeManagerService } from './services/composite-manager.service';

// Builders
import { ConjuntoBuilder } from './builders/conjunto-builder';

@Module({
  imports: [TypeOrmModule.forFeature([Prenda])],
  providers: [CompositeManagerService, ConjuntoBuilder],
  exports: [CompositeManagerService, ConjuntoBuilder],
})
export class CompositeModule {}
