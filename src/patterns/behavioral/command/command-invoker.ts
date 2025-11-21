import { Injectable, Logger } from '@nestjs/common';
import { ICommand } from './command.interface';
import { CommandHistory } from './command-history';

/**
 * CommandInvoker - Invocador de comandos del patrón Command
 *
 * Responsabilidades:
 * - Ejecutar comandos de forma centralizada
 * - Gestionar el historial de comandos
 * - Proporcionar interfaz para deshacer/rehacer
 * - Registrar logs de ejecución
 * - Manejar errores de ejecución
 *
 * Patrón de Diseño: Command Pattern - Invoker
 *
 * Ventajas:
 * - Desacoplamiento entre emisor y receptor
 * - Facilita auditoría y logging
 * - Soporta transacciones (undo/redo)
 * - Permite encolar y programar comandos
 */
@Injectable()
export class CommandInvoker {
  private readonly logger = new Logger(CommandInvoker.name);

  constructor(private readonly history: CommandHistory) {}

  /**
   * Ejecuta un comando y lo registra en el historial
   * @param command - Comando a ejecutar
   * @returns Promise<any> - Resultado de la ejecución
   */
  async execute(command: ICommand): Promise<any> {
    const commandName = command.getName();
    const params = command.getParams();

    this.logger.log(
      `Ejecutando comando: ${commandName} con parámetros: ${JSON.stringify(params)}`,
    );

    try {
      // Ejecutar el comando
      const result = await command.execute();

      // Registrar en el historial
      this.history.push(command, result);

      this.logger.log(`Comando ${commandName} ejecutado exitosamente`);

      return result;
    } catch (error) {
      this.logger.error(
        `Error ejecutando comando ${commandName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Ejecuta múltiples comandos en secuencia
   * @param commands - Array de comandos a ejecutar
   * @returns Promise<any[]> - Resultados de las ejecuciones
   */
  async executeAll(commands: ICommand[]): Promise<any[]> {
    const results: any[] = [];

    for (const command of commands) {
      const result = await this.execute(command);
      results.push(result);
    }

    return results;
  }

  /**
   * Deshace el último comando ejecutado
   * @returns Promise<void>
   */
  async undo(): Promise<void> {
    this.logger.log('Deshaciendo último comando');

    try {
      await this.history.undo();
      this.logger.log('Comando deshecho exitosamente');
    } catch (error) {
      this.logger.error(`Error deshaciendo comando: ${error.message}`);
      throw error;
    }
  }

  /**
   * Rehace el último comando deshecho
   * @returns Promise<void>
   */
  async redo(): Promise<void> {
    this.logger.log('Rehaciendo último comando');

    try {
      await this.history.redo();
      this.logger.log('Comando rehecho exitosamente');
    } catch (error) {
      this.logger.error(`Error rehaciendo comando: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene el historial de comandos ejecutados
   */
  getHistory() {
    return this.history.getHistory();
  }

  /**
   * Obtiene los comandos disponibles para rehacer
   */
  getRedoStack() {
    return this.history.getRedoStack();
  }

  /**
   * Limpia el historial de comandos
   */
  clearHistory(): void {
    this.history.clear();
    this.logger.log('Historial de comandos limpiado');
  }

  /**
   * Verifica si se puede deshacer
   */
  canUndo(): boolean {
    return this.history.canUndo();
  }

  /**
   * Verifica si se puede rehacer
   */
  canRedo(): boolean {
    return this.history.canRedo();
  }

  /**
   * Obtiene el tamaño del historial
   */
  getHistorySize(): number {
    return this.history.size();
  }
}