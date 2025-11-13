// src/patterns/structural/adapter/adapters/connection.ts

import { ConfiguracionConexion } from '../interfaces/persistencia.interface';

/**
 * Clase Connection - Representa una conexión individual a la base de datos
 */
export class Connection {
  private id: string;
  private configuracion: ConfiguracionConexion;
  private activa: boolean = false;
  private ultimaActividad: Date;
  private consultas: number = 0;

  constructor(configuracion: ConfiguracionConexion) {
    this.id = this.generarIdConexion();
    this.configuracion = configuracion;
    this.ultimaActividad = new Date();
  }

  async abrir(): Promise<boolean> {
    try {
      // Simular apertura de conexión
      await this.simularLatencia();
      this.activa = true;
      this.ultimaActividad = new Date();
      return true;
    } catch (error) {
      console.error('Error abriendo conexión:', error);
      return false;
    }
  }

  async cerrar(): Promise<boolean> {
    try {
      // Simular cierre de conexión
      await this.simularLatencia();
      this.activa = false;
      return true;
    } catch (error) {
      console.error('Error cerrando conexión:', error);
      return false;
    }
  }

  async ejecutarConsulta(consulta: string): Promise<any> {
    if (!this.activa) {
      throw new Error('Conexión no activa');
    }

    this.consultas++;
    this.ultimaActividad = new Date();

    // Simular ejecución de consulta
    await this.simularLatencia();

    return { resultado: 'ok', consulta };
  }

  estaActiva(): boolean {
    return this.activa;
  }

  getId(): string {
    return this.id;
  }

  getConfiguracion(): ConfiguracionConexion {
    return this.configuracion;
  }

  getEstadisticas() {
    return {
      id: this.id,
      activa: this.activa,
      consultas: this.consultas,
      ultimaActividad: this.ultimaActividad,
      tiempoInactivo: Date.now() - this.ultimaActividad.getTime(),
    };
  }

  private generarIdConexion(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private async simularLatencia(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 10));
  }
}
