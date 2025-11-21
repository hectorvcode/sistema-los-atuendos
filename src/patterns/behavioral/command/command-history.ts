import { Injectable } from '@nestjs/common';
import { ICommand, CommandExecutionMetadata } from './command.interface';

/**
 * CommandHistory - Gestor de historial de comandos
 *
 * Responsabilidades:
 * - Mantener un registro de todos los comandos ejecutados
 * - Proporcionar funcionalidad de deshacer (undo)
 * - Proporcionar funcionalidad de rehacer (redo)
 * - Mantener metadata de ejecución para auditoría
 * - Limitar el tamaño del historial para evitar consumo excesivo de memoria
 *
 * Patrón de Diseño: Command Pattern - Componente de historial
 */
@Injectable()
export class CommandHistory {
  private history: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private executionMetadata: Map<ICommand, CommandExecutionMetadata> =
    new Map();
  private readonly maxHistorySize: number = 50; // Máximo de comandos en historial

  /**
   * Registra un comando ejecutado en el historial
   * @param command - Comando ejecutado
   * @param result - Resultado de la ejecución
   */
  push(command: ICommand, result?: any): void {
    // Agregar al historial
    this.history.push(command);

    // Limpiar el stack de redo cuando se ejecuta un nuevo comando
    this.redoStack = [];

    // Registrar metadata de ejecución
    const metadata: CommandExecutionMetadata = {
      commandName: command.getName(),
      params: command.getParams(),
      executedAt: new Date(),
      result,
    };
    this.executionMetadata.set(command, metadata);

    // Limitar tamaño del historial
    if (this.history.length > this.maxHistorySize) {
      const removedCommand = this.history.shift();
      if (removedCommand) {
        this.executionMetadata.delete(removedCommand);
      }
    }
  }

  /**
   * Deshace el último comando ejecutado
   * @returns Promise<void>
   * @throws Error si no hay comandos para deshacer
   */
  async undo(): Promise<void> {
    if (this.history.length === 0) {
      throw new Error('No hay comandos para deshacer');
    }

    const command = this.history.pop();
    if (!command) {
      throw new Error('Error al obtener comando del historial');
    }

    try {
      await command.undo();
      this.redoStack.push(command);

      // Actualizar metadata
      const metadata = this.executionMetadata.get(command);
      if (metadata) {
        this.executionMetadata.set(command, {
          ...metadata,
          executedAt: new Date(),
        });
      }
    } catch (error) {
      // Si falla el undo, devolver el comando al historial
      this.history.push(command);

      // Registrar error en metadata
      const metadata = this.executionMetadata.get(command);
      if (metadata) {
        metadata.error = error as Error;
      }

      throw error;
    }
  }

  /**
   * Rehace el último comando deshecho
   * @returns Promise<void>
   * @throws Error si no hay comandos para rehacer
   */
  async redo(): Promise<void> {
    if (this.redoStack.length === 0) {
      throw new Error('No hay comandos para rehacer');
    }

    const command = this.redoStack.pop();
    if (!command) {
      throw new Error('Error al obtener comando del stack de redo');
    }

    try {
      const result = await command.execute();
      this.history.push(command);

      // Actualizar metadata
      const metadata = this.executionMetadata.get(command);
      if (metadata) {
        this.executionMetadata.set(command, {
          ...metadata,
          executedAt: new Date(),
          result,
        });
      }
    } catch (error) {
      // Si falla el redo, devolver el comando al stack de redo
      this.redoStack.push(command);

      // Registrar error en metadata
      const metadata = this.executionMetadata.get(command);
      if (metadata) {
        metadata.error = error as Error;
      }

      throw error;
    }
  }

  /**
   * Obtiene el historial de comandos ejecutados
   * @returns Array de metadata de ejecución
   */
  getHistory(): CommandExecutionMetadata[] {
    return this.history.map((command) => {
      const metadata = this.executionMetadata.get(command);
      return (
        metadata || {
          commandName: command.getName(),
          params: command.getParams(),
          executedAt: new Date(),
        }
      );
    });
  }

  /**
   * Obtiene el stack de comandos para rehacer
   * @returns Array de metadata de comandos para rehacer
   */
  getRedoStack(): CommandExecutionMetadata[] {
    return this.redoStack.map((command) => {
      const metadata = this.executionMetadata.get(command);
      return (
        metadata || {
          commandName: command.getName(),
          params: command.getParams(),
          executedAt: new Date(),
        }
      );
    });
  }

  /**
   * Limpia el historial de comandos
   */
  clear(): void {
    this.history = [];
    this.redoStack = [];
    this.executionMetadata.clear();
  }

  /**
   * Obtiene el número de comandos en el historial
   */
  size(): number {
    return this.history.length;
  }

  /**
   * Obtiene el número de comandos disponibles para rehacer
   */
  redoSize(): number {
    return this.redoStack.length;
  }

  /**
   * Verifica si hay comandos para deshacer
   */
  canUndo(): boolean {
    return this.history.length > 0;
  }

  /**
   * Verifica si hay comandos para rehacer
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}