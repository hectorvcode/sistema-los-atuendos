import { Injectable } from '@nestjs/common';
import { AbstractPricingStrategy } from '../abstract-pricing-strategy';
import { PricingContext, PricingResult } from '../pricing-strategy.interface';

/**
 * Estrategia de precio por cantidad (Bulk)
 * Aplica descuentos según la cantidad de prendas alquiladas
 *
 * Niveles:
 * - 1-2 prendas: 0% descuento
 * - 3-5 prendas: 5% descuento
 * - 6-10 prendas: 10% descuento
 * - 11+ prendas: 15% descuento
 */
@Injectable()
export class BulkPricingStrategy extends AbstractPricingStrategy {
  private readonly NIVELES = [
    { min: 11, descuento: 15, nombre: 'Premium' },
    { min: 6, descuento: 10, nombre: 'Alto' },
    { min: 3, descuento: 5, nombre: 'Medio' },
    { min: 1, descuento: 0, nombre: 'Básico' },
  ];

  getNombre(): string {
    return 'Bulk';
  }

  getDescripcion(): string {
    return 'Descuento por cantidad: 3-5 prendas (5%), 6-10 prendas (10%), 11+ prendas (15%)';
  }

  esAplicable(context: PricingContext): boolean {
    // Aplicable cuando hay al menos 3 prendas para dar descuento
    return context.prendas.length >= 3;
  }

  calcularPrecio(context: PricingContext): PricingResult {
    const precioBase = this.calcularPrecioBase(context.prendas);
    const cantidadPrendas = context.prendas.length;

    // Encontrar el nivel correspondiente
    const nivel = this.NIVELES.find((n) => cantidadPrendas >= n.min);

    if (!nivel) {
      // Fallback (no debería ocurrir)
      return {
        precioBase: this.redondear(precioBase),
        descuento: 0,
        precioFinal: this.redondear(precioBase),
        detalles: `${cantidadPrendas} prenda(s) sin descuento`,
      };
    }

    const descuento = this.calcularMontoDescuento(
      precioBase,
      nivel.descuento,
    );
    const precioFinal = precioBase - descuento;

    return {
      precioBase: this.redondear(precioBase),
      descuento: this.redondear(descuento),
      precioFinal: this.redondear(precioFinal),
      detalles: `${cantidadPrendas} prendas (nivel ${nivel.nombre}): ${nivel.descuento}% de descuento`,
    };
  }
}