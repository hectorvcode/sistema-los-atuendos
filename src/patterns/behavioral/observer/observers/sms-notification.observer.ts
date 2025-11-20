import { Injectable, Logger } from '@nestjs/common';
import { IServicioObserver } from '../servicio-observer.interface';
import { ServicioEvent, ServicioEventType } from '../servicio-event.interface';

/**
 * Observador para envío de notificaciones por SMS
 * Solo se suscribe a eventos críticos que requieren notificación inmediata
 */
@Injectable()
export class SmsNotificationObserver implements IServicioObserver {
  private readonly logger = new Logger(SmsNotificationObserver.name);

  getNombre(): string {
    return 'SmsNotificationObserver';
  }

  getEventosSuscritos(): ServicioEventType[] {
    // Solo eventos críticos que requieren SMS
    return [
      ServicioEventType.SERVICIO_CONFIRMADO,
      ServicioEventType.SERVICIO_ENTREGADO,
      ServicioEventType.DEVOLUCION_TARDIA,
    ];
  }

  async update(event: ServicioEvent): Promise<void> {
    const { tipo, servicio } = event;

    this.logger.log(
      `📱 Preparando SMS para servicio #${servicio.numero} - Evento: ${tipo}`,
    );

    const smsData = this.prepararSMS(event);

    // TODO: Integrar con servicio de SMS real (Twilio, AWS SNS, etc.)
    this.logger.debug(`SMS preparado:`, smsData);

    await this.simularEnvioSMS(smsData);

    this.logger.log(`✓ SMS enviado exitosamente para evento ${tipo}`);
  }

  /**
   * Prepara el contenido del SMS según el tipo de evento
   */
  private prepararSMS(event: ServicioEvent): {
    to: string;
    message: string;
  } {
    const { tipo, servicio } = event;
    const clientePhone = servicio.cliente?.telefono || '+57300000000';

    switch (tipo) {
      case ServicioEventType.SERVICIO_CONFIRMADO:
        return {
          to: clientePhone,
          message: `Los Atuendos: Su servicio #${servicio.numero} ha sido confirmado. Recoja sus prendas el ${servicio.fechaAlquiler}`,
        };

      case ServicioEventType.SERVICIO_ENTREGADO:
        return {
          to: clientePhone,
          message: `Los Atuendos: Prendas del servicio #${servicio.numero} entregadas. Recuerde devolverlas a tiempo.`,
        };

      case ServicioEventType.DEVOLUCION_TARDIA:
        const diasRetraso = event.metadata?.diasRetraso || 0;
        return {
          to: clientePhone,
          message: `Los Atuendos: URGENTE - Servicio #${servicio.numero} tiene ${diasRetraso} día(s) de retraso. Devuelva las prendas hoy.`,
        };

      default:
        return {
          to: clientePhone,
          message: `Los Atuendos: Actualización en su servicio #${servicio.numero}`,
        };
    }
  }

  /**
   * Simula el envío de SMS (reemplazar con servicio real)
   */
  private async simularEnvioSMS(smsData: {
    to: string;
    message: string;
  }): Promise<void> {
    // Simular delay de envío
    return new Promise((resolve) => setTimeout(resolve, 80));
  }
}