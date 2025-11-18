import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Interfaz para el patrón State - Define el comportamiento común de todos los estados
 *
 * Cada estado concreto implementa esta interfaz y define:
 * - Las transiciones permitidas desde ese estado
 * - La validación de negocio específica del estado
 * - Las acciones que se pueden ejecutar en ese estado
 */
export interface IServicioState {
  /**
   * Nombre del estado
   */
  readonly nombre: string;

  /**
   * Transición a estado confirmado
   * @throws BadRequestException si la transición no es válida
   */
  confirmar(servicio: ServicioAlquiler): Promise<void>;

  /**
   * Transición a estado entregado
   * @throws BadRequestException si la transición no es válida
   */
  entregar(servicio: ServicioAlquiler): Promise<void>;

  /**
   * Transición a estado devuelto
   * @throws BadRequestException si la transición no es válida
   */
  devolver(servicio: ServicioAlquiler): Promise<void>;

  /**
   * Transición a estado cancelado
   * @throws BadRequestException si la transición no es válida
   */
  cancelar(servicio: ServicioAlquiler): Promise<void>;

  /**
   * Valida si se puede modificar el servicio en este estado
   */
  puedeModificar(): boolean;

  /**
   * Valida si se puede eliminar el servicio en este estado
   */
  puedeEliminar(): boolean;

  /**
   * Obtiene los estados permitidos desde el estado actual
   */
  obtenerTransicionesPermitidas(): string[];

  /**
   * Hook que se ejecuta al entrar en este estado
   */
  onEnter?(servicio: ServicioAlquiler): Promise<void>;

  /**
   * Hook que se ejecuta al salir de este estado
   */
  onExit?(servicio: ServicioAlquiler): Promise<void>;
}
