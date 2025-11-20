import { Injectable, Logger } from '@nestjs/common';
import { IServicioObserver } from '../servicio-observer.interface';
import { ServicioEvent, ServicioEventType } from '../servicio-event.interface';

/**
 * Estadísticas del dashboard
 */
interface DashboardStats {
  totalServicios: number;
  serviciosHoy: number;
  serviciosPendientes: number;
  serviciosConfirmados: number;
  serviciosEntregados: number;
  serviciosDevueltos: number;
  serviciosCancelados: number;
  devolucionesTardias: number;
  ultimaActualizacion: Date;
}

/**
 * Observador para actualización del dashboard en tiempo real
 * Mantiene estadísticas actualizadas del sistema
 */
@Injectable()
export class DashboardObserver implements IServicioObserver {
  private readonly logger = new Logger(DashboardObserver.name);
  private stats: DashboardStats = {
    totalServicios: 0,
    serviciosHoy: 0,
    serviciosPendientes: 0,
    serviciosConfirmados: 0,
    serviciosEntregados: 0,
    serviciosDevueltos: 0,
    serviciosCancelados: 0,
    devolucionesTardias: 0,
    ultimaActualizacion: new Date(),
  };

  getNombre(): string {
    return 'DashboardObserver';
  }

  getEventosSuscritos(): ServicioEventType[] {
    // Suscrito a todos los eventos para mantener estadísticas
    return [];
  }

  async update(event: ServicioEvent): Promise<void> {
    const { tipo, servicio } = event;

    this.logger.log(
      `📊 Actualizando dashboard - Evento: ${tipo} - Servicio #${servicio.numero}`,
    );

    this.actualizarEstadisticas(event);

    // TODO: Emitir actualización a WebSocket para dashboard en tiempo real
    await this.notificarDashboard();

    this.logger.debug(`Dashboard actualizado:`, this.stats);
  }

  /**
   * Actualiza las estadísticas según el evento
   */
  private actualizarEstadisticas(event: ServicioEvent): void {
    const { tipo, servicio } = event;
    const hoy = new Date().toDateString();
    const fechaEvento = event.timestamp.toDateString();

    switch (tipo) {
      case ServicioEventType.SERVICIO_CREADO:
        this.stats.totalServicios++;
        this.stats.serviciosPendientes++;
        if (fechaEvento === hoy) {
          this.stats.serviciosHoy++;
        }
        break;

      case ServicioEventType.SERVICIO_CONFIRMADO:
        this.stats.serviciosPendientes--;
        this.stats.serviciosConfirmados++;
        break;

      case ServicioEventType.SERVICIO_ENTREGADO:
        this.stats.serviciosConfirmados--;
        this.stats.serviciosEntregados++;
        break;

      case ServicioEventType.SERVICIO_DEVUELTO:
        this.stats.serviciosEntregados--;
        this.stats.serviciosDevueltos++;
        break;

      case ServicioEventType.SERVICIO_CANCELADO:
        // Decrementar del estado anterior
        if (servicio.estado === 'cancelado') {
          // Asumimos que venía de pendiente o confirmado
          if (this.stats.serviciosPendientes > 0) {
            this.stats.serviciosPendientes--;
          } else if (this.stats.serviciosConfirmados > 0) {
            this.stats.serviciosConfirmados--;
          }
        }
        this.stats.serviciosCancelados++;
        break;

      case ServicioEventType.DEVOLUCION_TARDIA:
        this.stats.devolucionesTardias++;
        break;
    }

    this.stats.ultimaActualizacion = new Date();
  }

  /**
   * Notifica al dashboard de la actualización
   * En producción, usar WebSocket o Server-Sent Events
   */
  private async notificarDashboard(): Promise<void> {
    // TODO: Implementar WebSocket para actualización en tiempo real
    // Por ahora solo simula la notificación
    return new Promise((resolve) => setTimeout(resolve, 10));
  }

  /**
   * Obtiene las estadísticas actuales
   */
  getStats(): DashboardStats {
    return { ...this.stats };
  }

  /**
   * Reinicia las estadísticas (solo para testing)
   */
  resetStats(): void {
    this.stats = {
      totalServicios: 0,
      serviciosHoy: 0,
      serviciosPendientes: 0,
      serviciosConfirmados: 0,
      serviciosEntregados: 0,
      serviciosDevueltos: 0,
      serviciosCancelados: 0,
      devolucionesTardias: 0,
      ultimaActualizacion: new Date(),
    };
  }
}