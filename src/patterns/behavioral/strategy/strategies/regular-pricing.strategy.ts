import { Injectable } from '@nestjs/common';
import { AbstractPricingStrategy } from '../abstract-pricing-strategy';
import { PricingContext, PricingResult } from '../pricing-strategy.interface';

/**
 * Estrategia de precio regular
 * Calcula el precio sin aplicar descuentos
 * Se usa como estrategia por defecto
 */
@Injectable()
export class RegularPricingStrategy extends AbstractPricingStrategy {
  getNombre(): string {
    return 'Regular';
  }

  getDescripcion(): string {
    return 'Precio regular sin descuentos. Suma del valor de alquiler de todas las prendas.';
  }

  esAplicable(context: PricingContext): boolean {
    // Esta estrategia siempre es aplicable (estrategia por defecto)
    return true;
  }

  calcularPrecio(context: PricingContext): PricingResult {
    const precioBase = this.calcularPrecioBase(context.prendas);

    return {
      precioBase: this.redondear(precioBase),
      descuento: 0,
      precioFinal: this.redondear(precioBase),
      detalles: `Precio regular: ${context.prendas.length} prenda(s) sin descuentos`,
    };
  }
}