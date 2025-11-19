import { Prenda } from '../../../modules/prendas/entities/prenda.entity';
import { Cliente } from '../../../modules/clientes/entities/cliente.entity';

/**
 * Contexto de cálculo de precio
 * Contiene toda la información necesaria para calcular el precio
 */
export interface PricingContext {
  prendas: Prenda[];
  cliente?: Cliente;
  fechaAlquiler: Date;
  duracionDias?: number;
}

/**
 * Resultado del cálculo de precio
 */
export interface PricingResult {
  precioBase: number;
  descuento: number;
  precioFinal: number;
  detalles: string;
}

/**
 * Interface para estrategias de cálculo de precio
 * Define el contrato que todas las estrategias deben cumplir
 */
export interface IPricingStrategy {
  /**
   * Calcula el precio según la estrategia específica
   * @param context - Contexto con información para el cálculo
   * @returns Resultado del cálculo con detalles
   */
  calcularPrecio(context: PricingContext): PricingResult;

  /**
   * Nombre de la estrategia
   */
  getNombre(): string;

  /**
   * Descripción de la estrategia
   */
  getDescripcion(): string;

  /**
   * Verifica si esta estrategia es aplicable al contexto dado
   * @param context - Contexto a validar
   */
  esAplicable(context: PricingContext): boolean;
}
