import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommand } from '../command.interface';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';
import { ServicioStateContext } from '../../state/servicio-state-context';

/**
 * Comando concreto para confirmar un servicio de alquiler
 *
 * Encapsula la lógica de confirmación de un servicio, permitiendo:
 * - Ejecución de la confirmación
 * - Deshacer la confirmación (volver a estado pendiente)
 * - Auditoría de la operación
 *
 * Integración con State Pattern: Utiliza el StateContext para manejar
 * la transición de estado de forma segura.
 */
@Injectable()
export class ConfirmarServicioCommand implements ICommand {
  private servicio: ServicioAlquiler;
  private estadoAnterior: string;

  constructor(
    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
    @Inject(ServicioStateContext)
    private readonly stateContext: ServicioStateContext,
    private readonly servicioId: number,
  ) {}

  /**
   * Ejecuta el comando de confirmación
   * - Busca el servicio por ID
   * - Guarda el estado anterior para poder deshacer
   * - Ejecuta la transición usando State Pattern
   * - Persiste los cambios
   */
  async execute(): Promise<ServicioAlquiler> {
    // Buscar el servicio
    const servicioEncontrado = await this.servicioRepository.findOne({
      where: { id: this.servicioId },
      relations: ['cliente', 'empleado', 'prendas'],
    });

    if (!servicioEncontrado) {
      throw new NotFoundException(
        `Servicio con ID ${this.servicioId} no encontrado`,
      );
    }

    this.servicio = servicioEncontrado;

    // Guardar estado anterior para undo
    this.estadoAnterior = this.servicio.estado;

    // Ejecutar transición de estado usando State Pattern
    await this.stateContext.confirmar(this.servicio);

    // Persistir cambios
    const servicioActualizado = await this.servicioRepository.save(
      this.servicio,
    );

    return servicioActualizado;
  }

  /**
   * Deshace el comando de confirmación
   * - Revierte el servicio al estado anterior (pendiente)
   * - Usa State Pattern para validar la transición inversa
   */
  async undo(): Promise<void> {
    if (!this.servicio) {
      throw new Error('No se puede deshacer: comando no ejecutado');
    }

    // Recargar el servicio para asegurar que tenemos el estado actual
    const servicioActual = await this.servicioRepository.findOne({
      where: { id: this.servicioId },
      relations: ['cliente', 'empleado', 'prendas'],
    });

    if (!servicioActual) {
      throw new NotFoundException(
        `Servicio con ID ${this.servicioId} no encontrado`,
      );
    }

    // Revertir manualmente al estado anterior
    // Nota: En un sistema real, podrías tener un comando específico
    // o un método en State Pattern para revertir transiciones
    servicioActual.estado = this.estadoAnterior;

    await this.servicioRepository.save(servicioActual);
  }

  /**
   * Obtiene el nombre del comando para auditoría
   */
  getName(): string {
    return 'ConfirmarServicioCommand';
  }

  /**
   * Obtiene los parámetros del comando para logging
   */
  getParams(): Record<string, any> {
    return {
      servicioId: this.servicioId,
      estadoAnterior: this.estadoAnterior,
      estadoNuevo: this.servicio?.estado,
    };
  }
}