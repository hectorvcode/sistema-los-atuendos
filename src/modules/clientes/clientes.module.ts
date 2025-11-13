import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesController } from './controllers/clientes.controller';
import { ClientesService } from './services/clientes.service';
import { ClienteRepository } from './repositories/cliente.repository';
import { Cliente } from './entities/cliente.entity';
import { ServicioAlquiler } from '../servicios/entities/servicio-alquiler.entity';

/**
 * ClientesModule - Módulo de gestión de clientes
 * Implementa CRUD completo y consulta de servicios por cliente
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      ServicioAlquiler, // Necesario para las consultas de servicios
    ]),
  ],
  controllers: [ClientesController],
  providers: [
    ClientesService,
    ClienteRepository,
  ],
  exports: [
    ClientesService,
    ClienteRepository,
  ],
})
export class ClientesModule {}