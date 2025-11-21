import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommand } from '../command.interface';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';
import { ServicioStateContext } from '../../state/servicio-state-context';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity';

/**
 * Comando concreto para cancelar un servicio de alquiler
 *
 * Encapsula la lógica de cancelación de un servicio, permitiendo:
 * - Ejecución de la cancelación
 * - Deshacer la cancelación (volver al estado anterior)
 * - Liberar las prendas asociadas
 * - Auditoría de la operación
 *
 * Integración con State Pattern: Utiliza el StateContext para manejar
 * la transición de estado de forma segura.
 */
@Injectable()
export class CancelarServicioCommand implements ICommand {
  private servicio: ServicioAlquiler;
  private estadoAnterior: string;
  private prendasDisponibilidadAnterior: Map<number, boolean> = new Map();

  constructor(
    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
    @Inject(ServicioStateContext)
    private readonly stateContext: ServicioStateContext,
    private readonly servicioId: number,
  ) {}

  /**
   * Ejecuta el comando de cancelación
   * - Busca el servicio por ID
   * - Guarda el estado anterior para poder deshacer
   * - Ejecuta la transición usando State Pattern
   * - Libera las prendas (las marca como disponibles)
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

    // Guardar disponibilidad anterior de las prendas
    for (const prenda of this.servicio.prendas) {
      this.prendasDisponibilidadAnterior.set(prenda.id, prenda.disponible);
    }

    // Ejecutar transición de estado usando State Pattern
    await this.stateContext.cancelar(this.servicio);

    // Liberar las prendas (marcarlas como disponibles)
    for (const prenda of this.servicio.prendas) {
      prenda.disponible = true;
    }

    // Guardar las prendas actualizadas
    await this.prendaRepository.save(this.servicio.prendas);

    // Persistir cambios del servicio
    const servicioActualizado = await this.servicioRepository.save(
      this.servicio,
    );

    return servicioActualizado;
  }

  /**
   * Deshace el comando de cancelación
   * - Revierte el servicio al estado anterior
   * - Restaura la disponibilidad anterior de las prendas
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

    // Restaurar disponibilidad anterior de las prendas
    for (const prenda of servicioActual.prendas) {
      const disponibilidadAnterior =
        this.prendasDisponibilidadAnterior.get(prenda.id);
      if (disponibilidadAnterior !== undefined) {
        prenda.disponible = disponibilidadAnterior;
      }
    }

    // Guardar las prendas actualizadas
    await this.prendaRepository.save(servicioActual.prendas);

    // Guardar el servicio
    await this.servicioRepository.save(servicioActual);
  }

  /**
   * Obtiene el nombre del comando para auditoría
   */
  getName(): string {
    return 'CancelarServicioCommand';
  }

  /**
   * Obtiene los parámetros del comando para logging
   */
  getParams(): Record<string, any> {
    return {
      servicioId: this.servicioId,
      estadoAnterior: this.estadoAnterior,
      estadoNuevo: this.servicio?.estado,
      prendasLiberadas: this.servicio?.prendas?.map((p) => p.id) || [],
    };
  }
}