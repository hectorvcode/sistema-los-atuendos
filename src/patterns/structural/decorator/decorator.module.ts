// src/patterns/structural/decorator/decorator.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

// Services
import { DecoratorService } from './decorator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Prenda])],
  providers: [DecoratorService],
  exports: [DecoratorService],
})
export class DecoratorModule {}
