import { Injectable } from '@nestjs/common';
import { AbstractPricingStrategy } from '../abstract-pricing-strategy';
import { PricingContext, PricingResult } from '../pricing-strategy.interface';

/**
 * Promoción activa
 */
interface Promocion {
  codigo: string;
  nombre: string;
  descuento: number;
  fechaInicio: Date;
  fechaFin: Date;
  activa: boolean;
}

/**
 * Promoción base (sin año específico)
 */
interface PromocionBase {
  codigo: string;
  nombre: string;
  descuento: number;
  mesInicio: number; // 0-indexed (0 = Enero)
  diaInicio: number;
  mesFin: number;
  diaFin: number;
  activa: boolean;
}

/**
 * Estrategia de precio promocional
 * Aplica descuentos por promociones especiales activas
 *
 * Promociones configuradas:
 * - San Valentín (10-16 Feb): 20% descuento
 * - Día de la Madre (1-15 Mayo): 15% descuento
 * - Black Friday (20-27 Nov): 25% descuento
 * - Navidad (15-26 Dic): 20% descuento
 */
@Injectable()
export class PromotionalPricingStrategy extends AbstractPricingStrategy {
  // Promociones configuradas para todos los años (solo mes y día)
  private promocionesBase: PromocionBase[] = [
    {
      codigo: 'VALENTINE',
      nombre: 'San Valentín',
      descuento: 20,
      mesInicio: 1, // Febrero (0-indexed)
      diaInicio: 10,
      mesFin: 1,
      diaFin: 16,
      activa: true,
    },
    {
      codigo: 'MOTHER',
      nombre: 'Día de la Madre',
      descuento: 15,
      mesInicio: 4, // Mayo
      diaInicio: 1,
      mesFin: 4,
      diaFin: 15,
      activa: true,
    },
    {
      codigo: 'BLACKFRIDAY',
      nombre: 'Black Friday',
      descuento: 25,
      mesInicio: 10, // Noviembre
      diaInicio: 20,
      mesFin: 10,
      diaFin: 27,
      activa: true,
    },
    {
      codigo: 'CHRISTMAS',
      nombre: 'Navidad',
      descuento: 20,
      mesInicio: 11, // Diciembre
      diaInicio: 15,
      mesFin: 11,
      diaFin: 26,
      activa: true,
    },
  ];

  getNombre(): string {
    return 'Promotional';
  }

  getDescripcion(): string {
    return 'Descuentos por promociones especiales (San Valentín, Día de la Madre, Black Friday, Navidad)';
  }

  esAplicable(context: PricingContext): boolean {
    return this.obtenerPromocionActiva(context.fechaAlquiler) !== null;
  }

  calcularPrecio(context: PricingContext): PricingResult {
    const precioBase = this.calcularPrecioBase(context.prendas);
    const promocion = this.obtenerPromocionActiva(context.fechaAlquiler);

    if (!promocion) {
      // No hay promoción activa
      return {
        precioBase: this.redondear(precioBase),
        descuento: 0,
        precioFinal: this.redondear(precioBase),
        detalles: 'No hay promociones activas',
      };
    }

    const descuento = this.calcularMontoDescuento(
      precioBase,
      promocion.descuento,
    );
    const precioFinal = precioBase - descuento;

    return {
      precioBase: this.redondear(precioBase),
      descuento: this.redondear(descuento),
      precioFinal: this.redondear(precioFinal),
      detalles: `Promoción ${promocion.nombre}: ${promocion.descuento}% de descuento`,
    };
  }

  /**
   * Obtiene la promoción activa para una fecha dada
   * Verifica solo mes y día, ignorando el año (funciona para cualquier año)
   * @param fecha - Fecha a verificar
   * @returns Promoción activa o null
   */
  private obtenerPromocionActiva(fecha: Date): Promocion | null {
    const mes = fecha.getMonth();
    const dia = fecha.getDate();

    const promoBase = this.promocionesBase.find((promo) => {
      if (!promo.activa) return false;

      // Verificar si la fecha cae dentro del rango de la promoción
      if (promo.mesInicio === promo.mesFin) {
        // Promoción dentro del mismo mes
        return (
          mes === promo.mesInicio && dia >= promo.diaInicio && dia <= promo.diaFin
        );
      } else {
        // Promoción que cruza meses
        return (
          (mes === promo.mesInicio && dia >= promo.diaInicio) ||
          (mes === promo.mesFin && dia <= promo.diaFin) ||
          (mes > promo.mesInicio && mes < promo.mesFin)
        );
      }
    });

    if (!promoBase) return null;

    // Convertir a Promocion con fechas del año de la fecha proporcionada
    const year = fecha.getFullYear();
    return {
      codigo: promoBase.codigo,
      nombre: promoBase.nombre,
      descuento: promoBase.descuento,
      fechaInicio: new Date(year, promoBase.mesInicio, promoBase.diaInicio),
      fechaFin: new Date(year, promoBase.mesFin, promoBase.diaFin),
      activa: promoBase.activa,
    };
  }

  /**
   * Obtiene todas las promociones configuradas
   * (para futuras extensiones o administración)
   */
  obtenerPromociones(): Array<{
    codigo: string;
    nombre: string;
    descuento: number;
    periodo: string;
  }> {
    return this.promocionesBase.map((promo) => ({
      codigo: promo.codigo,
      nombre: promo.nombre,
      descuento: promo.descuento,
      periodo: `${promo.diaInicio}/${promo.mesInicio + 1} - ${promo.diaFin}/${promo.mesFin + 1}`,
    }));
  }
}