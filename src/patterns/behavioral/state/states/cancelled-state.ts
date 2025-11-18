import { Injectable } from '@nestjs/common';
import { AbstractServicioState } from '../abstract-servicio-state';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Estado Cancelado - Estado terminal del servicio (flujo cancelado)
 *
 * Transiciones permitidas:
 * - Ninguna (estado terminal)
 *
 * Características:
 * - NO se puede modificar
 * - Se puede eliminar (opcional, según política de negocio)
 * - Las prendas quedan disponibles nuevamente
 */
@Injectable()
export class CancelledState extends AbstractServicioState {
  readonly nombre = 'cancelado';

  /**
   * No se puede modificar un servicio cancelado
   */
  puedeModificar(): boolean {
    return false;
  }

  /**
   * Se permite eliminar servicios cancelados para limpiar base de datos
   */
  puedeEliminar(): boolean {
    return true;
  }

  /**
   * Estado terminal - no hay transiciones permitidas
   */
  obtenerTransicionesPermitidas(): string[] {
    return [];
  }

  /**
   * Hook al entrar en estado cancelado
   */
  async onEnter(servicio: ServicioAlquiler): Promise<void> {
    console.log(
      `Servicio #${servicio.numero} cancelado - Las prendas quedan disponibles`,
    );
    // Aquí se podría:
    // - Liberar prendas inmediatamente
    // - Notificar cancelación al cliente
    // - Actualizar métricas de cancelaciones
    // - Registrar motivo de cancelación (si se implementa)
  }

  /**
   * Hook al salir del estado (no debería ocurrir)
   */
  async onExit(servicio: ServicioAlquiler): Promise<void> {
    console.warn(
      `ADVERTENCIA: El servicio #${servicio.numero} está saliendo del estado terminal 'cancelado'`,
    );
  }
}
