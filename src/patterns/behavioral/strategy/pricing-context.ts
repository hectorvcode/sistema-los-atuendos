import { Injectable } from '@nestjs/common';
import {
  IPricingStrategy,
  PricingContext,
  PricingResult,
} from './pricing-strategy.interface';
import { RegularPricingStrategy } from './strategies/regular-pricing.strategy';
import { VipPricingStrategy } from './strategies/vip-pricing.strategy';
import { SeasonalPricingStrategy } from './strategies/seasonal-pricing.strategy';
import { BulkPricingStrategy } from './strategies/bulk-pricing.strategy';
import { PromotionalPricingStrategy } from './strategies/promotional-pricing.strategy';

/**
 * Contexto de estrategias de pricing
 * Gestiona y coordina las diferentes estrategias de cálculo de precio
 *
 * Responsabilidades:
 * - Mantener registro de todas las estrategias disponibles
 * - Seleccionar la mejor estrategia aplicable
 * - Permitir combinar múltiples estrategias
 * - Calcular el precio usando la estrategia seleccionada
 */
@Injectable()
export class PricingStrategyContext {
  private estrategias: IPricingStrategy[];
  private estrategiaActual: IPricingStrategy;

  constructor(
    private readonly regularStrategy: RegularPricingStrategy,
    private readonly vipStrategy: VipPricingStrategy,
    private readonly seasonalStrategy: SeasonalPricingStrategy,
    private readonly bulkStrategy: BulkPricingStrategy,
    private readonly promotionalStrategy: PromotionalPricingStrategy,
  ) {
    // Orden de prioridad: Promotional > VIP > Bulk > Seasonal > Regular
    this.estrategias = [
      this.promotionalStrategy,
      this.vipStrategy,
      this.bulkStrategy,
      this.seasonalStrategy,
      this.regularStrategy,
    ];

    this.estrategiaActual = this.regularStrategy;
  }

  /**
   * Establece manualmente una estrategia específica
   * @param estrategia - Estrategia a usar
   */
  setEstrategia(estrategia: IPricingStrategy): void {
    this.estrategiaActual = estrategia;
  }

  /**
   * Calcula el precio usando la estrategia actual
   * @param context - Contexto con información para el cálculo
   * @returns Resultado del cálculo
   */
  calcularPrecio(context: PricingContext): PricingResult {
    return this.estrategiaActual.calcularPrecio(context);
  }

  /**
   * Selecciona automáticamente la mejor estrategia aplicable
   * y calcula el precio
   *
   * Prioridad (de mayor a menor):
   * 1. Promotional (promociones especiales)
   * 2. VIP (clientes VIP)
   * 3. Bulk (descuento por cantidad)
   * 4. Seasonal (descuento por temporada)
   * 5. Regular (sin descuento)
   *
   * @param context - Contexto con información para el cálculo
   * @returns Resultado del cálculo con la mejor estrategia
   */
  calcularMejorPrecio(context: PricingContext): PricingResult {
    // Buscar la primera estrategia aplicable según prioridad
    const estrategiaAplicable =
      this.estrategias.find((e) => e.esAplicable(context)) ||
      this.regularStrategy;

    this.estrategiaActual = estrategiaAplicable;
    return estrategiaAplicable.calcularPrecio(context);
  }

  /**
   * Calcula el precio combinando múltiples estrategias
   * Aplica los descuentos de forma acumulativa
   *
   * IMPORTANTE: Este método es experimental y debe usarse con precaución
   * Los descuentos se acumulan multiplicativamente, no aditivamente
   *
   * @param context - Contexto con información para el cálculo
   * @param estrategiasAUsar - Array de estrategias a combinar
   * @returns Resultado del cálculo combinado
   */
  calcularPrecioCombinado(
    context: PricingContext,
    estrategiasAUsar: IPricingStrategy[],
  ): PricingResult {
    const precioBase = estrategiasAUsar[0]
      ? estrategiasAUsar[0]['calcularPrecioBase'](context.prendas)
      : 0;

    let precioActual = precioBase;
    let descuentoTotal = 0;
    const detallesCombinados: string[] = [];

    estrategiasAUsar.forEach((estrategia) => {
      if (estrategia.esAplicable(context)) {
        const resultado = estrategia.calcularPrecio(context);

        // Calcular descuento sobre el precio actual (no sobre el base)
        const factorDescuento = 1 - resultado.descuento / resultado.precioBase;
        const nuevoDescuento = precioActual * (1 - factorDescuento);

        descuentoTotal += nuevoDescuento;
        precioActual = precioActual - nuevoDescuento;

        detallesCombinados.push(`${estrategia.getNombre()}: ${resultado.detalles}`);
      }
    });

    return {
      precioBase: Math.round(precioBase * 100) / 100,
      descuento: Math.round(descuentoTotal * 100) / 100,
      precioFinal: Math.round(precioActual * 100) / 100,
      detalles: `Combinado: ${detallesCombinados.join(' + ')}`,
    };
  }

  /**
   * Obtiene todas las estrategias aplicables para un contexto
   * @param context - Contexto a evaluar
   * @returns Array de estrategias aplicables
   */
  obtenerEstrategiasAplicables(context: PricingContext): IPricingStrategy[] {
    return this.estrategias.filter((e) => e.esAplicable(context));
  }

  /**
   * Obtiene información de todas las estrategias disponibles
   * @returns Array con nombre y descripción de cada estrategia
   */
  obtenerEstrategiasDisponibles(): Array<{
    nombre: string;
    descripcion: string;
  }> {
    return this.estrategias.map((e) => ({
      nombre: e.getNombre(),
      descripcion: e.getDescripcion(),
    }));
  }

  /**
   * Obtiene la estrategia actual
   */
  getEstrategiaActual(): IPricingStrategy {
    return this.estrategiaActual;
  }
}