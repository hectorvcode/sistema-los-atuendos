import { Injectable, BadRequestException } from '@nestjs/common';
import { AbstractServicioState } from '../abstract-servicio-state';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Estado Confirmado - El cliente ha confirmado el servicio
 *
 * Transiciones permitidas:
 * - Entregar → Entregado
 * - Cancelar → Cancelado (con posible penalización)
 *
 * Características:
 * - Se puede modificar (fechas, observaciones)
 * - No se puede eliminar
 * - Las prendas están reservadas
 */
@Injectable()
export class ConfirmedState extends AbstractServicioState {
  readonly nombre = 'confirmado';

  /**
   * Permite entregar el servicio al cliente
   */
  async entregar(servicio: ServicioAlquiler): Promise<void> {
    // Validar que la fecha de alquiler no sea en el futuro lejano
    const hoy = new Date();
    const fechaAlquiler = new Date(servicio.fechaAlquiler);
    const diferenciaDias = Math.ceil(
      (fechaAlquiler.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diferenciaDias > 7) {
      throw new BadRequestException(
        `No se puede entregar el servicio con más de 7 días de anticipación. Fecha de alquiler: ${servicio.fechaAlquiler}`,
      );
    }

    await this.transicionarA(servicio, 'entregado', async () => {
      console.log(`Servicio #${servicio.numero} entregado al cliente`);
      // Aquí se podrían actualizar estados de prendas si es necesario
    });
  }

  /**
   * Permite cancelar con validaciones adicionales
   */
  async cancelar(servicio: ServicioAlquiler): Promise<void> {
    await this.transicionarA(servicio, 'cancelado', async () => {
      const diasAnticipacion = Math.ceil(
        (new Date(servicio.fechaAlquiler).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (diasAnticipacion < 2) {
        console.log(
          `Servicio #${servicio.numero} cancelado con menos de 2 días de anticipación - Aplicar penalización`,
        );
      } else {
        console.log(`Servicio #${servicio.numero} cancelado`);
      }
    });
  }

  /**
   * En estado confirmado aún se puede modificar (cambiar fechas, observaciones)
   */
  puedeModificar(): boolean {
    return true;
  }

  /**
   * No se puede eliminar un servicio confirmado, solo cancelar
   */
  puedeEliminar(): boolean {
    return false;
  }

  /**
   * Estados a los que se puede transicionar desde Confirmado
   */
  obtenerTransicionesPermitidas(): string[] {
    return ['entregado', 'cancelado'];
  }

  /**
   * Hook al entrar en estado confirmado
   */
  async onEnter(servicio: ServicioAlquiler): Promise<void> {
    console.log(
      `Servicio #${servicio.numero} confirmado - Las prendas están reservadas`,
    );
    // Aquí se podría:
    // - Enviar email de confirmación al cliente
    // - Notificar al empleado encargado
    // - Generar recordatorio automático
  }
}
