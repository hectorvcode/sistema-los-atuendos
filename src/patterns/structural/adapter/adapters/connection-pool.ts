// src/patterns/structural/adapter/adapters/connection-pool.ts

import { Connection } from './connection';
import { ConfiguracionConexion } from '../interfaces/persistencia.interface';

/**
 * Clase ConnectionPool - Gestiona un pool de conexiones reutilizables
 */
export class ConnectionPool {
  private conexionesDisponibles: Connection[] = [];
  private conexionesActivas: Connection[] = [];
  private configuracion: ConfiguracionConexion;
  private tamanoMinimo: number;
  private tamanoMaximo: number;

  constructor(configuracion: ConfiguracionConexion) {
    this.configuracion = configuracion;
    this.tamanoMinimo = configuracion.configuracionPool?.min || 2;
    this.tamanoMaximo = configuracion.configuracionPool?.max || 10;
  }

  async inicializar(): Promise<void> {
    // Crear conexiones mínimas
    for (let i = 0; i < this.tamanoMinimo; i++) {
      const conexion = new Connection(this.configuracion);
      await conexion.abrir();
      this.conexionesDisponibles.push(conexion);
    }
    console.log(
      `✅ Pool inicializado con ${this.tamanoMinimo} conexiones`,
    );
  }

  async obtenerConexion(): Promise<Connection> {
    // Si hay conexiones disponibles, reutilizar una
    if (this.conexionesDisponibles.length > 0) {
      const conexion = this.conexionesDisponibles.pop()!;
      this.conexionesActivas.push(conexion);
      return conexion;
    }

    // Si no hay disponibles pero no hemos llegado al máximo, crear nueva
    if (
      this.conexionesActivas.length + this.conexionesDisponibles.length <
      this.tamanoMaximo
    ) {
      const conexion = new Connection(this.configuracion);
      await conexion.abrir();
      this.conexionesActivas.push(conexion);
      return conexion;
    }

    // Si ya estamos en el máximo, esperar a que se libere una
    throw new Error(
      'No hay conexiones disponibles. Pool al máximo de capacidad.',
    );
  }

  liberarConexion(conexion: Connection): void {
    const index = this.conexionesActivas.indexOf(conexion);
    if (index !== -1) {
      this.conexionesActivas.splice(index, 1);
      this.conexionesDisponibles.push(conexion);
    }
  }

  async cerrarTodas(): Promise<void> {
    const todasLasConexiones = [
      ...this.conexionesDisponibles,
      ...this.conexionesActivas,
    ];

    for (const conexion of todasLasConexiones) {
      await conexion.cerrar();
    }

    this.conexionesDisponibles = [];
    this.conexionesActivas = [];

    console.log('✅ Todas las conexiones del pool cerradas');
  }

  getEstadisticas() {
    return {
      disponibles: this.conexionesDisponibles.length,
      activas: this.conexionesActivas.length,
      total:
        this.conexionesDisponibles.length + this.conexionesActivas.length,
      minimo: this.tamanoMinimo,
      maximo: this.tamanoMaximo,
    };
  }

  async limpiarConexionesInactivas(tiempoMaximoInactividad: number): Promise<number> {
    let eliminadas = 0;
    const ahora = Date.now();

    this.conexionesDisponibles = this.conexionesDisponibles.filter(
      (conexion) => {
        const estadisticas = conexion.getEstadisticas();
        if (estadisticas.tiempoInactivo > tiempoMaximoInactividad) {
          void conexion.cerrar();
          eliminadas++;
          return false;
        }
        return true;
      },
    );

    // Mantener al menos el mínimo de conexiones
    while (this.conexionesDisponibles.length < this.tamanoMinimo) {
      const conexion = new Connection(this.configuracion);
      await conexion.abrir();
      this.conexionesDisponibles.push(conexion);
    }

    return eliminadas;
  }
}
