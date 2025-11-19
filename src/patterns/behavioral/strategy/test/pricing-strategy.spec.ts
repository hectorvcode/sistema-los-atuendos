import { Test, TestingModule } from '@nestjs/testing';
import { RegularPricingStrategy } from '../strategies/regular-pricing.strategy';
import { VipPricingStrategy } from '../strategies/vip-pricing.strategy';
import { SeasonalPricingStrategy } from '../strategies/seasonal-pricing.strategy';
import { BulkPricingStrategy } from '../strategies/bulk-pricing.strategy';
import { PromotionalPricingStrategy } from '../strategies/promotional-pricing.strategy';
import { PricingStrategyContext } from '../pricing-context';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity';
import { Cliente } from '../../../../modules/clientes/entities/cliente.entity';
import { PricingContext } from '../pricing-strategy.interface';

describe('Strategy Pattern - Pricing Strategies', () => {
  let regularStrategy: RegularPricingStrategy;
  let vipStrategy: VipPricingStrategy;
  let seasonalStrategy: SeasonalPricingStrategy;
  let bulkStrategy: BulkPricingStrategy;
  let promotionalStrategy: PromotionalPricingStrategy;
  let pricingContext: PricingStrategyContext;

  // Prendas de prueba
  const prenda1: Partial<Prenda> = {
    id: 1,
    referencia: 'VD-001',
    valorAlquiler: 100000,
  };

  const prenda2: Partial<Prenda> = {
    id: 2,
    referencia: 'TC-001',
    valorAlquiler: 150000,
  };

  const prenda3: Partial<Prenda> = {
    id: 3,
    referencia: 'DF-001',
    valorAlquiler: 80000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegularPricingStrategy,
        VipPricingStrategy,
        SeasonalPricingStrategy,
        BulkPricingStrategy,
        PromotionalPricingStrategy,
        PricingStrategyContext,
      ],
    }).compile();

    regularStrategy = module.get<RegularPricingStrategy>(
      RegularPricingStrategy,
    );
    vipStrategy = module.get<VipPricingStrategy>(VipPricingStrategy);
    seasonalStrategy = module.get<SeasonalPricingStrategy>(
      SeasonalPricingStrategy,
    );
    bulkStrategy = module.get<BulkPricingStrategy>(BulkPricingStrategy);
    promotionalStrategy = module.get<PromotionalPricingStrategy>(
      PromotionalPricingStrategy,
    );
    pricingContext = module.get<PricingStrategyContext>(
      PricingStrategyContext,
    );
  });

  describe('RegularPricingStrategy', () => {
    it('debe estar definida', () => {
      expect(regularStrategy).toBeDefined();
    });

    it('debe tener nombre "Regular"', () => {
      expect(regularStrategy.getNombre()).toBe('Regular');
    });

    it('debe calcular precio sin descuentos', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(),
      };

      const result = regularStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000); // 100000 + 150000
      expect(result.descuento).toBe(0);
      expect(result.precioFinal).toBe(250000);
      expect(result.detalles).toContain('2 prenda(s)');
    });

    it('debe ser siempre aplicable', () => {
      const context: PricingContext = {
        prendas: [prenda1] as Prenda[],
        fechaAlquiler: new Date(),
      };

      expect(regularStrategy.esAplicable(context)).toBe(true);
    });
  });

  describe('VipPricingStrategy', () => {
    const clienteVip: Partial<Cliente> = {
      id: 1,
      nombre: 'Cliente VIP',
      correoElectronico: 'cliente@vip.com',
    };

    const clienteNormal: Partial<Cliente> = {
      id: 2,
      nombre: 'Cliente Normal',
      correoElectronico: 'cliente@gmail.com',
    };

    it('debe estar definida', () => {
      expect(vipStrategy).toBeDefined();
    });

    it('debe tener nombre "VIP"', () => {
      expect(vipStrategy.getNombre()).toBe('VIP');
    });

    it('debe aplicar 15% de descuento a clientes VIP', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        cliente: clienteVip as Cliente,
        fechaAlquiler: new Date(),
      };

      const result = vipStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000);
      expect(result.descuento).toBe(37500); // 15% de 250000
      expect(result.precioFinal).toBe(212500);
      expect(result.detalles).toContain('VIP');
    });

    it('debe ser aplicable solo para clientes VIP', () => {
      const contextVip: PricingContext = {
        prendas: [prenda1] as Prenda[],
        cliente: clienteVip as Cliente,
        fechaAlquiler: new Date(),
      };

      const contextNormal: PricingContext = {
        prendas: [prenda1] as Prenda[],
        cliente: clienteNormal as Cliente,
        fechaAlquiler: new Date(),
      };

      expect(vipStrategy.esAplicable(contextVip)).toBe(true);
      expect(vipStrategy.esAplicable(contextNormal)).toBe(false);
    });

    it('no debe ser aplicable sin cliente', () => {
      const context: PricingContext = {
        prendas: [prenda1] as Prenda[],
        fechaAlquiler: new Date(),
      };

      expect(vipStrategy.esAplicable(context)).toBe(false);
    });
  });

  describe('SeasonalPricingStrategy', () => {
    it('debe estar definida', () => {
      expect(seasonalStrategy).toBeDefined();
    });

    it('debe tener nombre "Seasonal"', () => {
      expect(seasonalStrategy.getNombre()).toBe('Seasonal');
    });

    it('debe aplicar 0% de descuento en temporada alta (Diciembre)', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(2024, 11, 15), // Diciembre
      };

      const result = seasonalStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000);
      expect(result.descuento).toBe(0);
      expect(result.precioFinal).toBe(250000);
      expect(result.detalles).toContain('Alta');
    });

    it('debe aplicar 5% de descuento en temporada media (Marzo)', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(2024, 2, 15), // Marzo
      };

      const result = seasonalStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000);
      expect(result.descuento).toBe(12500); // 5% de 250000
      expect(result.precioFinal).toBe(237500);
      expect(result.detalles).toContain('Media');
    });

    it('debe aplicar 10% de descuento en temporada baja (Febrero)', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(2024, 1, 15), // Febrero
      };

      const result = seasonalStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000);
      expect(result.descuento).toBe(25000); // 10% de 250000
      expect(result.precioFinal).toBe(225000);
      expect(result.detalles).toContain('Baja');
    });

    it('debe ser siempre aplicable', () => {
      const context: PricingContext = {
        prendas: [prenda1] as Prenda[],
        fechaAlquiler: new Date(),
      };

      expect(seasonalStrategy.esAplicable(context)).toBe(true);
    });
  });

  describe('BulkPricingStrategy', () => {
    it('debe estar definida', () => {
      expect(bulkStrategy).toBeDefined();
    });

    it('debe tener nombre "Bulk"', () => {
      expect(bulkStrategy.getNombre()).toBe('Bulk');
    });

    it('debe aplicar 0% para 1-2 prendas', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(),
      };

      const result = bulkStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000);
      expect(result.descuento).toBe(0);
      expect(result.precioFinal).toBe(250000);
      expect(result.detalles).toContain('Básico');
    });

    it('debe aplicar 5% para 3-5 prendas', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2, prenda3] as Prenda[],
        fechaAlquiler: new Date(),
      };

      const result = bulkStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(330000); // 100000 + 150000 + 80000
      expect(result.descuento).toBe(16500); // 5% de 330000
      expect(result.precioFinal).toBe(313500);
      expect(result.detalles).toContain('3 prendas');
      expect(result.detalles).toContain('Medio');
    });

    it('debe aplicar 10% para 6-10 prendas', () => {
      const prendas = Array(6).fill(prenda1);
      const context: PricingContext = {
        prendas: prendas as Prenda[],
        fechaAlquiler: new Date(),
      };

      const result = bulkStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(600000);
      expect(result.descuento).toBe(60000); // 10% de 600000
      expect(result.precioFinal).toBe(540000);
      expect(result.detalles).toContain('Alto');
    });

    it('debe aplicar 15% para 11+ prendas', () => {
      const prendas = Array(11).fill(prenda1);
      const context: PricingContext = {
        prendas: prendas as Prenda[],
        fechaAlquiler: new Date(),
      };

      const result = bulkStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(1100000);
      expect(result.descuento).toBe(165000); // 15% de 1100000
      expect(result.precioFinal).toBe(935000);
      expect(result.detalles).toContain('Premium');
    });

    it('debe ser aplicable solo para 3+ prendas', () => {
      const context2: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(),
      };

      const context3: PricingContext = {
        prendas: [prenda1, prenda2, prenda3] as Prenda[],
        fechaAlquiler: new Date(),
      };

      expect(bulkStrategy.esAplicable(context2)).toBe(false);
      expect(bulkStrategy.esAplicable(context3)).toBe(true);
    });
  });

  describe('PromotionalPricingStrategy', () => {
    it('debe estar definida', () => {
      expect(promotionalStrategy).toBeDefined();
    });

    it('debe tener nombre "Promotional"', () => {
      expect(promotionalStrategy.getNombre()).toBe('Promotional');
    });

    it('debe aplicar 20% en promoción San Valentín', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(2024, 1, 14), // 14 Feb
      };

      const result = promotionalStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000);
      expect(result.descuento).toBe(50000); // 20% de 250000
      expect(result.precioFinal).toBe(200000);
      expect(result.detalles).toContain('San Valentín');
    });

    it('debe aplicar 25% en Black Friday', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(2024, 10, 25), // 25 Nov
      };

      const result = promotionalStrategy.calcularPrecio(context);

      expect(result.precioBase).toBe(250000);
      expect(result.descuento).toBe(62500); // 25% de 250000
      expect(result.precioFinal).toBe(187500);
      expect(result.detalles).toContain('Black Friday');
    });

    it('no debe aplicar descuento fuera de promociones', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        fechaAlquiler: new Date(2024, 8, 15), // 15 Sep (sin promoción)
      };

      const result = promotionalStrategy.calcularPrecio(context);

      expect(result.descuento).toBe(0);
      expect(result.detalles).toContain('No hay promociones');
    });

    it('debe ser aplicable solo durante fechas de promoción', () => {
      const contextPromo: PricingContext = {
        prendas: [prenda1] as Prenda[],
        fechaAlquiler: new Date(2024, 1, 14), // San Valentín
      };

      const contextNormal: PricingContext = {
        prendas: [prenda1] as Prenda[],
        fechaAlquiler: new Date(2024, 8, 15), // Sin promoción
      };

      expect(promotionalStrategy.esAplicable(contextPromo)).toBe(true);
      expect(promotionalStrategy.esAplicable(contextNormal)).toBe(false);
    });
  });

  describe('PricingStrategyContext', () => {
    it('debe estar definido', () => {
      expect(pricingContext).toBeDefined();
    });

    it('debe retornar todas las estrategias disponibles', () => {
      const estrategias = pricingContext.obtenerEstrategiasDisponibles();

      expect(estrategias).toHaveLength(5);
      expect(estrategias.map((e) => e.nombre)).toContain('Regular');
      expect(estrategias.map((e) => e.nombre)).toContain('VIP');
      expect(estrategias.map((e) => e.nombre)).toContain('Seasonal');
      expect(estrategias.map((e) => e.nombre)).toContain('Bulk');
      expect(estrategias.map((e) => e.nombre)).toContain('Promotional');
    });

    it('debe seleccionar la mejor estrategia automáticamente (Promotional)', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2, prenda3] as Prenda[],
        fechaAlquiler: new Date(2024, 1, 14), // San Valentín
      };

      const result = pricingContext.calcularMejorPrecio(context);

      // Debe usar Promotional (prioridad más alta)
      expect(result.detalles).toContain('San Valentín');
      expect(pricingContext.getEstrategiaActual().getNombre()).toBe(
        'Promotional',
      );
    });

    it('debe seleccionar VIP si no hay promoción y cliente es VIP', () => {
      const clienteVip: Partial<Cliente> = {
        id: 1,
        nombre: 'Cliente VIP',
        correoElectronico: 'test@vip.com',
      };

      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[],
        cliente: clienteVip as Cliente,
        fechaAlquiler: new Date(2024, 8, 15), // Sin promoción
      };

      const result = pricingContext.calcularMejorPrecio(context);

      expect(pricingContext.getEstrategiaActual().getNombre()).toBe('VIP');
      expect(result.detalles).toContain('VIP');
    });

    it('debe seleccionar Bulk si hay 3+ prendas y no hay VIP/Promo', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2, prenda3] as Prenda[],
        fechaAlquiler: new Date(2024, 8, 15), // Sin promoción
      };

      const result = pricingContext.calcularMejorPrecio(context);

      expect(pricingContext.getEstrategiaActual().getNombre()).toBe('Bulk');
    });

    it('debe seleccionar Seasonal si no aplican otras estrategias', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2] as Prenda[], // Solo 2 prendas (no bulk)
        fechaAlquiler: new Date(2024, 1, 20), // 20 Febrero (fuera de San Valentín, temporada baja)
      };

      const result = pricingContext.calcularMejorPrecio(context);

      expect(pricingContext.getEstrategiaActual().getNombre()).toBe(
        'Seasonal',
      );
    });

    it('debe permitir establecer estrategia manualmente', () => {
      pricingContext.setEstrategia(vipStrategy);

      const context: PricingContext = {
        prendas: [prenda1] as Prenda[],
        fechaAlquiler: new Date(),
      };

      const result = pricingContext.calcularPrecio(context);

      // Aunque el contexto no tenga cliente VIP, usa la estrategia forzada
      expect(pricingContext.getEstrategiaActual().getNombre()).toBe('VIP');
    });

    it('debe obtener estrategias aplicables para un contexto', () => {
      const context: PricingContext = {
        prendas: [prenda1, prenda2, prenda3] as Prenda[],
        fechaAlquiler: new Date(2024, 8, 15),
      };

      const aplicables = pricingContext.obtenerEstrategiasAplicables(context);

      // Regular, Seasonal y Bulk deben ser aplicables
      expect(aplicables.length).toBeGreaterThanOrEqual(3);
      expect(aplicables.map((e) => e.getNombre())).toContain('Regular');
      expect(aplicables.map((e) => e.getNombre())).toContain('Seasonal');
      expect(aplicables.map((e) => e.getNombre())).toContain('Bulk');
    });
  });
});