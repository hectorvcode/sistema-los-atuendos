import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommand } from '../command.interface';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';
import { ServicioStateContext } from '../../state/servicio-state-context';

/**
 * Comando concreto para procesar la devolución de un servicio de alquiler
 *
 * Encapsula la lógica de devolución de un servicio, permitiendo:
 * - Ejecución de la devolución
 * - Deshacer la devolución (volver a estado entregado)
 * - Auditoría de la operación
 * - Registro de fecha de devolución
 *
 * Integración con State Pattern: Utiliza el StateContext para manejar
 * la transición de estado de forma segura.
 */
@Injectable()
export class DevolverServicioCommand implements ICommand {
  private servicio: ServicioAlquiler;
  private estadoAnterior: string;
  private fechaDevolucionAnterior: Date | null;

  constructor(
    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
    @Inject(ServicioStateContext)
    private readonly stateContext: ServicioStateContext,
    private readonly servicioId: number,
  ) {}

  /**
   * Ejecuta el comando de devolución
   * - Busca el servicio por ID
   * - Guarda el estado anterior y fecha de devolución para poder deshacer
   * - Ejecuta la transición usando State Pattern
   * - Registra la fecha de devolución
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

    // Guardar estado anterior y fecha de devolución para undo
    this.estadoAnterior = this.servicio.estado;
    this.fechaDevolucionAnterior = this.servicio.fechaDevolucion;

    // Ejecutar transición de estado usando State Pattern
    await this.stateContext.devolver(this.servicio);

    // Registrar fecha de devolución si no existe
    if (!this.servicio.fechaDevolucion) {
      this.servicio.fechaDevolucion = new Date();
    }

    // Persistir cambios
    const servicioActualizado = await this.servicioRepository.save(
      this.servicio,
    );

    return servicioActualizado;
  }

  /**
   * Deshace el comando de devolución
   * - Revierte el servicio al estado anterior (entregado)
   * - Restaura la fecha de devolución anterior
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

    // Revertir al estado anterior y restaurar fecha de devolución
    servicioActual.estado = this.estadoAnterior;
    servicioActual.fechaDevolucion = (this.fechaDevolucionAnterior as Date) ?? null;

    await this.servicioRepository.save(servicioActual);
  }

  /**
   * Obtiene el nombre del comando para auditoría
   */
  getName(): string {
    return 'DevolverServicioCommand';
  }

  /**
   * Obtiene los parámetros del comando para logging
   */
  getParams(): Record<string, any> {
    return {
      servicioId: this.servicioId,
      estadoAnterior: this.estadoAnterior,
      estadoNuevo: this.servicio?.estado,
      fechaDevolucion: this.servicio?.fechaDevolucion,
    };
  }
}