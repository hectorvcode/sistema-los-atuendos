import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompositeManagerService } from '../services/composite-manager.service.js';
import { ConjuntoBuilder } from '../builders/conjunto-builder.js';
import { PrendaSimpleComponent } from '../components/prenda-simple.component.js';
import { ConjuntoPrendasComponent } from '../components/conjunto-prendas.component.js';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity.js';
import { VestidoDama } from '../../../../modules/prendas/entities/vestido-dama.entity.js';

describe('Composite Pattern', () => {
  let service: CompositeManagerService;
  let builder: ConjuntoBuilder;
  let mockPrendaRepository: Partial<Repository<Prenda>>;

  beforeEach(async () => {
    // Mock del repositorio de prendas
    mockPrendaRepository = {
      findOne: jest.fn().mockImplementation(({ where }) => {
        const mockPrendas = {
          VD001: {
            id: 1,
            referencia: 'VD001',
            color: 'Blanco',
            marca: 'Elegancia',
            talla: 'M',
            valorAlquiler: 300000,
            disponible: true,
            estado: 'disponible',
            tienePedreria: true,
            esLargo: true,
            cantidadPiezas: 3,
            descripcionPiezas: 'Vestido + velo + corona',
          } as VestidoDama,
          ACC001: {
            id: 2,
            referencia: 'ACC001',
            color: 'Blanco',
            marca: 'Accesorios Elite',
            talla: 'Unico',
            valorAlquiler: 50000,
            disponible: true,
            estado: 'disponible',
          } as Prenda,
          ZAP001: {
            id: 3,
            referencia: 'ZAP001',
            color: 'Blanco',
            marca: 'Calzado Fino',
            talla: '37',
            valorAlquiler: 80000,
            disponible: true,
            estado: 'disponible',
          } as Prenda,
        };

        return Promise.resolve(mockPrendas[where.referencia] || null);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompositeManagerService,
        ConjuntoBuilder,
        {
          provide: getRepositoryToken(Prenda),
          useValue: mockPrendaRepository,
        },
      ],
    }).compile();

    service = module.get<CompositeManagerService>(CompositeManagerService);
    builder = module.get<ConjuntoBuilder>(ConjuntoBuilder);
  });

  describe('PrendaSimpleComponent', () => {
    let prendaSimple: PrendaSimpleComponent;
    let mockVestido: VestidoDama;

    beforeEach(() => {
      mockVestido = {
        id: 1,
        referencia: 'VD001',
        color: 'Blanco',
        marca: 'Elegancia',
        talla: 'M',
        valorAlquiler: 300000,
        disponible: true,
        estado: 'disponible',
        tienePedreria: true,
        esLargo: true,
        cantidadPiezas: 3,
        descripcionPiezas: 'Vestido + velo + corona',
      } as VestidoDama;

      prendaSimple = new PrendaSimpleComponent(mockVestido);
    });

    it('should create a simple component correctly', () => {
      expect(prendaSimple.getId()).toBe('prenda_1');
      expect(prendaSimple.getNombre()).toBe('Vestido VD001');
      expect(prendaSimple.esComposite()).toBe(false);
    });

    it('should calculate price and pieces correctly', () => {
      expect(prendaSimple.calcularPrecioTotal()).toBe(300000);
      expect(prendaSimple.contarPiezas()).toBe(3);
    });

    it('should handle availability operations', () => {
      expect(prendaSimple.verificarDisponibilidad()).toBe(true);

      prendaSimple.marcarComoAlquilado();
      expect(prendaSimple.verificarDisponibilidad()).toBe(false);

      prendaSimple.marcarComoDisponible();
      expect(prendaSimple.verificarDisponibilidad()).toBe(true);
    });

    it('should handle laundry operations', () => {
      expect(prendaSimple.necesitaLavado()).toBe(false);

      prendaSimple.marcarParaLavado();
      expect(prendaSimple.necesitaLavado()).toBe(true);

      // Vestido con pedrería y largo debería tener prioridad alta
      expect(prendaSimple.obtenerPrioridadLavado()).toBeGreaterThan(5);
    });

    it('should not allow child operations on leaf', () => {
      expect(prendaSimple.obtenerHijos()).toEqual([]);
      expect(() => prendaSimple.agregarHijo(prendaSimple)).toThrow();
    });

    it('should validate integrity correctly', () => {
      const validacion = prendaSimple.validarIntegridad();
      expect(validacion.valido).toBe(true);
      expect(validacion.errores).toHaveLength(0);
    });
  });

  describe('ConjuntoPrendasComponent', () => {
    let conjunto: ConjuntoPrendasComponent;
    let prenda1: PrendaSimpleComponent;
    let prenda2: PrendaSimpleComponent;

    beforeEach(() => {
      conjunto = new ConjuntoPrendasComponent(
        'conjunto_001',
        'Conjunto de Prueba',
      );

      const mockVestido = {
        id: 1,
        referencia: 'VD001',
        valorAlquiler: 300000,
        disponible: true,
        estado: 'disponible',
        cantidadPiezas: 3,
      } as VestidoDama;

      const mockAccesorio = {
        id: 2,
        referencia: 'ACC001',
        valorAlquiler: 50000,
        disponible: true,
        estado: 'disponible',
      } as Prenda;

      prenda1 = new PrendaSimpleComponent(mockVestido);
      prenda2 = new PrendaSimpleComponent(mockAccesorio);
    });

    it('should create a composite component correctly', () => {
      expect(conjunto.getId()).toBe('conjunto_001');
      expect(conjunto.getNombre()).toBe('Conjunto de Prueba');
      expect(conjunto.esComposite()).toBe(true);
    });

    it('should manage children correctly', () => {
      expect(conjunto.obtenerHijos()).toHaveLength(0);

      conjunto.agregarHijo(prenda1);
      expect(conjunto.obtenerHijos()).toHaveLength(1);

      conjunto.agregarHijo(prenda2);
      expect(conjunto.obtenerHijos()).toHaveLength(2);

      conjunto.removerHijo(prenda1);
      expect(conjunto.obtenerHijos()).toHaveLength(1);
    });

    it('should calculate totals recursively', () => {
      conjunto.agregarHijo(prenda1);
      conjunto.agregarHijo(prenda2);

      expect(conjunto.calcularPrecioTotal()).toBe(350000); // 300000 + 50000
      expect(conjunto.contarPiezas()).toBe(4); // 3 + 1
    });

    it('should handle availability recursively', () => {
      conjunto.agregarHijo(prenda1);
      conjunto.agregarHijo(prenda2);

      expect(conjunto.verificarDisponibilidad()).toBe(true);

      prenda1.marcarComoAlquilado();
      expect(conjunto.verificarDisponibilidad()).toBe(false);

      conjunto.marcarComoDisponible();
      expect(conjunto.verificarDisponibilidad()).toBe(true);
    });

    it('should search components by reference', () => {
      conjunto.agregarHijo(prenda1);
      conjunto.agregarHijo(prenda2);

      const encontrado = conjunto.buscarPorReferencia('VD001');
      expect(encontrado).toBe(prenda1);

      const noEncontrado = conjunto.buscarPorReferencia('INEXISTENTE');
      expect(noEncontrado).toBeNull();
    });

    it('should prevent circular references', () => {
      const subconjunto = new ConjuntoPrendasComponent(
        'sub_001',
        'Subconjunto',
      );
      conjunto.agregarHijo(subconjunto);

      expect(() => subconjunto.agregarHijo(conjunto)).toThrow(
        'referencia circular',
      );
    });

    it('should generate statistics correctly', () => {
      conjunto.agregarHijo(prenda1);
      conjunto.agregarHijo(prenda2);

      const stats = conjunto.obtenerEstadisticas();
      expect(stats.totalComponentes).toBe(2);
      expect(stats.totalPiezas).toBe(4);
      expect(stats.precioTotal).toBe(350000);
      expect(stats.componentesDisponibles).toBe(2);
    });
  });

  describe('ConjuntoBuilder', () => {
    it('should build a simple conjunto', async () => {
      const builderInstance = builder.iniciarConjunto({
        nombre: 'Conjunto Test',
        descripcion: 'Test conjunto',
        tipo: 'casual',
      });
      await builderInstance.agregarPrendaPorReferencia('VD001');
      const conjunto = builderInstance.build();

      expect(conjunto.getNombre()).toBe('Conjunto Test');
      expect(conjunto.calcularPrecioTotal()).toBe(300000);
      expect(conjunto.contarPiezas()).toBe(3);
    });

    it('should build conjunto with multiple items', async () => {
      const builderInstance = builder.iniciarConjunto({
        nombre: 'Conjunto Completo',
        tipo: 'gala',
      });
      await builderInstance.agregarPrendasPorReferencias([
        'VD001',
        'ACC001',
        'ZAP001',
      ]);
      const conjunto = builderInstance.build();

      expect(conjunto.calcularPrecioTotal()).toBe(430000); // 300000 + 50000 + 80000
      expect(conjunto.obtenerListaReferencias()).toContain('VD001');
      expect(conjunto.obtenerListaReferencias()).toContain('ACC001');
      expect(conjunto.obtenerListaReferencias()).toContain('ZAP001');
    });

    it('should validate before building', () => {
      builder.iniciarConjunto({ nombre: 'Test' });

      // Conjunto vacío debería fallar validación
      const validacion = builder.validarConjunto();
      expect(validacion.valido).toBe(false);
      expect(validacion.errores).toContain(
        'El conjunto debe tener al menos un componente hijo',
      );
    });
  });

  describe('CompositeManagerService', () => {
    it('should create and manage conjuntos', async () => {
      const resultado = await service.crearConjuntoConPrendas({
        nombre: 'Conjunto Gestión',
        descripcion: 'Test gestión',
        referencias: ['VD001', 'ACC001'],
      });

      expect(resultado.exito).toBe(true);
      expect(resultado.datos.referencias).toHaveLength(2);
    });

    it('should execute operations on conjuntos', async () => {
      // Crear conjunto
      const creacion = await service.crearConjuntoConPrendas({
        nombre: 'Test Ops',
        referencias: ['VD001'],
      });

      const conjuntoId = creacion.datos.id;

      // Ejecutar operaciones
      const precio = service.ejecutarOperacion(conjuntoId, {
        tipo: 'calcularPrecio',
      });
      expect(precio.exito).toBe(true);
      expect(precio.datos).toBe(300000);

      const disponibilidad = service.ejecutarOperacion(conjuntoId, {
        tipo: 'verificarDisponibilidad',
      });
      expect(disponibilidad.exito).toBe(true);
      expect(disponibilidad.datos).toBe(true);
    });

    it('should get statistics correctly', async () => {
      await service.crearConjuntoConPrendas({
        nombre: 'Stats Test',
        referencias: ['VD001', 'ACC001'],
      });

      const stats = service.obtenerEstadisticasGlobales();
      expect(stats.totalConjuntos).toBe(1);
      expect(stats.precioTotalGeneral).toBe(350000);
    });

    it('should search by reference across conjuntos', async () => {
      await service.crearConjuntoConPrendas({
        nombre: 'Search Test',
        referencias: ['VD001'],
      });

      const encontrados = service.buscarPorReferencia('VD001');
      expect(encontrados).toHaveLength(1);
    });
  });

  afterEach(() => {
    service.limpiarTodosLosConjuntos();
  });
});
