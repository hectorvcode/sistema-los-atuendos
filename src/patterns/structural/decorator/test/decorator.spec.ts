// src/patterns/structural/decorator/test/decorator.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DecoratorService } from '../decorator.service';
import { PrendaLavanderiaBase } from '../prenda-lavanderia-base.component';
import { PrendaManchadaDecorator } from '../decorators/prenda-manchada.decorator';
import { PrendaDelicadaDecorator } from '../decorators/prenda-delicada.decorator';
import { PrioridadAdministrativaDecorator } from '../decorators/prioridad-administrativa.decorator';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity';
import { VestidoDama } from '../../../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../../../modules/prendas/entities/traje-caballero.entity';

describe('Decorator Pattern', () => {
  let service: DecoratorService;
  let mockPrendaRepository: Partial<Repository<Prenda>>;

  beforeEach(async () => {
    // Mock del repositorio de prendas
    mockPrendaRepository = {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.referencia === 'VD001') {
          const vestido = new VestidoDama();
          vestido.id = 1;
          vestido.referencia = 'VD001';
          vestido.color = 'Blanco';
          vestido.marca = 'Elegancia';
          vestido.talla = 'M';
          vestido.valorAlquiler = 300000;
          vestido.disponible = false;
          vestido.estado = 'requiere_lavado';
          vestido.tienePedreria = true;
          vestido.esLargo = true;
          vestido.cantidadPiezas = 3;
          vestido.descripcionPiezas = 'Vestido + velo + corona';
          return Promise.resolve(vestido);
        } else if (where.referencia === 'TC001') {
          const traje = new TrajeCaballero();
          traje.id = 2;
          traje.referencia = 'TC001';
          traje.color = 'Negro';
          traje.marca = 'Formal';
          traje.talla = 'L';
          traje.valorAlquiler = 200000;
          traje.disponible = false;
          traje.estado = 'requiere_lavado';
          traje.tipo = 'frac';
          traje.accesoriosIncluidos = 'Corbatín';
          return Promise.resolve(traje);
        }
        return Promise.resolve(null);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecoratorService,
        {
          provide: getRepositoryToken(Prenda),
          useValue: mockPrendaRepository,
        },
      ],
    }).compile();

    service = module.get<DecoratorService>(DecoratorService);
  });

  describe('PrendaLavanderiaBase', () => {
    it('should create base component correctly', async () => {
      const prendaLavanderia = await service.crearPrendaLavanderia('VD001');

      expect(prendaLavanderia.getReferencia()).toBe('VD001');
      expect(prendaLavanderia.getNombre()).toBe('Vestido VD001');
      expect(prendaLavanderia.necesitaLavado()).toBe(true);
    });

    it('should calculate base priority correctly for VestidoDama', async () => {
      const prendaLavanderia = await service.crearPrendaLavanderia('VD001');

      // VestidoDama: base 3 + pedrería 2 + largo 1 = 6
      expect(prendaLavanderia.calcularPrioridad()).toBe(6);
      expect(prendaLavanderia.getTipoLavado()).toBe('especializado'); // Por pedrería
    });

    it('should calculate base priority correctly for TrajeCaballero', async () => {
      const prendaLavanderia = await service.crearPrendaLavanderia('TC001');

      // TrajeCaballero: base 2 + frac 3 = 5
      expect(prendaLavanderia.calcularPrioridad()).toBe(5);
      expect(prendaLavanderia.getTipoLavado()).toBe('delicado'); // Por frac
    });
  });

  describe('PrendaManchadaDecorator', () => {
    let prendaBase: PrendaLavanderiaBase;

    beforeEach(async () => {
      prendaBase = (await service.crearPrendaLavanderia(
        'VD001',
      )) as PrendaLavanderiaBase;
    });

    it('should add mancha priority correctly', () => {
      const prendaManchada = new PrendaManchadaDecorator(
        prendaBase,
        'vino',
        'severa',
      );

      // Base: 6 + severa: 20 + vino: 12 = 38
      expect(prendaManchada.calcularPrioridad()).toBe(38);
      expect(prendaManchada.getTipoLavado()).toBe('especializado');

      const razones = prendaManchada.obtenerRazonesPrioridad();
      expect(razones).toContain('Prenda manchada (vino)');
      expect(razones).toContain('Gravedad: severa');
    });

    it('should handle different stain types', () => {
      const manchaSangre = new PrendaManchadaDecorator(
        prendaBase,
        'sangre',
        'severa',
      );
      const manchaSudor = new PrendaManchadaDecorator(
        prendaBase,
        'sudor',
        'leve',
      );

      // Sangre (severa) debería tener mayor prioridad que sudor (leve)
      expect(manchaSangre.calcularPrioridad()).toBeGreaterThan(
        manchaSudor.calcularPrioridad(),
      );

      const costoSangre = manchaSangre.getCosto();
      const costoSudor = manchaSudor.getCosto();
      expect(costoSangre).toBeGreaterThan(costoSudor);
    });
  });

  describe('PrendaDelicadaDecorator', () => {
    let prendaBase: PrendaLavanderiaBase;

    beforeEach(async () => {
      prendaBase = (await service.crearPrendaLavanderia(
        'TC001',
      )) as PrendaLavanderiaBase;
    });

    it('should add delicate priority correctly', () => {
      const prendaDelicada = new PrendaDelicadaDecorator(
        prendaBase,
        'seda',
        true, // requiere cuidado especial
      );

      // Base: 5 + incremento: 8 + cuidado especial: 12 + seda: 10 = 35
      expect(prendaDelicada.calcularPrioridad()).toBe(35);
      expect(prendaDelicada.getTipoLavado()).toBe('especializado');

      const razones = prendaDelicada.obtenerRazonesPrioridad();
      expect(razones).toContain('Prenda delicada: seda');
      expect(razones).toContain('Requiere cuidado especial');
    });

    it('should handle vintage items with high priority', () => {
      const prendaVintage = new PrendaDelicadaDecorator(
        prendaBase,
        'vintage',
        true,
      );
      const prendaNormal = new PrendaDelicadaDecorator(
        prendaBase,
        'material_normal',
        false,
      );

      expect(prendaVintage.calcularPrioridad()).toBeGreaterThan(
        prendaNormal.calcularPrioridad(),
      );
      expect(prendaVintage.getCosto()).toBeGreaterThan(prendaNormal.getCosto());
    });
  });

  describe('PrioridadAdministrativaDecorator', () => {
    let prendaBase: PrendaLavanderiaBase;

    beforeEach(async () => {
      prendaBase = (await service.crearPrendaLavanderia(
        'VD001',
      )) as PrendaLavanderiaBase;
    });

    it('should add administrative priority correctly', () => {
      const fechaLimite = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

      const prendaUrgente = new PrioridadAdministrativaDecorator(
        prendaBase,
        'urgente',
        'evento_vip',
        'Gerencia',
        fechaLimite,
      );

      // Base: 6 + urgente: 50 + evento_vip: 20 + fecha próxima: 25 = 101
      expect(prendaUrgente.calcularPrioridad()).toBe(101);

      const razones = prendaUrgente.obtenerRazonesPrioridad();
      expect(razones).toContain('Prioridad administrativa: URGENTE');
      expect(razones).toContain('Razón: evento_vip');
      expect(razones).toContain('Solicitado por: Gerencia');
    });

    it('should handle time-based priority', () => {
      const fechaCerca = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
      const fechaLejos = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 horas

      const prendaCerca = new PrioridadAdministrativaDecorator(
        prendaBase,
        'alta',
        'urgente',
        'Gerencia',
        fechaCerca,
      );
      const prendaLejos = new PrioridadAdministrativaDecorator(
        prendaBase,
        'alta',
        'urgente',
        'Gerencia',
        fechaLejos,
      );

      expect(prendaCerca.calcularPrioridad()).toBeGreaterThan(
        prendaLejos.calcularPrioridad(),
      );
    });
  });

  describe('Multiple Decorators (Chaining)', () => {
    it('should chain multiple decorators correctly', async () => {
      let prenda = await service.crearPrendaLavanderia('VD001');

      // Aplicar múltiples decoradores
      prenda = new PrendaManchadaDecorator(prenda, 'sangre', 'severa');
      prenda = new PrendaDelicadaDecorator(prenda, 'encaje', true);
      prenda = new PrioridadAdministrativaDecorator(
        prenda,
        'urgente',
        'evento_vip',
        'Gerencia',
      );

      // La prioridad debería ser muy alta (suma de todos los decoradores)
      expect(prenda.calcularPrioridad()).toBeGreaterThan(100);

      const razones = prenda.obtenerRazonesPrioridad();
      expect(razones.length).toBeGreaterThan(8); // Múltiples razones de todos los decoradores

      expect(prenda.getTipoLavado()).toBe('especializado');
    });

    it('should maintain original interface through all decorators', async () => {
      let prenda = await service.crearPrendaLavanderia('TC001');

      prenda = new PrendaManchadaDecorator(prenda, 'aceite', 'moderada');
      prenda = new PrioridadAdministrativaDecorator(
        prenda,
        'alta',
        'cliente_premium',
        'Supervisor',
      );

      // Métodos básicos deben seguir funcionando
      expect(prenda.getReferencia()).toBe('TC001');
      expect(prenda.getNombre()).toBe('Traje frac TC001');
      expect(prenda.necesitaLavado()).toBe(true);

      // Debe poder obtener detalles completos
      const detalle = prenda.obtenerDetalleCompleto();
      expect(detalle.referencia).toBe('TC001');
      expect(detalle.prioridad).toBeGreaterThan(0);
      expect(detalle.razones.length).toBeGreaterThan(3);
    });
  });

  describe('DecoratorService Integration', () => {
    it('should process solicitud with multiple configurations', async () => {
      const solicitud = {
        referenciaPrenda: 'VD001',
        configuraciones: {
          mancha: { tipo: 'vino', gravedad: 'severa' as const },
          delicada: { razon: 'pedreria', cuidadoEspecial: true },
          administrativa: {
            nivel: 'urgente' as const,
            razon: 'evento_vip',
            solicitadoPor: 'Gerencia',
          },
        },
      };

      const resultado = await service.procesarSolicitudLavanderia(solicitud);

      expect(resultado.getReferencia()).toBe('VD001');
      expect(resultado.calcularPrioridad()).toBeGreaterThan(100);
      expect(resultado.obtenerRazonesPrioridad().length).toBeGreaterThan(8);
    });

    it('should process multiple solicitudes and sort by priority', async () => {
      const solicitudes = [
        {
          referenciaPrenda: 'VD001',
          configuraciones: {
            administrativa: {
              nivel: 'media' as const,
              razon: 'normal',
              solicitadoPor: 'Supervisor',
            },
          },
        },
        {
          referenciaPrenda: 'TC001',
          configuraciones: {
            administrativa: {
              nivel: 'urgente' as const,
              razon: 'evento_vip',
              solicitadoPor: 'Gerencia',
            },
          },
        },
      ];

      const resultados =
        await service.procesarMultiplesSolicitudes(solicitudes);

      expect(resultados).toHaveLength(2);
      expect(resultados[0].calcularPrioridad()).toBeGreaterThan(
        resultados[1].calcularPrioridad(),
      );
    });

    it('should generate priority report correctly', async () => {
      const solicitudes = [
        await service.crearSolicitudManchaSevera('VD001', 'sangre'),
        await service.crearSolicitudDelicadaEspecial('TC001', 'seda'),
        await service.crearSolicitudUrgente('VD001', 'evento_vip', 'Gerencia'),
      ];

      const reporte = service.generarReportePrioridades(solicitudes);

      expect(reporte.totalPrendas).toBe(3);
      expect(reporte.prioridadPromedio).toBeGreaterThan(0);
      expect(reporte.costoTotal).toBeGreaterThan(0);
      expect(reporte.top5Prioridades).toHaveLength(3);
      expect(Object.keys(reporte.distribucionPorTipoLavado)).toContain(
        'especializado',
      );
    });
  });
});
