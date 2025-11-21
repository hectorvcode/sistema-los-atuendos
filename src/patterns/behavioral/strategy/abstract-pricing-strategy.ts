import {
  IPricingStrategy,
  PricingContext,
  PricingResult,
} from './pricing-strategy.interface';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

/**
 * Clase abstracta base para estrategias de pricing
 * Proporciona funcionalidad común para todas las estrategias
 */
export abstract class AbstractPricingStrategy implements IPricingStrategy {
  abstract getNombre(): string;
  abstract getDescripcion(): string;
  abstract esAplicable(context: PricingContext): boolean;
  abstract calcularPrecio(context: PricingContext): PricingResult;

  /**
   * Calcula el precio base sumando el valor de todas las prendas
   * @param prendas - Array de prendas a calcular
   * @returns Precio base total
   */
  protected calcularPrecioBase(prendas: Prenda[]): number {
    return prendas.reduce(
      (total, prenda) => total + Number(prenda.valorAlquiler),
      0,
    );
  }

  /**
   * Aplica un porcentaje de descuento al precio base
   * @param precioBase - Precio base antes del descuento
   * @param porcentajeDescuento - Porcentaje de descuento (0-100)
   * @returns Precio con descuento aplicado
   */
  protected aplicarDescuento(
    precioBase: number,
    porcentajeDescuento: number,
  ): number {
    const descuento = precioBase * (porcentajeDescuento / 100);
    return precioBase - descuento;
  }

  /**
   * Calcula el monto de descuento
   * @param precioBase - Precio base
   * @param porcentajeDescuento - Porcentaje de descuento
   * @returns Monto del descuento
   */
  protected calcularMontoDescuento(
    precioBase: number,
    porcentajeDescuento: number,
  ): number {
    return precioBase * (porcentajeDescuento / 100);
  }

  /**
   * Redondea un número a 2 decimales
   * @param valor - Valor a redondear
   * @returns Valor redondeado
   */
  protected redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
