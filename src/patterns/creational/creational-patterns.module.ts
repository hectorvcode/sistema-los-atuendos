import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BehavioralPatternsModule } from '../behavioral/behavioral-patterns.module';

// Entidades
import { VestidoDama } from '../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../modules/prendas/entities/traje-caballero.entity';
import { Disfraz } from '../../modules/prendas/entities/disfraz.entity';
import { ServicioAlquiler } from '../../modules/servicios/entities/servicio-alquiler.entity';
import { Cliente } from '../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../modules/empleados/entities/empleado.entity';
import { Prenda } from '../../modules/prendas/entities/prenda.entity';
import { Consecutivo } from './singleton/consecutivo.entity';

// Factory Pattern
import { VestidoDamaFactory } from './factory/vestido-dama.factory';
import { TrajeCaballeroFactory } from './factory/traje-caballero.factory';
import { DisfrazFactory } from './factory/disfraz.factory';
import { PrendaFactoryRegistry } from './factory/prenda-factory.registry';

// Builder Pattern
import { ServicioAlquilerBuilder } from './builder/servicio-alquiler.builder';

// Singleton Pattern
import { GeneradorConsecutivo } from './singleton/generador-consecutivo.singleton';
import { DemoPatternsService } from './demo/demo-patterns.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Entidades de prendas
      Prenda,
      VestidoDama,
      TrajeCaballero,
      Disfraz,
      // Entidades de servicios
      ServicioAlquiler,
      Cliente,
      Empleado,
      // Entidad de consecutivos
      Consecutivo,
    ]),
    // Importar patrones de comportamiento para acceso a PricingStrategyContext
    BehavioralPatternsModule,
  ],
  providers: [
    // Factory Pattern
    VestidoDamaFactory,
    TrajeCaballeroFactory,
    DisfrazFactory,
    PrendaFactoryRegistry,

    // Builder Pattern
    ServicioAlquilerBuilder,

    // Singleton Pattern
    GeneradorConsecutivo,
    DemoPatternsService,
  ],
  exports: [
    // Exportar para uso en otros módulos
    PrendaFactoryRegistry,
    ServicioAlquilerBuilder,
    GeneradorConsecutivo,
    VestidoDamaFactory,
    TrajeCaballeroFactory,
    DisfrazFactory,
    DemoPatternsService,
  ],
})
export class CreationalPatternsModule {}
