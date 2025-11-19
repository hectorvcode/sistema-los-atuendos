import { Injectable } from '@nestjs/common';
import { AbstractPricingStrategy } from '../abstract-pricing-strategy';
import { PricingContext, PricingResult } from '../pricing-strategy.interface';

/**
 * Estrategia de precio VIP
 * Aplica 15% de descuento para clientes que tienen correo con dominio especial
 * o han realizado más de cierta cantidad de alquileres
 *
 * Criterios VIP (configurable):
 * - Cliente con email corporativo (@vip.com, @premium.com)
 * - O cualquier cliente identificado como VIP (futura extensión)
 */
@Injectable()
export class VipPricingStrategy extends AbstractPricingStrategy {
  private readonly DESCUENTO_VIP = 15; // 15%
  private readonly DOMINIOS_VIP = ['vip.com', 'premium.com', 'platinum.com'];

  getNombre(): string {
    return 'VIP';
  }

  getDescripcion(): string {
    return `Descuento del ${this.DESCUENTO_VIP}% para clientes VIP`;
  }

  esAplicable(context: PricingContext): boolean {
    if (!context.cliente) {
      return false;
    }

    // Verificar si el cliente tiene email con dominio VIP
    const email = context.cliente.correoElectronico.toLowerCase();
    return this.DOMINIOS_VIP.some((dominio) => email.endsWith(`@${dominio}`));
  }

  calcularPrecio(context: PricingContext): PricingResult {
    const precioBase = this.calcularPrecioBase(context.prendas);
    const descuento = this.calcularMontoDescuento(
      precioBase,
      this.DESCUENTO_VIP,
    );
    const precioFinal = precioBase - descuento;

    return {
      precioBase: this.redondear(precioBase),
      descuento: this.redondear(descuento),
      precioFinal: this.redondear(precioFinal),
      detalles: `Cliente VIP: ${this.DESCUENTO_VIP}% de descuento aplicado`,
    };
  }
}