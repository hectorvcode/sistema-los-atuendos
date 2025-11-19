import { Injectable } from '@nestjs/common';
import { AbstractPricingStrategy } from '../abstract-pricing-strategy';
import { PricingContext, PricingResult } from '../pricing-strategy.interface';

/**
 * Estrategia de precio por temporada
 * Aplica descuentos según la época del año
 *
 * Temporadas:
 * - Alta (Diciembre, Enero, Junio, Julio): Sin descuento
 * - Media (Marzo, Abril, Mayo, Septiembre, Octubre, Noviembre): 5% descuento
 * - Baja (Febrero, Agosto): 10% descuento
 */
@Injectable()
export class SeasonalPricingStrategy extends AbstractPricingStrategy {
  private readonly TEMPORADA_ALTA = [12, 1, 6, 7]; // Diciembre, Enero, Junio, Julio
  private readonly TEMPORADA_BAJA = [2, 8]; // Febrero, Agosto
  private readonly DESCUENTO_MEDIA = 5; // 5%
  private readonly DESCUENTO_BAJA = 10; // 10%

  getNombre(): string {
    return 'Seasonal';
  }

  getDescripcion(): string {
    return 'Descuento según temporada: Alta (0%), Media (5%), Baja (10%)';
  }

  esAplicable(context: PricingContext): boolean {
    // Esta estrategia es aplicable siempre (se evalúa la fecha)
    return true;
  }

  calcularPrecio(context: PricingContext): PricingResult {
    const precioBase = this.calcularPrecioBase(context.prendas);
    const mes = context.fechaAlquiler.getMonth() + 1; // getMonth() retorna 0-11

    let porcentajeDescuento = 0;
    let temporada = '';

    if (this.TEMPORADA_ALTA.includes(mes)) {
      porcentajeDescuento = 0;
      temporada = 'Alta';
    } else if (this.TEMPORADA_BAJA.includes(mes)) {
      porcentajeDescuento = this.DESCUENTO_BAJA;
      temporada = 'Baja';
    } else {
      porcentajeDescuento = this.DESCUENTO_MEDIA;
      temporada = 'Media';
    }

    const descuento = this.calcularMontoDescuento(
      precioBase,
      porcentajeDescuento,
    );
    const precioFinal = precioBase - descuento;

    return {
      precioBase: this.redondear(precioBase),
      descuento: this.redondear(descuento),
      precioFinal: this.redondear(precioFinal),
      detalles: `Temporada ${temporada}: ${porcentajeDescuento}% de descuento`,
    };
  }
}