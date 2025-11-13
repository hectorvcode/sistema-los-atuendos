// src/patterns/structural/structural-patterns.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades (ajustar según tu estructura)
import { Prenda } from '../../modules/prendas/entities/prenda.entity';
import { Cliente } from '../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../modules/empleados/entities/empleado.entity';
import { ServicioAlquiler } from '../../modules/servicios/entities/servicio-alquiler.entity';

// Servicios de patrones estructurales
import { CompositeManagerService } from './composite/services/composite-manager.service';
import { DecoratorService } from './decorator/decorator.service';
import { NegocioFacadeService } from './facade/services/negocio-facade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prenda, Cliente, Empleado, ServicioAlquiler]),
  ],
  providers: [CompositeManagerService, DecoratorService, NegocioFacadeService],
  exports: [CompositeManagerService, DecoratorService, NegocioFacadeService],
})
export class StructuralPatternsModule {}
