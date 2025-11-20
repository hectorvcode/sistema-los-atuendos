import { Injectable, Logger, Optional } from '@nestjs/common';
import { IServicioObserver } from './servicio-observer.interface';
import { ServicioEvent, ServicioEventType } from './servicio-event.interface';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import { EmailNotificationObserver } from './observers/email-notification.observer';
import { SmsNotificationObserver } from './observers/sms-notification.observer';
import { AuditLogObserver } from './observers/audit-log.observer';
import { DashboardObserver } from './observers/dashboard.observer';
import { ReportGeneratorObserver } from './observers/report-generator.observer';

/**
 * Subject (Observable) del patrón Observer
 * Gestiona la lista de observadores y notifica eventos
 */
@Injectable()
export class ServicioSubject {
  private readonly logger = new Logger(ServicioSubject.name);
  private observers: IServicioObserver[] = [];

  constructor(
    @Optional() private readonly emailObserver?: EmailNotificationObserver,
    @Optional() private readonly smsObserver?: SmsNotificationObserver,
    @Optional() private readonly auditObserver?: AuditLogObserver,
    @Optional() private readonly dashboardObserver?: DashboardObserver,
    @Optional() private readonly reportObserver?: ReportGeneratorObserver,
  ) {
    // Registrar automáticamente todos los observadores inyectados
    if (this.emailObserver) this.attach(this.emailObserver);
    if (this.smsObserver) this.attach(this.smsObserver);
    if (this.auditObserver) this.attach(this.auditObserver);
    if (this.dashboardObserver) this.attach(this.dashboardObserver);
    if (this.reportObserver) this.attach(this.reportObserver);

    this.logger.log(
      `ServicioSubject inicializado con ${this.observers.length} observador(es)`,
    );
  }

  /**
   * Registra un observador
   * @param observer - Observador a registrar
   */
  attach(observer: IServicioObserver): void {
    const existe = this.observers.some(
      (o) => o.getNombre() === observer.getNombre(),
    );

    if (!existe) {
      this.observers.push(observer);
      this.logger.log(
        `Observador registrado: ${observer.getNombre()} - Eventos: [${observer.getEventosSuscritos().join(', ')}]`,
      );
    }
  }

  /**
   * Desregistra un observador
   * @param observer - Observador a desregistrar
   */
  detach(observer: IServicioObserver): void {
    const index = this.observers.findIndex(
      (o) => o.getNombre() === observer.getNombre(),
    );

    if (index !== -1) {
      this.observers.splice(index, 1);
      this.logger.log(`Observador desregistrado: ${observer.getNombre()}`);
    }
  }

  /**
   * Notifica un evento a todos los observadores suscritos
   * @param tipo - Tipo de evento
   * @param servicio - Servicio relacionado al evento
   * @param metadata - Información adicional del evento
   */
  async notify(
    tipo: ServicioEventType,
    servicio: ServicioAlquiler,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const event: ServicioEvent = {
      tipo,
      servicio,
      timestamp: new Date(),
      metadata,
    };

    this.logger.log(
      `📢 Notificando evento: ${tipo} - Servicio #${servicio.numero}`,
    );

    // Filtrar observadores que están suscritos a este tipo de evento
    const observadoresSuscritos = this.observers.filter((observer) => {
      const eventosSuscritos = observer.getEventosSuscritos();
      // Si no especifica eventos, está suscrito a todos
      return eventosSuscritos.length === 0 || eventosSuscritos.includes(tipo);
    });

    this.logger.debug(
      `Notificando a ${observadoresSuscritos.length} observador(es)`,
    );

    // Notificar a todos los observadores de forma asíncrona
    const promesas = observadoresSuscritos.map(async (observer) => {
      try {
        await observer.update(event);
        this.logger.debug(
          `✓ ${observer.getNombre()} procesó el evento ${tipo}`,
        );
      } catch (error) {
        this.logger.error(
          `✗ Error en ${observer.getNombre()} procesando ${tipo}: ${error.message}`,
          error.stack,
        );
        // No propagar el error para que otros observadores se ejecuten
      }
    });

    // Esperar a que todos los observadores terminen
    await Promise.all(promesas);
  }

  /**
   * Obtiene la lista de observadores registrados
   */
  getObservers(): IServicioObserver[] {
    return [...this.observers];
  }

  /**
   * Obtiene el número de observadores registrados
   */
  getObserverCount(): number {
    return this.observers.length;
  }

  /**
   * Limpia todos los observadores (útil para testing)
   */
  clearObservers(): void {
    this.observers = [];
    this.logger.log('Todos los observadores han sido eliminados');
  }
}