import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrendasController } from './controllers/prendas.controller';
import { PrendasService } from './services/prendas.service';
import { PrendaRepository } from './repositories/prenda.repository';
import { Prenda } from './entities/prenda.entity';
import { VestidoDama } from './entities/vestido-dama.entity';
import { TrajeCaballero } from './entities/traje-caballero.entity';
import { Disfraz } from './entities/disfraz.entity';
import { CreationalPatternsModule } from '../../patterns/creational/creational-patterns.module';

/**
 * PrendasModule - Módulo de gestión de prendas
 * Implementa los patrones:
 * - Factory Method: Para crear prendas según su tipo
 * - Repository/Adapter: Para abstraer la persistencia
 */
@Module({
  imports: [
    // Importar las entidades de TypeORM
    TypeOrmModule.forFeature([Prenda, VestidoDama, TrajeCaballero, Disfraz]),
    // Importar el módulo de patrones creacionales que contiene el Factory
    CreationalPatternsModule,
  ],
  controllers: [PrendasController],
  providers: [PrendasService, PrendaRepository],
  exports: [PrendasService, PrendaRepository],
})
export class PrendasModule {}
