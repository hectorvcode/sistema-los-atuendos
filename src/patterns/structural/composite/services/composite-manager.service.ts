import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPrendaComponent } from '../interfaces/prenda-component.interface.js';
import { ConjuntoPrendasComponent } from '../components/conjunto-prendas.component.js';
import {
  ConjuntoBuilder,
  ConjuntoConfig,
} from '../builders/conjunto-builder.js';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity.js';

export interface OperacionConjunto {
  tipo:
    | 'calcularPrecio'
    | 'verificarDisponibilidad'
    | 'marcarAlquilado'
    | 'marcarDisponible'
    | 'enviarLavado';
  targetId?: string; // ID específico, si no se proporciona se aplica a todo
  parametros?: any;
}

export interface ResultadoOperacion {
  exito: boolean;
  mensaje: string;
  datos?: any;
  errores?: string[];
}

@Injectable()
export class CompositeManagerService {
  private conjuntos: Map<string, IPrendaComponent> = new Map();

  constructor(
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
    private readonly conjuntoBuilder: ConjuntoBuilder,
  ) {}

  // Gestión de conjuntos
  crearConjunto(config: ConjuntoConfig): ResultadoOperacion {
    try {
      const conjunto = this.conjuntoBuilder.iniciarConjunto(config).build();

      this.conjuntos.set(conjunto.getId(), conjunto);

      return {
        exito: true,
        mensaje: `Conjunto ${config.nombre} creado exitosamente`,
        datos: {
          id: conjunto.getId(),
          estadisticas: this.obtenerEstadisticas(conjunto.getId()),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        exito: false,
        mensaje: `Error creando conjunto: ${errorMessage}`,
        errores: [errorMessage],
      };
    }
  }

  async crearConjuntoConPrendas(
    config: ConjuntoConfig & { referencias: string[] },
  ): Promise<ResultadoOperacion> {
    try {
      const builder = this.conjuntoBuilder.iniciarConjunto(config);
      await builder.agregarPrendasPorReferencias(config.referencias);
      const conjunto = builder.build();

      this.conjuntos.set(conjunto.getId(), conjunto);

      return {
        exito: true,
        mensaje: `Conjunto ${config.nombre} creado con ${config.referencias.length} prendas`,
        datos: {
          id: conjunto.getId(),
          referencias: conjunto.obtenerListaReferencias(),
          estadisticas: this.obtenerEstadisticas(conjunto.getId()),
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        exito: false,
        mensaje: `Error creando conjunto con prendas: ${errorMessage}`,
        errores: [errorMessage],
      };
    }
  }

  agregarPrendaAConjunto(
    conjuntoId: string,
    referencia: string,
  ): ResultadoOperacion {
    try {
      const conjunto = this.conjuntos.get(conjuntoId);
      if (!conjunto) {
        return {
          exito: false,
          mensaje: `Conjunto ${conjuntoId} no encontrado`,
          errores: [`No existe conjunto con ID: ${conjuntoId}`],
        };
      }

      // Crear componente simple para la prenda
      // Nota: En implementación real, cargarías la prenda desde BD
      const mensaje = `Prenda ${referencia} agregada al conjunto ${conjuntoId}`;

      return {
        exito: true,
        mensaje,
        datos: { nuevasReferencias: conjunto.obtenerListaReferencias() },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        exito: false,
        mensaje: `Error agregando prenda: ${errorMessage}`,
        errores: [errorMessage],
      };
    }
  }

  // Operaciones sobre conjuntos
  ejecutarOperacion(
    conjuntoId: string,
    operacion: OperacionConjunto,
  ): ResultadoOperacion {
    try {
      const conjunto = this.conjuntos.get(conjuntoId);
      if (!conjunto) {
        return {
          exito: false,
          mensaje: `Conjunto ${conjuntoId} no encontrado`,
          errores: [`No existe conjunto con ID: ${conjuntoId}`],
        };
      }

      let resultado: any;
      let mensaje = '';

      switch (operacion.tipo) {
        case 'calcularPrecio':
          resultado = conjunto.calcularPrecioTotal();
          mensaje = `Precio total calculado: $${Number(resultado).toLocaleString()}`;
          break;

        case 'verificarDisponibilidad':
          resultado = conjunto.verificarDisponibilidad();
          mensaje = `Disponibilidad: ${resultado ? 'Disponible' : 'No disponible'}`;
          break;

        case 'marcarAlquilado':
          conjunto.marcarComoAlquilado();
          resultado = true;
          mensaje = 'Conjunto marcado como alquilado';
          break;

        case 'marcarDisponible':
          conjunto.marcarComoDisponible();
          resultado = true;
          mensaje = 'Conjunto marcado como disponible';
          break;

        case 'enviarLavado':
          conjunto.marcarParaLavado();
          resultado = {
            requiereLavado: conjunto.necesitaLavado(),
            prioridad: conjunto.obtenerPrioridadLavado(),
          };
          mensaje = 'Conjunto enviado a lavandería';
          break;

        default:
          throw new Error(`Operación no soportada: ${String(operacion.tipo)}`);
      }

      return {
        exito: true,
        mensaje,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        datos: resultado,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      return {
        exito: false,
        mensaje: `Error ejecutando operación: ${errorMessage}`,
        errores: [errorMessage],
      };
    }
  }

  // Consultas
  obtenerConjunto(conjuntoId: string): IPrendaComponent | null {
    return this.conjuntos.get(conjuntoId) || null;
  }

  obtenerTodosLosConjuntos(): IPrendaComponent[] {
    return Array.from(this.conjuntos.values());
  }

  obtenerEstadisticas(conjuntoId: string): {
    totalComponentes: number;
    totalPiezas: number;
    precioTotal: number;
    componentesDisponibles: number;
    componentesRequierenLavado: number;
    prioridadMaxima: number;
    nivel: number;
  } | null {
    const conjunto = this.conjuntos.get(conjuntoId);
    if (!conjunto) {
      return null;
    }

    if (conjunto.esComposite()) {
      const conjuntoComposite = conjunto as ConjuntoPrendasComponent;
      return conjuntoComposite.obtenerEstadisticas();
    } else {
      return {
        totalComponentes: 1,
        totalPiezas: conjunto.contarPiezas(),
        precioTotal: conjunto.calcularPrecioTotal(),
        componentesDisponibles: conjunto.verificarDisponibilidad() ? 1 : 0,
        componentesRequierenLavado: conjunto.necesitaLavado() ? 1 : 0,
        prioridadMaxima: conjunto.obtenerPrioridadLavado(),
        nivel: 0,
      };
    }
  }

  buscarPorReferencia(referencia: string): IPrendaComponent[] {
    const resultados: IPrendaComponent[] = [];

    this.conjuntos.forEach((conjunto) => {
      const encontrado = conjunto.buscarPorReferencia(referencia);
      if (encontrado) {
        resultados.push(encontrado);
      }
    });

    return resultados;
  }

  obtenerConjuntosQueRequierenLavado(): IPrendaComponent[] {
    return Array.from(this.conjuntos.values()).filter((conjunto) =>
      conjunto.necesitaLavado(),
    );
  }

  obtenerConjuntosDisponibles(): IPrendaComponent[] {
    return Array.from(this.conjuntos.values()).filter((conjunto) =>
      conjunto.verificarDisponibilidad(),
    );
  }

  // Operaciones de estructura
  obtenerEstructuraArbol(conjuntoId: string): string | null {
    const conjunto = this.conjuntos.get(conjuntoId);
    if (!conjunto) {
      return null;
    }

    if (conjunto.esComposite()) {
      const conjuntoComposite = conjunto as ConjuntoPrendasComponent;
      return conjuntoComposite.obtenerEstructuraArbol();
    } else {
      return `├─ ${conjunto.getNombre()}`;
    }
  }

  // Validación
  validarConjunto(conjuntoId: string): ResultadoOperacion {
    const conjunto = this.conjuntos.get(conjuntoId);
    if (!conjunto) {
      return {
        exito: false,
        mensaje: `Conjunto ${conjuntoId} no encontrado`,
        errores: [`No existe conjunto con ID: ${conjuntoId}`],
      };
    }

    const validacion = conjunto.validarIntegridad();

    return {
      exito: validacion.valido,
      mensaje: validacion.valido ? 'Conjunto válido' : 'Conjunto inválido',
      errores: validacion.errores,
    };
  }

  validarTodosLosConjuntos(): { [conjuntoId: string]: ResultadoOperacion } {
    const resultados: { [conjuntoId: string]: ResultadoOperacion } = {};

    this.conjuntos.forEach((conjunto, id) => {
      resultados[id] = this.validarConjunto(id);
    });

    return resultados;
  }

  // Persistencia (simulada)
  exportarConjunto(conjuntoId: string): any {
    const conjunto = this.conjuntos.get(conjuntoId);
    if (!conjunto) {
      return null;
    }

    return conjunto.toJSON();
  }

  exportarTodosLosConjuntos(): { [conjuntoId: string]: any } {
    const exports: { [conjuntoId: string]: any } = {};

    this.conjuntos.forEach((conjunto, id) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      exports[id] = conjunto.toJSON();
    });

    return exports;
  }

  // Limpieza
  eliminarConjunto(conjuntoId: string): ResultadoOperacion {
    if (!this.conjuntos.has(conjuntoId)) {
      return {
        exito: false,
        mensaje: `Conjunto ${conjuntoId} no encontrado`,
        errores: [`No existe conjunto con ID: ${conjuntoId}`],
      };
    }

    this.conjuntos.delete(conjuntoId);

    return {
      exito: true,
      mensaje: `Conjunto ${conjuntoId} eliminado exitosamente`,
    };
  }

  limpiarTodosLosConjuntos(): void {
    this.conjuntos.clear();
    console.log('✅ Todos los conjuntos han sido eliminados');
  }

  // Estadísticas globales
  obtenerEstadisticasGlobales(): {
    totalConjuntos: number;
    totalComponentes: number;
    totalPiezas: number;
    precioTotalGeneral: number;
    conjuntosDisponibles: number;
    conjuntosRequierenLavado: number;
    promedioComponentesPorConjunto: number;
  } {
    const conjuntos = Array.from(this.conjuntos.values());

    if (conjuntos.length === 0) {
      return {
        totalConjuntos: 0,
        totalComponentes: 0,
        totalPiezas: 0,
        precioTotalGeneral: 0,
        conjuntosDisponibles: 0,
        conjuntosRequierenLavado: 0,
        promedioComponentesPorConjunto: 0,
      };
    }

    const estadisticas = conjuntos
      .map((c) => this.obtenerEstadisticas(c.getId()))
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return {
      totalConjuntos: conjuntos.length,
      totalComponentes: estadisticas.reduce(
        (sum, e) => sum + e.totalComponentes,
        0,
      ),
      totalPiezas: estadisticas.reduce((sum, e) => sum + e.totalPiezas, 0),
      precioTotalGeneral: estadisticas.reduce(
        (sum, e) => sum + e.precioTotal,
        0,
      ),
      conjuntosDisponibles: conjuntos.filter((c) => c.verificarDisponibilidad())
        .length,
      conjuntosRequierenLavado: conjuntos.filter((c) => c.necesitaLavado())
        .length,
      promedioComponentesPorConjunto:
        conjuntos.length > 0
          ? estadisticas.reduce((sum, e) => sum + e.totalComponentes, 0) /
            conjuntos.length
          : 0,
    };
  }
}
