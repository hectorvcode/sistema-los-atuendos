/**
 * Patrón State - Índice de exportaciones
 *
 * El patrón State permite que un objeto altere su comportamiento
 * cuando su estado interno cambia. El objeto parecerá cambiar de clase.
 */

// Interfaces y clases abstractas
export * from './servicio-state.interface';
export * from './abstract-servicio-state';

// Estados concretos
export * from './states/pending-state';
export * from './states/confirmed-state';
export * from './states/delivered-state';
export * from './states/returned-state';
export * from './states/cancelled-state';

// Context
export * from './servicio-state-context';
