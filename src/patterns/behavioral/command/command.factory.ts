import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';
import { ServicioStateContext } from '../state/servicio-state-context';
import { ConfirmarServicioCommand } from './commands/confirmar-servicio.command';
import { EntregarServicioCommand } from './commands/entregar-servicio.command';
import { DevolverServicioCommand } from './commands/devolver-servicio.command';
import { CancelarServicioCommand } from './commands/cancelar-servicio.command';

/**
 * CommandFactory - Fábrica de comandos
 *
 * Responsabilidades:
 * - Crear instancias de comandos con sus dependencias inyectadas
 * - Centralizar la creación de comandos
 * - Facilitar la extensibilidad del sistema de comandos
 *
 * Patrón de Diseño: Factory Pattern + Command Pattern
 *
 * Ventajas:
 * - Simplifica la creación de comandos
 * - Encapsula la lógica de inyección de dependencias
 * - Facilita testing mediante mocking
 */
@Injectable()
export class CommandFactory {
  constructor(
    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
    private readonly stateContext: ServicioStateContext,
  ) {}

  /**
   * Crea un comando para confirmar un servicio
   * @param servicioId - ID del servicio a confirmar
   */
  createConfirmarServicioCommand(
    servicioId: number,
  ): ConfirmarServicioCommand {
    return new ConfirmarServicioCommand(
      this.servicioRepository,
      this.stateContext,
      servicioId,
    );
  }

  /**
   * Crea un comando para entregar un servicio
   * @param servicioId - ID del servicio a entregar
   */
  createEntregarServicioCommand(servicioId: number): EntregarServicioCommand {
    return new EntregarServicioCommand(
      this.servicioRepository,
      this.stateContext,
      servicioId,
    );
  }

  /**
   * Crea un comando para devolver un servicio
   * @param servicioId - ID del servicio a devolver
   */
  createDevolverServicioCommand(servicioId: number): DevolverServicioCommand {
    return new DevolverServicioCommand(
      this.servicioRepository,
      this.stateContext,
      servicioId,
    );
  }

  /**
   * Crea un comando para cancelar un servicio
   * @param servicioId - ID del servicio a cancelar
   */
  createCancelarServicioCommand(servicioId: number): CancelarServicioCommand {
    return new CancelarServicioCommand(
      this.servicioRepository,
      this.prendaRepository,
      this.stateContext,
      servicioId,
    );
  }
}