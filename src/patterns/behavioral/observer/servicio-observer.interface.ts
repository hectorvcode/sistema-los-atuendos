import { ServicioEvent, ServicioEventType } from './servicio-event.interface';

/**
 * Interfaz para observadores del sistema
 * Define el contrato que todos los observadores deben implementar
 */
export interface IServicioObserver {
  /**
   * Método llamado cuando ocurre un evento
   * @param event - Evento que ha ocurrido
   */
  update(event: ServicioEvent): void | Promise<void>;

  /**
   * Nombre del observador (para logging y debugging)
   */
  getNombre(): string;

  /**
   * Tipos de eventos a los que está suscrito este observador
   * Si retorna vacío, se suscribe a todos los eventos
   */
  getEventosSuscritos(): ServicioEventType[];
}