import { Injectable } from '@nestjs/common';
import { AbstractServicioState } from '../abstract-servicio-state';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Estado Devuelto - Estado terminal del servicio (flujo exitoso)
 *
 * Transiciones permitidas:
 * - Ninguna (estado terminal)
 *
 * Características:
 * - NO se puede modificar
 * - NO se puede eliminar (mantener histórico)
 * - NO se puede cancelar
 * - Las prendas deben ir a lavandería
 * - El servicio está completo
 */
@Injectable()
export class ReturnedState extends AbstractServicioState {
  readonly nombre = 'devuelto';

  /**
   * No se pueden realizar transiciones desde este estado
   */
  puedeModificar(): boolean {
    return false;
  }

  /**
   * No se puede eliminar para mantener histórico
   */
  puedeEliminar(): boolean {
    return false;
  }

  /**
   * Estado terminal - no hay transiciones permitidas
   */
  obtenerTransicionesPermitidas(): string[] {
    return [];
  }

  /**
   * Hook al entrar en estado devuelto
   */
  async onEnter(servicio: ServicioAlquiler): Promise<void> {
    console.log(
      `Servicio #${servicio.numero} completado - Las prendas deben ser enviadas a lavandería`,
    );
    // Aquí se podría:
    // - Enviar prendas automáticamente a cola de lavandería
    // - Generar factura final
    // - Enviar encuesta de satisfacción al cliente
    // - Liberar prendas para nuevo alquiler (después de lavandería)
    // - Actualizar estadísticas de servicios completados
  }

  /**
   * Hook al salir del estado (no debería ocurrir)
   */
  async onExit(servicio: ServicioAlquiler): Promise<void> {
    console.warn(
      `ADVERTENCIA: El servicio #${servicio.numero} está saliendo del estado terminal 'devuelto'`,
    );
  }
}
