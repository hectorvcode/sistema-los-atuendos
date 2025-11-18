import { Injectable, BadRequestException } from '@nestjs/common';
import { IServicioState } from './servicio-state.interface';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import { PendingState } from './states/pending-state';
import { ConfirmedState } from './states/confirmed-state';
import { DeliveredState } from './states/delivered-state';
import { ReturnedState } from './states/returned-state';
import { CancelledState } from './states/cancelled-state';

/**
 * StateContext - Gestor de estados del patrón State
 *
 * Responsabilidades:
 * - Mantener referencia al estado actual del servicio
 * - Delegar operaciones al estado correspondiente
 * - Gestionar transiciones entre estados
 * - Proporcionar interfaz simplificada para operaciones de estado
 *
 * Patrón de Diseño: State Pattern
 */
@Injectable()
export class ServicioStateContext {
  private estados: Map<string, IServicioState>;

  constructor(
    private readonly pendingState: PendingState,
    private readonly confirmedState: ConfirmedState,
    private readonly deliveredState: DeliveredState,
    private readonly returnedState: ReturnedState,
    private readonly cancelledState: CancelledState,
  ) {
    // Inicializar mapa de estados
    this.estados = new Map<string, IServicioState>([
      ['pendiente', this.pendingState],
      ['confirmado', this.confirmedState],
      ['entregado', this.deliveredState],
      ['devuelto', this.returnedState],
      ['cancelado', this.cancelledState],
    ]);
  }

  /**
   * Obtiene el estado actual del servicio
   */
  private getEstadoActual(servicio: ServicioAlquiler): IServicioState {
    const estado = this.estados.get(servicio.estado);

    if (!estado) {
      throw new BadRequestException(`Estado inválido: ${servicio.estado}`);
    }

    return estado;
  }

  /**
   * Confirma el servicio (pendiente → confirmado)
   */
  async confirmar(servicio: ServicioAlquiler): Promise<void> {
    const estadoActual = this.getEstadoActual(servicio);
    await estadoActual.confirmar(servicio);

    // Ejecutar hook de entrada del nuevo estado
    const nuevoEstado = this.getEstadoActual(servicio);
    if (nuevoEstado.onEnter) {
      await nuevoEstado.onEnter(servicio);
    }
  }

  /**
   * Entrega el servicio al cliente (confirmado → entregado)
   */
  async entregar(servicio: ServicioAlquiler): Promise<void> {
    const estadoActual = this.getEstadoActual(servicio);
    await estadoActual.entregar(servicio);

    // Ejecutar hook de entrada del nuevo estado
    const nuevoEstado = this.getEstadoActual(servicio);
    if (nuevoEstado.onEnter) {
      await nuevoEstado.onEnter(servicio);
    }
  }

  /**
   * Registra la devolución del servicio (entregado → devuelto)
   */
  async devolver(servicio: ServicioAlquiler): Promise<void> {
    const estadoActual = this.getEstadoActual(servicio);
    await estadoActual.devolver(servicio);

    // Ejecutar hook de entrada del nuevo estado
    const nuevoEstado = this.getEstadoActual(servicio);
    if (nuevoEstado.onEnter) {
      await nuevoEstado.onEnter(servicio);
    }
  }

  /**
   * Cancela el servicio (pendiente/confirmado → cancelado)
   */
  async cancelar(servicio: ServicioAlquiler): Promise<void> {
    const estadoActual = this.getEstadoActual(servicio);
    await estadoActual.cancelar(servicio);

    // Ejecutar hook de entrada del nuevo estado
    const nuevoEstado = this.getEstadoActual(servicio);
    if (nuevoEstado.onEnter) {
      await nuevoEstado.onEnter(servicio);
    }
  }

  /**
   * Verifica si el servicio puede ser modificado en su estado actual
   */
  puedeModificar(servicio: ServicioAlquiler): boolean {
    const estadoActual = this.getEstadoActual(servicio);
    return estadoActual.puedeModificar();
  }

  /**
   * Verifica si el servicio puede ser eliminado en su estado actual
   */
  puedeEliminar(servicio: ServicioAlquiler): boolean {
    const estadoActual = this.getEstadoActual(servicio);
    return estadoActual.puedeEliminar();
  }

  /**
   * Obtiene las transiciones permitidas desde el estado actual
   */
  obtenerTransicionesPermitidas(servicio: ServicioAlquiler): string[] {
    const estadoActual = this.getEstadoActual(servicio);
    return estadoActual.obtenerTransicionesPermitidas();
  }

  /**
   * Obtiene información completa del estado actual
   */
  obtenerInformacionEstado(servicio: ServicioAlquiler) {
    const estadoActual = this.getEstadoActual(servicio);
    return {
      estadoActual: estadoActual.nombre,
      puedeModificar: estadoActual.puedeModificar(),
      puedeEliminar: estadoActual.puedeEliminar(),
      transicionesPermitidas: estadoActual.obtenerTransicionesPermitidas(),
    };
  }

  /**
   * Valida una transición antes de ejecutarla
   * Útil para validaciones en la UI o APIs
   */
  validarTransicion(
    servicio: ServicioAlquiler,
    estadoDestino: string,
  ): boolean {
    const transicionesPermitidas = this.obtenerTransicionesPermitidas(servicio);
    return transicionesPermitidas.includes(estadoDestino);
  }

  /**
   * Ejecuta el hook onEnter para el estado actual
   * Útil cuando se carga un servicio existente
   */
  async ejecutarHookEntrada(servicio: ServicioAlquiler): Promise<void> {
    const estadoActual = this.getEstadoActual(servicio);
    if (estadoActual.onEnter) {
      await estadoActual.onEnter(servicio);
    }
  }
}
