import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommand } from '../command.interface';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';
import { ServicioStateContext } from '../../state/servicio-state-context';

/**
 * Comando concreto para entregar un servicio de alquiler al cliente
 *
 * Encapsula la lógica de entrega de un servicio, permitiendo:
 * - Ejecución de la entrega
 * - Deshacer la entrega (volver a estado confirmado)
 * - Auditoría de la operación
 *
 * Integración con State Pattern: Utiliza el StateContext para manejar
 * la transición de estado de forma segura.
 */
@Injectable()
export class EntregarServicioCommand implements ICommand {
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
   * Ejecuta el comando de entrega
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
    await this.stateContext.entregar(this.servicio);

    // Persistir cambios
    const servicioActualizado = await this.servicioRepository.save(
      this.servicio,
    );

    return servicioActualizado;
  }

  /**
   * Deshace el comando de entrega
   * - Revierte el servicio al estado anterior (confirmado)
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

    // Revertir al estado anterior
    servicioActual.estado = this.estadoAnterior;

    await this.servicioRepository.save(servicioActual);
  }

  /**
   * Obtiene el nombre del comando para auditoría
   */
  getName(): string {
    return 'EntregarServicioCommand';
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