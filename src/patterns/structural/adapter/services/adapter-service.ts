// src/patterns/structural/adapter/services/adapter-service.ts

import { Injectable } from '@nestjs/common';
import { AdaptadorBDRelacional } from '../adapters/adaptador-bd-relacional.adapter';
import { ResultadoPersistencia } from '../interfaces/persistencia.interface';

/**
 * AdapterService - Capa de servicio que utiliza el Adaptador
 * Proporciona operaciones de alto nivel para el dominio de la aplicación
 */
@Injectable()
export class AdapterService {
  private adaptador: AdaptadorBDRelacional;

  constructor() {
    this.adaptador = new AdaptadorBDRelacional();
  }

  // ============================================================================
  // GESTIÓN DE CONEXIÓN
  // ============================================================================

  async inicializarConexion(): Promise<ResultadoPersistencia<boolean>> {
    try {
      const conectado = await this.adaptador.conectar();

      if (conectado) {
        return {
          exito: true,
          datos: true,
          mensaje: 'Conexión establecida exitosamente',
        };
      } else {
        return {
          exito: false,
          datos: false,
          mensaje: 'No se pudo establecer la conexión',
        };
      }
    } catch (error) {
      return {
        exito: false,
        datos: false,
        error: error.message,
      };
    }
  }

  async cerrarConexion(): Promise<ResultadoPersistencia<boolean>> {
    try {
      const desconectado = await this.adaptador.desconectar();

      return {
        exito: desconectado,
        datos: desconectado,
        mensaje: desconectado
          ? 'Conexión cerrada exitosamente'
          : 'Error cerrando conexión',
      };
    } catch (error) {
      return {
        exito: false,
        datos: false,
        error: error.message,
      };
    }
  }

  async verificarEstadoConexion(): Promise<ResultadoPersistencia<boolean>> {
    try {
      const conectado = await this.adaptador.verificarConexion();

      return {
        exito: true,
        datos: conectado,
        mensaje: conectado ? 'Conexión activa' : 'Sin conexión',
      };
    } catch (error) {
      return {
        exito: false,
        datos: false,
        error: error.message,
      };
    }
  }

  // ============================================================================
  // OPERACIONES CON PRENDAS
  // ============================================================================

  async registrarPrenda(
    prendaData: any,
  ): Promise<ResultadoPersistencia<string>> {
    try {
      const guardado = await this.adaptador.guardarNuevaPrenda(prendaData);

      if (guardado) {
        return {
          exito: true,
          datos: prendaData.referencia,
          mensaje: `Prenda ${prendaData.referencia} registrada exitosamente`,
        };
      } else {
        return {
          exito: false,
          mensaje: 'No se pudo guardar la prenda',
        };
      }
    } catch (error) {
      return {
        exito: false,
        error: `Error registrando prenda: ${error.message}`,
      };
    }
  }

  async consultarPrendaPorReferencia(
    referencia: string,
  ): Promise<ResultadoPersistencia<any>> {
    try {
      const prenda = await this.adaptador.buscarPrendaPorReferencia(referencia);

      if (prenda) {
        return {
          exito: true,
          datos: prenda,
          mensaje: `Prenda ${referencia} encontrada`,
        };
      } else {
        return {
          exito: false,
          mensaje: `Prenda ${referencia} no encontrada`,
        };
      }
    } catch (error) {
      return {
        exito: false,
        error: `Error consultando prenda: ${error.message}`,
      };
    }
  }

  async consultarPrendasPorTalla(
    talla: string,
  ): Promise<ResultadoPersistencia<any[]>> {
    try {
      const prendas = await this.adaptador.buscarPrendasPorTalla(talla);

      return {
        exito: true,
        datos: prendas,
        mensaje: `Encontradas ${prendas.length} prendas de talla ${talla}`,
      };
    } catch (error) {
      return {
        exito: false,
        datos: [],
        error: `Error consultando prendas por talla: ${error.message}`,
      };
    }
  }

  async consultarPrendasDisponibles(): Promise<ResultadoPersistencia<any[]>> {
    try {
      const prendas = await this.adaptador.buscarPrendasDisponibles();

      return {
        exito: true,
        datos: prendas,
        mensaje: `Encontradas ${prendas.length} prendas disponibles`,
      };
    } catch (error) {
      return {
        exito: false,
        datos: [],
        error: `Error consultando prendas disponibles: ${error.message}`,
      };
    }
  }

  async actualizarEstadoPrenda(
    referencia: string,
    nuevoEstado: string,
  ): Promise<ResultadoPersistencia<boolean>> {
    try {
      const actualizado = await this.adaptador.actualizarEstadoPrenda(
        referencia,
        nuevoEstado,
      );

      if (actualizado) {
        return {
          exito: true,
          datos: true,
          mensaje: `Estado de prenda ${referencia} actualizado a ${nuevoEstado}`,
        };
      } else {
        return {
          exito: false,
          datos: false,
          mensaje: `No se pudo actualizar el estado de la prenda ${referencia}`,
        };
      }
    } catch (error) {
      return {
        exito: false,
        datos: false,
        error: `Error actualizando estado: ${error.message}`,
      };
    }
  }

  async eliminarPrenda(
    referencia: string,
  ): Promise<ResultadoPersistencia<boolean>> {
    try {
      const eliminado = await this.adaptador.eliminarPrenda(referencia);

      if (eliminado) {
        return {
          exito: true,
          datos: true,
          mensaje: `Prenda ${referencia} eliminada exitosamente`,
        };
      } else {
        return {
          exito: false,
          datos: false,
          mensaje: `No se pudo eliminar la prenda ${referencia}`,
        };
      }
    } catch (error) {
      return {
        exito: false,
        datos: false,
        error: `Error eliminando prenda: ${error.message}`,
      };
    }
  }

  async listarTodasLasPrendas(): Promise<ResultadoPersistencia<any[]>> {
    try {
      const prendas = await this.adaptador.buscarTodos<any>();

      return {
        exito: true,
        datos: prendas,
        mensaje: `Encontradas ${prendas.length} prendas en total`,
      };
    } catch (error) {
      return {
        exito: false,
        datos: [],
        error: `Error listando prendas: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // OPERACIONES DE TRANSACCIÓN
  // ============================================================================

  async ejecutarOperacionConTransaccion(
    operaciones: Array<() => Promise<any>>,
  ): Promise<ResultadoPersistencia<any>> {
    let transaccionId: string | null = null;

    try {
      // Iniciar transacción
      transaccionId = await this.adaptador.iniciarTransaccion();

      const resultados: any[] = [];

      // Ejecutar todas las operaciones
      for (const operacion of operaciones) {
        const resultado = await operacion();
        resultados.push(resultado);
      }

      // Confirmar transacción
      const confirmado =
        await this.adaptador.confirmarTransaccion(transaccionId);

      if (confirmado) {
        return {
          exito: true,
          datos: resultados,
          mensaje: 'Transacción completada exitosamente',
          transactionId: transaccionId,
        };
      } else {
        await this.adaptador.deshacerTransaccion(transaccionId);
        return {
          exito: false,
          mensaje: 'No se pudo confirmar la transacción',
        };
      }
    } catch (error) {
      // Deshacer transacción en caso de error
      if (transaccionId) {
        await this.adaptador.deshacerTransaccion(transaccionId);
      }

      return {
        exito: false,
        error: `Error en transacción: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // OPERACIONES DE ADMINISTRACIÓN
  // ============================================================================

  async obtenerEstadisticasSistema(): Promise<ResultadoPersistencia<any>> {
    try {
      const estadisticas = await this.adaptador.obtenerEstadisticasConexion();

      return {
        exito: true,
        datos: estadisticas,
        mensaje: 'Estadísticas obtenidas exitosamente',
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error obteniendo estadísticas: ${error.message}`,
      };
    }
  }

  async mantenerConexiones(): Promise<ResultadoPersistencia<void>> {
    try {
      await this.adaptador.limpiarConexionesInactivas();

      return {
        exito: true,
        mensaje: 'Mantenimiento de conexiones realizado',
      };
    } catch (error) {
      return {
        exito: false,
        error: `Error en mantenimiento: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  async registrarMultiplesPrendas(
    prendas: any[],
  ): Promise<ResultadoPersistencia<string[]>> {
    try {
      const operaciones = prendas.map(
        (prenda) => () => this.adaptador.guardarNuevaPrenda(prenda),
      );

      const resultado = await this.ejecutarOperacionConTransaccion(operaciones);

      if (resultado.exito) {
        return {
          exito: true,
          datos: prendas.map((p) => p.referencia),
          mensaje: `${prendas.length} prendas registradas exitosamente`,
        };
      } else {
        return {
          exito: false,
          datos: [],
          error: 'Error registrando prendas en lote',
        };
      }
    } catch (error) {
      return {
        exito: false,
        datos: [],
        error: `Error en registro múltiple: ${error.message}`,
      };
    }
  }

  async buscarPrendasPorCriterios(
    criterios: any,
  ): Promise<ResultadoPersistencia<any[]>> {
    try {
      const prendas = await this.adaptador.buscarPorCriterio(criterios);

      return {
        exito: true,
        datos: prendas,
        mensaje: `Encontradas ${prendas.length} prendas que cumplen los criterios`,
      };
    } catch (error) {
      return {
        exito: false,
        datos: [],
        error: `Error buscando por criterios: ${error.message}`,
      };
    }
  }
}
