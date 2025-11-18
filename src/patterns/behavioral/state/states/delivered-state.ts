import { Injectable, BadRequestException } from '@nestjs/common';
import { AbstractServicioState } from '../abstract-servicio-state';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Estado Entregado - El cliente ya recibió las prendas
 *
 * Transiciones permitidas:
 * - Devolver → Devuelto
 *
 * Características:
 * - NO se puede modificar
 * - NO se puede eliminar
 * - NO se puede cancelar (ya fue entregado)
 * - Las prendas están con el cliente
 */
@Injectable()
export class DeliveredState extends AbstractServicioState {
  readonly nombre = 'entregado';

  /**
   * Permite registrar la devolución del servicio
   */
  async devolver(servicio: ServicioAlquiler): Promise<void> {
    await this.transicionarA(servicio, 'devuelto', async () => {
      // Establecer fecha de devolución
      servicio.fechaDevolucion = new Date();

      // Calcular si hay retraso
      const fechaAlquiler = new Date(servicio.fechaAlquiler);
      const diasTranscurridos = Math.ceil(
        (servicio.fechaDevolucion.getTime() - fechaAlquiler.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diasTranscurridos > 3) {
        console.log(
          `Servicio #${servicio.numero} devuelto con ${diasTranscurridos - 3} día(s) de retraso - Posible cargo adicional`,
        );
      } else {
        console.log(`Servicio #${servicio.numero} devuelto a tiempo`);
      }
    });
  }

  /**
   * No se puede cancelar un servicio ya entregado
   */
  async cancelar(servicio: ServicioAlquiler): Promise<void> {
    throw new BadRequestException(
      'No se puede cancelar un servicio ya entregado. Debe procesarse la devolución.',
    );
  }

  /**
   * No se puede modificar un servicio entregado
   */
  puedeModificar(): boolean {
    return false;
  }

  /**
   * No se puede eliminar un servicio entregado
   */
  puedeEliminar(): boolean {
    return false;
  }

  /**
   * Solo puede transicionar a devuelto
   */
  obtenerTransicionesPermitidas(): string[] {
    return ['devuelto'];
  }

  /**
   * Hook al entrar en estado entregado
   */
  async onEnter(servicio: ServicioAlquiler): Promise<void> {
    console.log(
      `Servicio #${servicio.numero} entregado - Cliente tiene las prendas`,
    );
    // Aquí se podría:
    // - Enviar SMS recordatorio de fecha de devolución
    // - Programar recordatorio automático
    // - Actualizar métricas de servicios activos
  }
}
