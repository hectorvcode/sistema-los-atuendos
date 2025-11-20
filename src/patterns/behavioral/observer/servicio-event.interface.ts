import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Tipos de eventos del sistema
 * Define todos los eventos que pueden ocurrir en el ciclo de vida de un servicio
 */
export enum ServicioEventType {
  SERVICIO_CREADO = 'servicio.creado',
  SERVICIO_CONFIRMADO = 'servicio.confirmado',
  SERVICIO_ENTREGADO = 'servicio.entregado',
  SERVICIO_DEVUELTO = 'servicio.devuelto',
  SERVICIO_CANCELADO = 'servicio.cancelado',
  DEVOLUCION_TARDIA = 'servicio.devolucion_tardia',
  SERVICIO_MODIFICADO = 'servicio.modificado',
}

/**
 * Información del evento
 * Contiene los datos del evento que se notifica a los observadores
 */
export interface ServicioEvent {
  tipo: ServicioEventType;
  servicio: ServicioAlquiler;
  timestamp: Date;
  metadata?: Record<string, any>;
}