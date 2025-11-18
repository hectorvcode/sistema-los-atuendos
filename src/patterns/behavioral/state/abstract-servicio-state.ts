import { BadRequestException } from '@nestjs/common';
import { IServicioState } from './servicio-state.interface';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Clase abstracta base para todos los estados de servicio
 *
 * Implementa el comportamiento por defecto (lanzar excepción)
 * Las clases concretas sobrescriben solo las transiciones permitidas
 */
export abstract class AbstractServicioState implements IServicioState {
  abstract readonly nombre: string;

  /**
   * Por defecto, no se puede confirmar desde ningún estado
   * Los estados que permitan esta transición deben sobrescribir este método
   */
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async confirmar(servicio: ServicioAlquiler): Promise<void> {
    throw new BadRequestException(
      `No se puede confirmar un servicio en estado ${this.nombre}`,
    );
  }

  /**
   * Por defecto, no se puede entregar desde ningún estado
   */
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async entregar(servicio: ServicioAlquiler): Promise<void> {
    throw new BadRequestException(
      `No se puede entregar un servicio en estado ${this.nombre}`,
    );
  }

  /**
   * Por defecto, no se puede devolver desde ningún estado
   */
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async devolver(servicio: ServicioAlquiler): Promise<void> {
    throw new BadRequestException(
      `No se puede devolver un servicio en estado ${this.nombre}`,
    );
  }

  /**
   * Por defecto, no se puede cancelar desde ningún estado
   */
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async cancelar(servicio: ServicioAlquiler): Promise<void> {
    throw new BadRequestException(
      `No se puede cancelar un servicio en estado ${this.nombre}`,
    );
  }

  /**
   * Por defecto, los servicios no se pueden modificar
   * Solo los estados pendiente y confirmado permitirán modificaciones
   */
  puedeModificar(): boolean {
    return false;
  }

  /**
   * Por defecto, los servicios no se pueden eliminar
   * Solo los estados pendiente y cancelado permitirán eliminación
   */
  puedeEliminar(): boolean {
    return false;
  }

  /**
   * Retorna lista vacía por defecto
   * Cada estado concreto debe especificar sus transiciones permitidas
   */
  obtenerTransicionesPermitidas(): string[] {
    return [];
  }

  /**
   * Hook opcional al entrar en el estado
   */
  async onEnter?(servicio: ServicioAlquiler): Promise<void>;

  /**
   * Hook opcional al salir del estado
   */
  async onExit?(servicio: ServicioAlquiler): Promise<void>;

  /**
   * Método auxiliar para realizar la transición de estado
   */
  protected async transicionarA(
    servicio: ServicioAlquiler,
    nuevoEstado: string,
    accionesAdicionales?: () => Promise<void>,
  ): Promise<void> {
    // Ejecutar hook de salida si existe
    if (this.onExit) {
      await this.onExit(servicio);
    }

    // Ejecutar acciones adicionales si se proporcionan
    if (accionesAdicionales) {
      await accionesAdicionales();
    }

    // Cambiar el estado
    servicio.estado = nuevoEstado;
  }
}
