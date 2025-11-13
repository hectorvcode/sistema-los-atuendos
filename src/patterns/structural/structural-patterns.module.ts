// src/patterns/structural/structural-patterns.module.ts

import { Module } from '@nestjs/common';

// Módulos de patrones
import { CompositeModule } from './composite/composite.module';
import { DecoratorModule } from './decorator/decorator.module';
import { FacadeModule } from './facade/facade.module';
import { AdapterModule } from './adapter/adapter.module';

@Module({
  imports: [CompositeModule, DecoratorModule, FacadeModule, AdapterModule],
  exports: [CompositeModule, DecoratorModule, FacadeModule, AdapterModule],
})
export class StructuralPatternsModule {}
