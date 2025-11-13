// src/patterns/structural/facade/facade.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';
import { Cliente } from '../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../modules/empleados/entities/empleado.entity';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

// Services
import { NegocioFacadeService } from './services/negocio-facade.service';

// Import other pattern modules
import { CompositeModule } from '../composite/composite.module';
import { DecoratorModule } from '../decorator/decorator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prenda, Cliente, Empleado, ServicioAlquiler]),
    CompositeModule,
    DecoratorModule,
  ],
  providers: [NegocioFacadeService],
  exports: [NegocioFacadeService],
})
export class FacadeModule {}
