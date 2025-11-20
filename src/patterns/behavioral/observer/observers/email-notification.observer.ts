import { Injectable, Logger } from '@nestjs/common';
import { IServicioObserver } from '../servicio-observer.interface';
import { ServicioEvent, ServicioEventType } from '../servicio-event.interface';

/**
 * Observador para envío de notificaciones por email
 * Se suscribe a eventos importantes para notificar al cliente
 */
@Injectable()
export class EmailNotificationObserver implements IServicioObserver {
  private readonly logger = new Logger(EmailNotificationObserver.name);

  getNombre(): string {
    return 'EmailNotificationObserver';
  }

  getEventosSuscritos(): ServicioEventType[] {
    return [
      ServicioEventType.SERVICIO_CREADO,
      ServicioEventType.SERVICIO_CONFIRMADO,
      ServicioEventType.SERVICIO_ENTREGADO,
      ServicioEventType.SERVICIO_DEVUELTO,
      ServicioEventType.SERVICIO_CANCELADO,
      ServicioEventType.DEVOLUCION_TARDIA,
    ];
  }

  async update(event: ServicioEvent): Promise<void> {
    const { tipo, servicio } = event;

    this.logger.log(
      `📧 Preparando email para servicio #${servicio.numero} - Evento: ${tipo}`,
    );

    // Simular envío de email (en producción usar un servicio real como Nodemailer, SendGrid, etc.)
    const emailData = this.prepararEmail(event);

    // TODO: Integrar con servicio de email real
    this.logger.debug(`Email preparado:`, emailData);

    // Simular delay de envío
    await this.simularEnvioEmail(emailData);

    this.logger.log(`✓ Email enviado exitosamente para evento ${tipo}`);
  }

  /**
   * Prepara el contenido del email según el tipo de evento
   */
  private prepararEmail(event: ServicioEvent): {
    to: string;
    subject: string;
    body: string;
  } {
    const { tipo, servicio } = event;
    const clienteEmail = servicio.cliente?.correoElectronico || 'cliente@example.com';

    switch (tipo) {
      case ServicioEventType.SERVICIO_CREADO:
        return {
          to: clienteEmail,
          subject: `Servicio de Alquiler Creado - #${servicio.numero}`,
          body: `Estimado cliente,\n\nSu servicio de alquiler #${servicio.numero} ha sido creado exitosamente.\nFecha de alquiler: ${servicio.fechaAlquiler}\nValor total: $${servicio.valorTotal}\n\nGracias por su preferencia.\nLos Atuendos`,
        };

      case ServicioEventType.SERVICIO_CONFIRMADO:
        return {
          to: clienteEmail,
          subject: `Servicio Confirmado - #${servicio.numero}`,
          body: `Estimado cliente,\n\nSu servicio #${servicio.numero} ha sido confirmado.\nPodrá recoger las prendas el ${servicio.fechaAlquiler}.\n\nLos Atuendos`,
        };

      case ServicioEventType.SERVICIO_ENTREGADO:
        return {
          to: clienteEmail,
          subject: `Prendas Entregadas - #${servicio.numero}`,
          body: `Estimado cliente,\n\nLas prendas del servicio #${servicio.numero} han sido entregadas.\nRecuerde devolverlas en las fechas acordadas.\n\nLos Atuendos`,
        };

      case ServicioEventType.SERVICIO_DEVUELTO:
        return {
          to: clienteEmail,
          subject: `Servicio Completado - #${servicio.numero}`,
          body: `Estimado cliente,\n\nGracias por devolver las prendas del servicio #${servicio.numero}.\nEsperamos verle pronto.\n\nLos Atuendos`,
        };

      case ServicioEventType.SERVICIO_CANCELADO:
        return {
          to: clienteEmail,
          subject: `Servicio Cancelado - #${servicio.numero}`,
          body: `Estimado cliente,\n\nSu servicio #${servicio.numero} ha sido cancelado.\nSi tiene alguna duda, contáctenos.\n\nLos Atuendos`,
        };

      case ServicioEventType.DEVOLUCION_TARDIA:
        const diasRetraso = event.metadata?.diasRetraso || 0;
        return {
          to: clienteEmail,
          subject: `Recordatorio de Devolución - #${servicio.numero}`,
          body: `Estimado cliente,\n\nLas prendas del servicio #${servicio.numero} tienen ${diasRetraso} día(s) de retraso.\nPor favor, devuélvalas a la brevedad para evitar cargos adicionales.\n\nLos Atuendos`,
        };

      default:
        return {
          to: clienteEmail,
          subject: `Notificación del Servicio #${servicio.numero}`,
          body: `Ha ocurrido una actualización en su servicio #${servicio.numero}.`,
        };
    }
  }

  /**
   * Simula el envío de email (reemplazar con servicio real)
   */
  private async simularEnvioEmail(emailData: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    // Simular delay de red
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
}