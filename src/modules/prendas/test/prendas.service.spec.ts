import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrendasService } from '../services/prendas.service';
import { PrendaRepository } from '../repositories/prenda.repository';
import { PrendaFactoryRegistry } from '../../../patterns/creational/factory/prenda-factory.registry';
import { CreatePrendaDto } from '../dto';
import { VestidoDama } from '../entities/vestido-dama.entity';

describe('PrendasService', () => {
  let service: PrendasService;
  let repository: PrendaRepository;
  let factory: PrendaFactoryRegistry;

  const mockPrendaRepository = {
    guardar: jest.fn(),
    buscarPorReferencia: jest.fn(),
    buscarPorTalla: jest.fn(),
    buscarPorTallaAgrupadoPorTipo: jest.fn(),
    buscarTodos: jest.fn(),
    buscarPorCriterios: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  const mockPrendaFactory = {
    getTiposDisponibles: jest.fn(),
    crearPrenda: jest.fn(),
    getFactory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrendasService,
        {
          provide: PrendaRepository,
          useValue: mockPrendaRepository,
        },
        {
          provide: PrendaFactoryRegistry,
          useValue: mockPrendaFactory,
        },
      ],
    }).compile();

    service = module.get<PrendasService>(PrendasService);
    repository = module.get<PrendaRepository>(PrendaRepository);
    factory = module.get<PrendaFactoryRegistry>(PrendaFactoryRegistry);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearPrenda', () => {
    it('debería crear una prenda exitosamente', async () => {
      const createDto: CreatePrendaDto = {
        tipo: 'vestido-dama',
        referencia: 'VD-001',
        color: 'Rojo',
        marca: 'Elegance',
        talla: 'M',
        valorAlquiler: 150.50,
        propiedadesEspecificas: {
          tienePedreria: true,
          esLargo: true,
          cantidadPiezas: 2,
        },
      };

      const prendaCreada = new VestidoDama();
      prendaCreada.referencia = 'VD-001';

      mockPrendaFactory.getTiposDisponibles.mockReturnValue([
        'vestido-dama',
        'traje-caballero',
        'disfraz',
      ]);
      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(null);
      mockPrendaFactory.crearPrenda.mockResolvedValue(prendaCreada);
      mockPrendaRepository.guardar.mockResolvedValue(prendaCreada);

      const resultado = await service.crearPrenda(createDto);

      expect(resultado).toBeDefined();
      expect(mockPrendaFactory.getTiposDisponibles).toHaveBeenCalled();
      expect(mockPrendaRepository.buscarPorReferencia).toHaveBeenCalledWith('VD-001');
      expect(mockPrendaFactory.crearPrenda).toHaveBeenCalledWith(
        'vestido-dama',
        expect.objectContaining({
          referencia: 'VD-001',
          color: 'Rojo',
          marca: 'Elegance',
          talla: 'M',
          valorAlquiler: 150.50,
          tienePedreria: true,
          esLargo: true,
          cantidadPiezas: 2,
        })
      );
      expect(mockPrendaRepository.guardar).toHaveBeenCalledWith(prendaCreada);
    });

    it('debería lanzar BadRequestException si el tipo de prenda es inválido', async () => {
      const createDto: CreatePrendaDto = {
        tipo: 'tipo-invalido',
        referencia: 'INV-001',
        color: 'Azul',
        marca: 'Test',
        talla: 'L',
        valorAlquiler: 100,
      };

      mockPrendaFactory.getTiposDisponibles.mockReturnValue([
        'vestido-dama',
        'traje-caballero',
        'disfraz',
      ]);

      await expect(service.crearPrenda(createDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar ConflictException si la referencia ya existe', async () => {
      const createDto: CreatePrendaDto = {
        tipo: 'vestido-dama',
        referencia: 'VD-001',
        color: 'Rojo',
        marca: 'Elegance',
        talla: 'M',
        valorAlquiler: 150.50,
      };

      const prendaExistente = new VestidoDama();
      prendaExistente.referencia = 'VD-001';

      mockPrendaFactory.getTiposDisponibles.mockReturnValue([
        'vestido-dama',
        'traje-caballero',
        'disfraz',
      ]);
      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(prendaExistente);

      await expect(service.crearPrenda(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('buscarPorReferencia', () => {
    it('debería retornar una prenda por su referencia', async () => {
      const prenda = new VestidoDama();
      prenda.referencia = 'VD-001';

      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(prenda);

      const resultado = await service.buscarPorReferencia('VD-001');

      expect(resultado).toBe(prenda);
      expect(mockPrendaRepository.buscarPorReferencia).toHaveBeenCalledWith('VD-001');
    });

    it('debería lanzar NotFoundException si la prenda no existe', async () => {
      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(null);

      await expect(service.buscarPorReferencia('NO-EXISTE')).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscarPorTalla', () => {
    it('debería retornar prendas por talla con paginación', async () => {
      const paginationResult = {
        data: [new VestidoDama(), new VestidoDama()],
        total: 2,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      };

      mockPrendaRepository.buscarPorTalla.mockResolvedValue(paginationResult);

      const resultado = await service.buscarPorTalla('M', 1, 10);

      expect(resultado).toEqual(paginationResult);
      expect(mockPrendaRepository.buscarPorTalla).toHaveBeenCalledWith('M', 1, 10);
    });

    it('debería lanzar BadRequestException si no se proporciona talla', async () => {
      await expect(service.buscarPorTalla('', 1, 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('buscarPorTallaAgrupadoPorTipo', () => {
    it('debería retornar prendas agrupadas por tipo', async () => {
      const prendasAgrupadas = [
        {
          tipo: 'vestido-dama',
          prendas: [new VestidoDama()],
          cantidad: 1,
        },
      ];

      mockPrendaRepository.buscarPorTallaAgrupadoPorTipo.mockResolvedValue(prendasAgrupadas);

      const resultado = await service.buscarPorTallaAgrupadoPorTipo('M');

      expect(resultado).toEqual(prendasAgrupadas);
      expect(mockPrendaRepository.buscarPorTallaAgrupadoPorTipo).toHaveBeenCalledWith('M');
    });

    it('debería lanzar BadRequestException si no se proporciona talla', async () => {
      await expect(service.buscarPorTallaAgrupadoPorTipo('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('actualizarPrenda', () => {
    it('debería actualizar una prenda exitosamente', async () => {
      const prendaExistente = new VestidoDama();
      prendaExistente.referencia = 'VD-001';

      const prendaActualizada = new VestidoDama();
      prendaActualizada.referencia = 'VD-001';
      prendaActualizada.color = 'Azul';

      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(prendaExistente);
      mockPrendaRepository.actualizar.mockResolvedValue(prendaActualizada);

      const resultado = await service.actualizarPrenda('VD-001', { color: 'Azul' });

      expect(resultado).toBe(prendaActualizada);
      expect(mockPrendaRepository.actualizar).toHaveBeenCalledWith(
        'VD-001',
        expect.objectContaining({ color: 'Azul' })
      );
    });

    it('debería lanzar NotFoundException si la prenda no existe', async () => {
      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(null);

      await expect(service.actualizarPrenda('NO-EXISTE', { color: 'Azul' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('eliminarPrenda', () => {
    it('debería eliminar una prenda exitosamente', async () => {
      const prenda = new VestidoDama();
      prenda.referencia = 'VD-001';

      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(prenda);
      mockPrendaRepository.eliminar.mockResolvedValue(true);

      const resultado = await service.eliminarPrenda('VD-001');

      expect(resultado).toEqual({
        mensaje: 'Prenda con referencia VD-001 eliminada exitosamente',
      });
      expect(mockPrendaRepository.eliminar).toHaveBeenCalledWith('VD-001');
    });

    it('debería lanzar NotFoundException si la prenda no existe', async () => {
      mockPrendaRepository.buscarPorReferencia.mockResolvedValue(null);

      await expect(service.eliminarPrenda('NO-EXISTE')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTiposDisponibles', () => {
    it('debería retornar los tipos de prendas disponibles', () => {
      const tipos = ['vestido-dama', 'traje-caballero', 'disfraz'];
      mockPrendaFactory.getTiposDisponibles.mockReturnValue(tipos);

      const resultado = service.getTiposDisponibles();

      expect(resultado).toEqual(tipos);
      expect(mockPrendaFactory.getTiposDisponibles).toHaveBeenCalled();
    });
  });
});