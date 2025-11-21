/**
 * Interfaz base para el patrón Command
 *
 * Define el contrato que todos los comandos concretos deben implementar.
 * El patrón Command encapsula una solicitud como un objeto, permitiendo
 * parametrizar clientes con diferentes solicitudes, encolar o registrar
 * solicitudes, y soportar operaciones que se pueden deshacer.
 */
export interface ICommand {
  /**
   * Ejecuta la acción del comando
   * @returns Promise<any> - Resultado de la ejecución
   */
  execute(): Promise<any>;

  /**
   * Deshace la acción del comando (si es posible)
   * @returns Promise<void>
   */
  undo(): Promise<void>;

  /**
   * Obtiene el nombre del comando para auditoría
   */
  getName(): string;

  /**
   * Obtiene los parámetros del comando para logging
   */
  getParams(): Record<string, any>;
}

/**
 * Metadata de ejecución de un comando
 */
export interface CommandExecutionMetadata {
  commandName: string;
  params: Record<string, any>;
  executedAt: Date;
  executedBy?: string;
  result?: any;
  error?: Error;
}