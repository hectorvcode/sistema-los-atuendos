// src/patterns/structural/adapter/adapters/adaptador-bd-relacional.adapter.ts

import { Injectable } from '@nestjs/common';
import {
  IPersistenciaPrendas,
  ConfiguracionConexion,
  ResultadoPersistencia,
} from '../interfaces/persistencia.interface';
import { BaseDatos } from './base-datos';
import { ConnectionPool } from './connection-pool';

/**
 * AdaptadorBDRelacional - El Adapter del patrón
 * Adapta la interfaz incompatible de BaseDatos a la interfaz IPersistenciaPrendas
 * que necesita nuestro dominio
 */
@Injectable()
export class AdaptadorBDRelacional implements IPersistenciaPrendas {
  private baseDatos: BaseDatos;
  private connectionPool: ConnectionPool | null = null;
  private transaccionActual: string | null = null;

  constructor() {
    this.baseDatos = new BaseDatos();
  }

  // ============================================================================
  // OPERACIONES DE CONEXIÓN
  // ============================================================================

  async conectar(): Promise<boolean> {
    try {
      const config: ConfiguracionConexion = {
        tipo: 'mysql',
        servidor: 'localhost',
        puerto: 3306,
        baseDatos: 'los_atuendos',
        usuario: 'admin',
        contrasena: 'password',
        configuracionPool: {
          min: 2,
          max: 10,
          timeoutConexion: 5000,
          timeoutInactividad: 30000,
        },
      };

      // Usar el método de la BD existente (interfaz incompatible)
      const conectado = this.baseDatos.abrirConexion(config);

      if (conectado) {
        // Inicializar pool de conexiones
        this.connectionPool = new ConnectionPool(config);
        await this.connectionPool.inicializar();
      }

      return conectado;
    } catch (error) {
      console.error('Error en adaptador al conectar:', error);
      return false;
    }
  }

  async desconectar(): Promise<boolean> {
    try {
      if (this.connectionPool) {
        await this.connectionPool.cerrarTodas();
        this.connectionPool = null;
      }

      // Usar el método de la BD existente
      return this.baseDatos.cerrarConexion();
    } catch (error) {
      console.error('Error en adaptador al desconectar:', error);
      return false;
    }
  }

  async verificarConexion(): Promise<boolean> {
    try {
      // Adaptar el método de la BD existente
      return this.baseDatos.estaConectado();
    } catch (error) {
      console.error('Error verificando conexión:', error);
      return false;
    }
  }

  // ============================================================================
  // OPERACIONES ESPECÍFICAS DE PRENDAS (IPersistenciaPrendas)
  // ============================================================================

  async guardarNuevaPrenda(prenda: any): Promise<boolean> {
    try {
      // Adaptar: guardar -> insertarRegistro
      return this.baseDatos.insertarRegistro('prendas', prenda);
    } catch (error) {
      console.error('Error guardando prenda:', error);
      return false;
    }
  }

  async buscarPrendaPorReferencia(referencia: string): Promise<any | null> {
    try {
      // Adaptar: buscar por referencia -> seleccionarPorId
      return this.baseDatos.seleccionarPorId('prendas', referencia);
    } catch (error) {
      console.error('Error buscando prenda por referencia:', error);
      return null;
    }
  }

  async buscarPrendasPorTalla(talla: string): Promise<any[]> {
    try {
      // Adaptar: buscar por criterio -> seleccionarPorCampo
      return this.baseDatos.seleccionarPorCampo('prendas', 'talla', talla);
    } catch (error) {
      console.error('Error buscando prendas por talla:', error);
      return [];
    }
  }

  async buscarPrendasDisponibles(): Promise<any[]> {
    try {
      // Adaptar: buscar disponibles -> seleccionarPorCampo
      return this.baseDatos.seleccionarPorCampo('prendas', 'disponible', true);
    } catch (error) {
      console.error('Error buscando prendas disponibles:', error);
      return [];
    }
  }

  async actualizarEstadoPrenda(
    referencia: string,
    estado: string,
  ): Promise<boolean> {
    try {
      // Adaptar: actualizar -> actualizarRegistro
      return this.baseDatos.actualizarRegistro('prendas', referencia, {
        estado,
      });
    } catch (error) {
      console.error('Error actualizando estado de prenda:', error);
      return false;
    }
  }

  async eliminarPrenda(referencia: string): Promise<boolean> {
    try {
      // Adaptar: eliminar -> eliminarRegistro
      return this.baseDatos.eliminarRegistro('prendas', referencia);
    } catch (error) {
      console.error('Error eliminando prenda:', error);
      return false;
    }
  }

  // ============================================================================
  // OPERACIONES GENÉRICAS (IPersistencia)
  // ============================================================================

  async guardar<T>(entidad: T): Promise<boolean> {
    try {
      return this.baseDatos.insertarRegistro('prendas', entidad);
    } catch (error) {
      console.error('Error guardando entidad:', error);
      return false;
    }
  }

  async buscar<T>(id: string): Promise<T | null> {
    try {
      return this.baseDatos.seleccionarPorId('prendas', id);
    } catch (error) {
      console.error('Error buscando entidad:', error);
      return null;
    }
  }

  async actualizar<T>(id: string, datos: Partial<T>): Promise<boolean> {
    try {
      return this.baseDatos.actualizarRegistro('prendas', id, datos);
    } catch (error) {
      console.error('Error actualizando entidad:', error);
      return false;
    }
  }

  async eliminar(id: string): Promise<boolean> {
    try {
      return this.baseDatos.eliminarRegistro('prendas', id);
    } catch (error) {
      console.error('Error eliminando entidad:', error);
      return false;
    }
  }

  async buscarTodos<T>(): Promise<T[]> {
    try {
      return this.baseDatos.seleccionarTodos('prendas');
    } catch (error) {
      console.error('Error buscando todas las entidades:', error);
      return [];
    }
  }

  async buscarPorCriterio<T>(criterio: any): Promise<T[]> {
    try {
      // Adaptar búsqueda por criterio
      const campo = Object.keys(criterio)[0];
      const valor = criterio[campo];
      return this.baseDatos.seleccionarPorCampo('prendas', campo, valor);
    } catch (error) {
      console.error('Error buscando por criterio:', error);
      return [];
    }
  }

  // ============================================================================
  // OPERACIONES DE TRANSACCIÓN
  // ============================================================================

  async iniciarTransaccion(): Promise<string> {
    try {
      // Adaptar: iniciarTransaccion -> comenzarTransaccion
      const transaccionId = this.baseDatos.comenzarTransaccion();
      this.transaccionActual = transaccionId;
      return transaccionId;
    } catch (error) {
      console.error('Error iniciando transacción:', error);
      throw error;
    }
  }

  async confirmarTransaccion(transactionId: string): Promise<boolean> {
    try {
      // Adaptar: confirmar -> commit
      const resultado = this.baseDatos.commitTransaccion(transactionId);
      if (resultado) {
        this.transaccionActual = null;
      }
      return resultado;
    } catch (error) {
      console.error('Error confirmando transacción:', error);
      return false;
    }
  }

  async deshacerTransaccion(transactionId: string): Promise<boolean> {
    try {
      // Adaptar: deshacer -> rollback
      const resultado = this.baseDatos.rollbackTransaccion(transactionId);
      if (resultado) {
        this.transaccionActual = null;
      }
      return resultado;
    } catch (error) {
      console.error('Error deshaciendo transacción:', error);
      return false;
    }
  }

  // ============================================================================
  // MÉTODOS ADICIONALES DE UTILIDAD
  // ============================================================================

  async obtenerEstadisticasConexion(): Promise<any> {
    try {
      const estadisticasBD = this.baseDatos.obtenerEstadisticas();
      const estadisticasPool = this.connectionPool?.getEstadisticas() || null;

      return {
        baseDatos: estadisticasBD,
        pool: estadisticasPool,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  async ejecutarConsultaPersonalizada(consulta: string): Promise<any> {
    try {
      if (!this.connectionPool) {
        throw new Error('No hay pool de conexiones inicializado');
      }

      const conexion = await this.connectionPool.obtenerConexion();
      const resultado = await conexion.ejecutarConsulta(consulta);
      this.connectionPool.liberarConexion(conexion);

      return resultado;
    } catch (error) {
      console.error('Error ejecutando consulta personalizada:', error);
      throw error;
    }
  }

  async limpiarConexionesInactivas(): Promise<void> {
    try {
      if (this.connectionPool) {
        const eliminadas =
          await this.connectionPool.limpiarConexionesInactivas(60000); // 1 minuto
        console.log(`🧹 ${eliminadas} conexiones inactivas eliminadas`);
      }
    } catch (error) {
      console.error('Error limpiando conexiones:', error);
    }
  }
}
