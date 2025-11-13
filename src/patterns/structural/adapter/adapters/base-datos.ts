// src/patterns/structural/adapter/adapters/base-datos.ts

import { ConfiguracionConexion } from '../interfaces/persistencia.interface';

/**
 * Clase BaseDatos - Simula una base de datos relacional existente
 * Esta es la clase "Adaptee" en el patrón Adapter
 * Tiene una interfaz incompatible con lo que necesita nuestro dominio
 */
export class BaseDatos {
  private conexiones: Map<string, any> = new Map();
  private almacenamiento: Map<string, Map<string, any>> = new Map();
  private transacciones: Map<string, any[]> = new Map();
  private configuracion: ConfiguracionConexion | null = null;
  private conectado = false;

  constructor() {
    // Inicializar tablas simuladas
    this.almacenamiento.set('prendas', new Map());
    this.almacenamiento.set('clientes', new Map());
    this.almacenamiento.set('empleados', new Map());
  }

  // Métodos con interfaz incompatible (API antigua de BD)
  abrirConexion(config: ConfiguracionConexion): boolean {
    try {
      this.configuracion = config;
      this.conectado = true;
      console.log(`✅ Conexión abierta a ${config.tipo}://${config.servidor}:${config.puerto}/${config.baseDatos}`);
      return true;
    } catch (error) {
      console.error('❌ Error abriendo conexión:', error);
      return false;
    }
  }

  cerrarConexion(): boolean {
    try {
      this.conectado = false;
      this.conexiones.clear();
      console.log('✅ Conexión cerrada');
      return true;
    } catch (error) {
      console.error('❌ Error cerrando conexión:', error);
      return false;
    }
  }

  estaConectado(): boolean {
    return this.conectado;
  }

  // Operaciones CRUD con nombres diferentes
  insertarRegistro(tabla: string, datos: any): boolean {
    try {
      const tablaDatos = this.almacenamiento.get(tabla);
      if (!tablaDatos) {
        throw new Error(`Tabla ${tabla} no existe`);
      }

      const id = datos.referencia || datos.id || this.generarId();
      tablaDatos.set(id, { ...datos, id });
      return true;
    } catch (error) {
      console.error('❌ Error insertando registro:', error);
      return false;
    }
  }

  seleccionarPorId(tabla: string, id: string): any | null {
    try {
      const tablaDatos = this.almacenamiento.get(tabla);
      if (!tablaDatos) {
        return null;
      }
      return tablaDatos.get(id) || null;
    } catch (error) {
      console.error('❌ Error seleccionando por ID:', error);
      return null;
    }
  }

  seleccionarTodos(tabla: string): any[] {
    try {
      const tablaDatos = this.almacenamiento.get(tabla);
      if (!tablaDatos) {
        return [];
      }
      return Array.from(tablaDatos.values());
    } catch (error) {
      console.error('❌ Error seleccionando todos:', error);
      return [];
    }
  }

  seleccionarPorCampo(tabla: string, campo: string, valor: any): any[] {
    try {
      const tablaDatos = this.almacenamiento.get(tabla);
      if (!tablaDatos) {
        return [];
      }
      return Array.from(tablaDatos.values()).filter(
        (registro) => registro[campo] === valor,
      );
    } catch (error) {
      console.error('❌ Error seleccionando por campo:', error);
      return [];
    }
  }

  actualizarRegistro(tabla: string, id: string, datos: any): boolean {
    try {
      const tablaDatos = this.almacenamiento.get(tabla);
      if (!tablaDatos) {
        return false;
      }

      const registroExistente = tablaDatos.get(id);
      if (!registroExistente) {
        return false;
      }

      tablaDatos.set(id, { ...registroExistente, ...datos });
      return true;
    } catch (error) {
      console.error('❌ Error actualizando registro:', error);
      return false;
    }
  }

  eliminarRegistro(tabla: string, id: string): boolean {
    try {
      const tablaDatos = this.almacenamiento.get(tabla);
      if (!tablaDatos) {
        return false;
      }
      return tablaDatos.delete(id);
    } catch (error) {
      console.error('❌ Error eliminando registro:', error);
      return false;
    }
  }

  // Transacciones
  comenzarTransaccion(): string {
    const transaccionId = this.generarId();
    this.transacciones.set(transaccionId, []);
    return transaccionId;
  }

  commitTransaccion(transaccionId: string): boolean {
    try {
      if (!this.transacciones.has(transaccionId)) {
        return false;
      }
      // En una BD real, aquí se aplicarían los cambios
      this.transacciones.delete(transaccionId);
      return true;
    } catch (error) {
      console.error('❌ Error en commit:', error);
      return false;
    }
  }

  rollbackTransaccion(transaccionId: string): boolean {
    try {
      if (!this.transacciones.has(transaccionId)) {
        return false;
      }
      // En una BD real, aquí se revertirían los cambios
      this.transacciones.delete(transaccionId);
      return true;
    } catch (error) {
      console.error('❌ Error en rollback:', error);
      return false;
    }
  }

  // Métodos auxiliares
  private generarId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  obtenerEstadisticas(): any {
    return {
      conectado: this.conectado,
      totalTablas: this.almacenamiento.size,
      conexionesActivas: this.conexiones.size,
      transaccionesActivas: this.transacciones.size,
    };
  }
}
