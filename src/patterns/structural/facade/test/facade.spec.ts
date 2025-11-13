// src/patterns/structural/facade/test/facade.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NegocioFacadeService } from '../services/negocio-facade.service';
import { CompositeManagerService } from '../../composite/services/composite-manager.service';
import { DecoratorService } from '../../decorator/decorator.service';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity';
import { Cliente } from '../../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../../modules/empleados/entities/empleado.entity';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

describe('Facade Pattern', () => {
  let service: NegocioFacadeService;
  let mockPrendaRepository: Partial<Repository<Prenda>>;
  let mockClienteRepository: Partial<Repository<Cliente>>;
  let mockEmpleadoRepository: Partial<Repository<Empleado>>;
  let mockServicioRepository: Partial<Repository<ServicioAlquiler>>;
  let mockCompositeManager: Partial<CompositeManagerService>;
  let mockDecoratorService: Partial<DecoratorService>;

  beforeEach(async () => {
    // Mock repositories
    mockPrendaRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    mockClienteRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    mockEmpleadoRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    mockServicioRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    // Mock services
    mockCompositeManager = {
      crearConjunto: jest.fn(),
      obtenerConjunto: jest.fn(),
    };

    mockDecoratorService = {
      procesarSolicitudLavanderia: jest.fn(),
      crearPrendaLavanderia: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NegocioFacadeService,
        {
          provide: getRepositoryToken(Prenda),
          useValue: mockPrendaRepository,
        },
        {
          provide: getRepositoryToken(Cliente),
          useValue: mockClienteRepository,
        },
        {
          provide: getRepositoryToken(Empleado),
          useValue: mockEmpleadoRepository,
        },
        {
          provide: getRepositoryToken(ServicioAlquiler),
          useValue: mockServicioRepository,
        },
        {
          provide: CompositeManagerService,
          useValue: mockCompositeManager,
        },
        {
          provide: DecoratorService,
          useValue: mockDecoratorService,
        },
      ],
    }).compile();

    service = module.get<NegocioFacadeService>(NegocioFacadeService);
  });

  describe('Registro de Entidades', () => {
    it('should registrar cliente successfully', async () => {
      const clienteData = {
        numeroIdentificacion: '12345678',
        nombre: 'Juan Pérez',
        direccion: 'Calle 123',
        telefono: '555-0123',
        correoElectronico: 'juan@email.com',
      };

      (mockClienteRepository.findOne as jest.Mock).mockResolvedValue(null);
      (mockClienteRepository.create as jest.Mock).mockReturnValue(clienteData);
      (mockClienteRepository.save as jest.Mock).mockResolvedValue({
        id: 1,
        ...clienteData,
      });

      const resultado = await service.registrarCliente(clienteData);

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('registrado exitosamente');
      expect(resultado.clienteId).toBe('1');
    });

    it('should not registrar cliente if already exists', async () => {
      const clienteData = {
        numeroIdentificacion: '12345678',
        nombre: 'Juan Pérez',
        direccion: 'Calle 123',
        telefono: '555-0123',
        correoElectronico: 'juan@email.com',
      };

      (mockClienteRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });

      const resultado = await service.registrarCliente(clienteData);

      expect(resultado.exito).toBe(false);
      expect(resultado.mensaje).toContain('Ya existe un cliente');
    });

    it('should registrar prenda successfully', async () => {
      const prendaData = {
        referencia: 'VD001',
        color: 'Blanco',
        marca: 'Elegancia',
        talla: 'M',
        valorAlquiler: 300000,
        tipo: 'vestido_dama' as const,
      };

      (mockPrendaRepository.findOne as jest.Mock).mockResolvedValue(null);
      (mockPrendaRepository.create as jest.Mock).mockReturnValue(prendaData);
      (mockPrendaRepository.save as jest.Mock).mockResolvedValue({
        id: 1,
        ...prendaData,
      });

      const resultado = await service.registrarPrenda(prendaData);

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('registrada exitosamente');
    });
  });

  describe('Operaciones de Alquiler', () => {
    it('should crear servicio alquiler successfully', async () => {
      const solicitud = {
        numeroIdentificacionCliente: '12345678',
        numeroIdentificacionEmpleado: '87654321',
        referenciasPrendas: ['VD001', 'ACC001'],
        fechaAlquiler: '2024-12-25',
      };

      const mockCliente = {
        id: 1,
        numeroIdentificacion: '12345678',
        nombre: 'Juan',
      };
      const mockEmpleado = {
        id: 2,
        numeroIdentificacion: '87654321',
        nombre: 'Ana',
      };
      const mockPrenda1 = {
        id: 1,
        referencia: 'VD001',
        valorAlquiler: 300000,
        disponible: true,
      };
      const mockPrenda2 = {
        id: 2,
        referencia: 'ACC001',
        valorAlquiler: 50000,
        disponible: true,
      };

      (mockClienteRepository.findOne as jest.Mock).mockResolvedValue(
        mockCliente,
      );
      (mockEmpleadoRepository.findOne as jest.Mock).mockResolvedValue(
        mockEmpleado,
      );
      (mockPrendaRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockPrenda1)
        .mockResolvedValueOnce(mockPrenda2);

      (mockServicioRepository.find as jest.Mock).mockResolvedValue([
        { numero: 100 },
      ]);
      (mockServicioRepository.create as jest.Mock).mockReturnValue({
        numero: 101,
      });
      (mockServicioRepository.save as jest.Mock).mockResolvedValue({
        numero: 101,
        valorTotal: 350000,
        estado: 'pendiente',
        fechaSolicitud: new Date(),
        fechaAlquiler: new Date('2024-12-25'),
      });

      const resultado = await service.crearServicioAlquiler(solicitud);

      expect(resultado.exito).toBe(true);
      expect(resultado.servicio).toBeDefined();
      expect(resultado.servicio?.numero).toBe(101);
      expect(resultado.servicio?.valorTotal).toBe(350000);
    });

    it('should fail crear servicio if client not found', async () => {
      const solicitud = {
        numeroIdentificacionCliente: '99999999',
        numeroIdentificacionEmpleado: '87654321',
        referenciasPrendas: ['VD001'],
        fechaAlquiler: '2024-12-25',
      };

      (mockClienteRepository.findOne as jest.Mock).mockResolvedValue(null);

      const resultado = await service.crearServicioAlquiler(solicitud);

      expect(resultado.exito).toBe(false);
      expect(resultado.errores).toContain(
        'Cliente con identificación 99999999 no encontrado',
      );
    });

    it('should confirmar servicio alquiler', async () => {
      const mockServicio = { numero: 101, estado: 'pendiente' };
      (mockServicioRepository.findOne as jest.Mock).mockResolvedValue(
        mockServicio,
      );
      (mockServicioRepository.save as jest.Mock).mockResolvedValue({
        ...mockServicio,
        estado: 'confirmado',
      });

      const resultado = await service.confirmarServicioAlquiler(101);

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('confirmado exitosamente');
    });
  });

  describe('Operaciones de Consulta', () => {
    it('should consultar servicio alquiler by number', async () => {
      const mockServicio = {
        numero: 101,
        estado: 'confirmado',
        valorTotal: 350000,
        fechaSolicitud: new Date(),
        fechaAlquiler: new Date(),
        cliente: { numeroIdentificacion: '12345678', nombre: 'Juan' },
        empleado: { numeroIdentificacion: '87654321', nombre: 'Ana' },
      };

      (mockServicioRepository.findOne as jest.Mock).mockResolvedValue(
        mockServicio,
      );
      (mockPrendaRepository.find as jest.Mock).mockResolvedValue([
        {
          referencia: 'VD001',
          color: 'Blanco',
          marca: 'Elegancia',
          valorAlquiler: 300000,
        },
      ]);

      const resultado = await service.consultarServicioAlquiler(101);

      expect(resultado).toBeDefined();
      expect(resultado?.numero).toBe(101);
      expect(resultado?.cliente.nombre).toBe('Juan');
    });

    it('should consultar prendas por talla', async () => {
      const mockPrendas = [
        { referencia: 'VD001', talla: 'M', tipo: 'vestido_dama' },
        { referencia: 'TC001', talla: 'M', tipo: 'traje_caballero' },
      ];

      (mockPrendaRepository.find as jest.Mock).mockResolvedValue(mockPrendas);

      const resultado = await service.consultarPrendasPorTalla('M');

      expect(resultado.vestidos).toHaveLength(1);
      expect(resultado.trajes).toHaveLength(1);
      expect(resultado.disfraces).toHaveLength(0);
    });
  });

  describe('Operaciones de Lavandería', () => {
    it('should registrar prenda para lavanderia', async () => {
      const solicitud = {
        referenciaPrenda: 'VD001',
        prioridad: 'alta' as const,
        razonPrioridad: 'Evento importante',
      };

      const mockPrendaLavanderia = {
        calcularPrioridad: jest.fn().mockReturnValue(25),
        obtenerDetalleCompleto: jest.fn().mockReturnValue({
          referencia: 'VD001',
          prioridad: 25,
        }),
      };

      (
        mockDecoratorService.procesarSolicitudLavanderia as jest.Mock
      ).mockResolvedValue(mockPrendaLavanderia);

      const resultado = await service.registrarPrendaParaLavanderia(solicitud);

      expect(resultado.exito).toBe(true);
      expect(resultado.mensaje).toContain('registrada para lavandería');
    });

    it('should visualizar cola lavanderia', async () => {
      const mockPrendas = [
        { referencia: 'VD001', estado: 'requiere_lavado' },
        { referencia: 'TC001', estado: 'requiere_lavado' },
      ];

      const mockPrendaLavanderia = {
        obtenerDetalleCompleto: jest.fn().mockReturnValue({
          referencia: 'VD001',
          prioridad: 15,
        }),
      };

      (mockPrendaRepository.find as jest.Mock).mockResolvedValue(mockPrendas);
      (
        mockDecoratorService.crearPrendaLavanderia as jest.Mock
      ).mockResolvedValue(mockPrendaLavanderia);

      const resultado = await service.visualizarColaLavanderia();

      expect(resultado.prendas).toHaveLength(2);
      expect(resultado.totalPendientes).toBe(2);
    });
  });

  describe('Operaciones de Estadísticas', () => {
    it('should obtener estadisticas negocio', async () => {
      (mockServicioRepository.count as jest.Mock).mockResolvedValue(50);
      (mockClienteRepository.count as jest.Mock).mockResolvedValue(25);
      (mockPrendaRepository.count as jest.Mock)
        .mockResolvedValueOnce(100) // disponibles
        .mockResolvedValueOnce(5); // en lavandería

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '1500000' }),
      };
      (mockServicioRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const resultado = await service.obtenerEstadisticasNegocio();

      expect(resultado.totalServicios).toBe(50);
      expect(resultado.clientesActivos).toBe(25);
      expect(resultado.prendasDisponibles).toBe(100);
      expect(resultado.ingresosTotales).toBe(1500000);
    });

    it('should calcular costo alquiler', async () => {
      const referencias = ['VD001', 'TC001'];
      const mockPrendas = [
        { referencia: 'VD001', valorAlquiler: 300000 },
        { referencia: 'TC001', valorAlquiler: 200000 },
      ];

      (mockPrendaRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockPrendas[0])
        .mockResolvedValueOnce(mockPrendas[1]);

      const resultado = await service.calcularCostoAlquiler(referencias);

      expect(resultado.costoTotal).toBe(500000);
      expect(resultado.detallesPrendas).toHaveLength(2);
    });
  });

  describe('Operaciones de Validación', () => {
    it('should validar disponibilidad prendas', async () => {
      const referencias = ['VD001', 'TC001', 'INEXISTENTE'];

      (mockPrendaRepository.findOne as jest.Mock)
        .mockResolvedValueOnce({ referencia: 'VD001', disponible: true })
        .mockResolvedValueOnce({ referencia: 'TC001', disponible: false })
        .mockResolvedValueOnce(null);

      const resultado = await service.validarDisponibilidadPrendas(referencias);

      expect(resultado.disponibles).toContain('VD001');
      expect(resultado.noDisponibles).toContain('TC001');
      expect(resultado.noDisponibles).toContain('INEXISTENTE');
    });

    it('should verificar estado cliente', async () => {
      const mockCliente = { id: 1, numeroIdentificacion: '12345678' };
      const mockServicios = [
        {
          numero: 101,
          fechaSolicitud: new Date(),
          valorTotal: 300000,
          estado: 'confirmado',
        },
      ];

      (mockClienteRepository.findOne as jest.Mock).mockResolvedValue(
        mockCliente,
      );
      (mockServicioRepository.count as jest.Mock).mockResolvedValue(2);
      (mockServicioRepository.find as jest.Mock).mockResolvedValue(
        mockServicios,
      );

      const resultado = await service.verificarEstadoCliente('12345678');

      expect(resultado.activo).toBe(true);
      expect(resultado.serviciosPendientes).toBe(2);
      expect(resultado.historial).toHaveLength(1);
    });
  });
});
