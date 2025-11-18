import { Injectable } from '@nestjs/common';
import { AbstractServicioState } from '../abstract-servicio-state';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Estado Pendiente - Estado inicial del servicio
 *
 * Transiciones permitidas:
 * - Confirmar → Confirmado
 * - Cancelar → Cancelado
 *
 * Características:
 * - Se puede modificar
 * - Se puede eliminar
 * - Espera confirmación del cliente
 */
@Injectable()
export class PendingState extends AbstractServicioState {
  readonly nombre = 'pendiente';

  /**
   * Permite confirmar el servicio
   */
  async confirmar(servicio: ServicioAlquiler): Promise<void> {
    await this.transicionarA(servicio, 'confirmado', async () => {
      console.log(`Servicio #${servicio.numero} confirmado`);
    });
  }

  /**
   * Permite cancelar el servicio sin penalización
   */
  async cancelar(servicio: ServicioAlquiler): Promise<void> {
    await this.transicionarA(servicio, 'cancelado', async () => {
      console.log(
        `Servicio #${servicio.numero} cancelado (sin penalización por estar pendiente)`,
      );
    });
  }

  /**
   * En estado pendiente se puede modificar el servicio
   */
  puedeModificar(): boolean {
    return true;
  }

  /**
   * En estado pendiente se puede eliminar el servicio
   */
  puedeEliminar(): boolean {
    return true;
  }

  /**
   * Estados a los que se puede transicionar desde Pendiente
   */
  obtenerTransicionesPermitidas(): string[] {
    return ['confirmado', 'cancelado'];
  }

  /**
   * Hook al entrar en estado pendiente
   */
  async onEnter(servicio: ServicioAlquiler): Promise<void> {
    console.log(`Servicio #${servicio.numero} está pendiente de confirmación`);
    // Aquí se podría enviar notificación al cliente
  }
}
