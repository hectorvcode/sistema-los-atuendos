import { ItemLavanderia } from '../entities/item-lavanderia.entity';

/**
 * Resultado paginado para consultas
 */
export interface PaginationResult<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/**
 * Opciones para consultar ítems de lavandería
 */
export interface QueryLavanderiaOptions {
  estado?: string;
  prioridadMinima?: number;
  esManchada?: boolean;
  esDelicada?: boolean;
  prioridadAdministrativa?: boolean;
  pagina?: number;
  limite?: number;
}

/**
 * Interfaz del repositorio de lavandería
 * Define el contrato para la persistencia de ítems de lavandería
 */
export interface ILavanderiaRepository {
  /**
   * Crea un nuevo ítem de lavandería
   */
  crear(item: ItemLavanderia): Promise<ItemLavanderia>;

  /**
   * Busca un ítem por su ID
   */
  buscarPorId(id: number): Promise<ItemLavanderia | null>;

  /**
   * Busca ítems con filtros y paginación
   */
  buscarConFiltros(opciones: QueryLavanderiaOptions): Promise<PaginationResult<ItemLavanderia>>;

  /**
   * Busca todos los ítems pendientes ordenados por prioridad
   */
  buscarPendientesOrdenadosPorPrioridad(): Promise<ItemLavanderia[]>;

  /**
   * Busca ítems por estado
   */
  buscarPorEstado(estado: string, pagina?: number, limite?: number): Promise<PaginationResult<ItemLavanderia>>;

  /**
   * Actualiza un ítem de lavandería
   */
  actualizar(id: number, datos: Partial<ItemLavanderia>): Promise<ItemLavanderia>;

  /**
   * Actualiza múltiples ítems por sus IDs
   */
  actualizarMultiples(ids: number[], datos: Partial<ItemLavanderia>): Promise<void>;

  /**
   * Elimina un ítem de lavandería
   */
  eliminar(id: number): Promise<boolean>;
}