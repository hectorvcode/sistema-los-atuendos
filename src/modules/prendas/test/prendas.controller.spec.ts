import { Test, TestingModule } from '@nestjs/testing';
import { PrendasController } from '../controllers/prendas.controller';
import { PrendasService } from '../services/prendas.service';
import { CreatePrendaDto } from '../dto';
import { VestidoDama } from '../entities/vestido-dama.entity';

describe('PrendasController', () => {
  let controller: PrendasController;
  let service: PrendasService;

  const mockPrendasService = {
    crearPrenda: jest.fn(),
    buscarPorReferencia: jest.fn(),
    buscarPrendas: jest.fn(),
    buscarPorTalla: jest.fn(),
    buscarPorTallaAgrupadoPorTipo: jest.fn(),
    getTiposDisponibles: jest.fn(),
    obtenerEstadisticas: jest.fn(),
    actualizarPrenda: jest.fn(),
    eliminarPrenda: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrendasController],
      providers: [
        {
          provide: PrendasService,
          useValue: mockPrendasService,
        },
      ],
    }).compile();

    controller = module.get<PrendasController>(PrendasController);
    service = module.get<PrendasService>(PrendasService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('crearPrenda', () => {
    it('debería crear una prenda', async () => {
      const createDto: CreatePrendaDto = {
        tipo: 'vestido-dama',
        referencia: 'VD-001',
        color: 'Rojo',
        marca: 'Elegance',
        talla: 'M',
        valorAlquiler: 150.5,
      };

      const prendaCreada = new VestidoDama();
      prendaCreada.referencia = 'VD-001';

      mockPrendasService.crearPrenda.mockResolvedValue(prendaCreada);

      const resultado = await controller.crearPrenda(createDto);

      expect(resultado).toBe(prendaCreada);
      expect(mockPrendasService.crearPrenda).toHaveBeenCalledWith(createDto);
    });
  });

  describe('buscarPorReferencia', () => {
    it('debería retornar una prenda por su referencia', async () => {
      const prenda = new VestidoDama();
      prenda.referencia = 'VD-001';

      mockPrendasService.buscarPorReferencia.mockResolvedValue(prenda);

      const resultado = await controller.buscarPorReferencia('VD-001');

      expect(resultado).toBe(prenda);
      expect(mockPrendasService.buscarPorReferencia).toHaveBeenCalledWith(
        'VD-001',
      );
    });
  });

  describe('buscarPorTalla', () => {
    it('debería retornar prendas por talla', async () => {
      const paginationResult = {
        data: [new VestidoDama()],
        total: 1,
        pagina: 1,
        limite: 10,
        totalPaginas: 1,
      };

      mockPrendasService.buscarPorTalla.mockResolvedValue(paginationResult);

      const resultado = await controller.buscarPorTalla('M', 1, 10);

      expect(resultado).toEqual(paginationResult);
      expect(mockPrendasService.buscarPorTalla).toHaveBeenCalledWith(
        'M',
        1,
        10,
      );
    });
  });

  describe('buscarPorTallaAgrupado', () => {
    it('debería retornar prendas agrupadas por tipo', async () => {
      const prendasAgrupadas = [
        {
          tipo: 'vestido-dama',
          prendas: [new VestidoDama()],
          cantidad: 1,
        },
      ];

      mockPrendasService.buscarPorTallaAgrupadoPorTipo.mockResolvedValue(
        prendasAgrupadas,
      );

      const resultado = await controller.buscarPorTallaAgrupado('M');

      expect(resultado).toEqual(prendasAgrupadas);
      expect(
        mockPrendasService.buscarPorTallaAgrupadoPorTipo,
      ).toHaveBeenCalledWith('M');
    });
  });

  describe('getTiposDisponibles', () => {
    it('debería retornar los tipos disponibles', () => {
      const tipos = ['vestido-dama', 'traje-caballero', 'disfraz'];
      mockPrendasService.getTiposDisponibles.mockReturnValue(tipos);

      const resultado = controller.getTiposDisponibles();

      expect(resultado).toEqual({ tipos });
      expect(mockPrendasService.getTiposDisponibles).toHaveBeenCalled();
    });
  });

  describe('obtenerEstadisticas', () => {
    it('debería retornar estadísticas de prendas', async () => {
      const estadisticas = {
        total: 10,
        disponibles: 7,
        alquiladas: 3,
        porTipo: {},
        porTalla: {},
      };

      mockPrendasService.obtenerEstadisticas.mockResolvedValue(estadisticas);

      const resultado = await controller.obtenerEstadisticas();

      expect(resultado).toEqual(estadisticas);
      expect(mockPrendasService.obtenerEstadisticas).toHaveBeenCalled();
    });
  });

  describe('actualizarPrenda', () => {
    it('debería actualizar una prenda', async () => {
      const prendaActualizada = new VestidoDama();
      prendaActualizada.referencia = 'VD-001';
      prendaActualizada.color = 'Azul';

      mockPrendasService.actualizarPrenda.mockResolvedValue(prendaActualizada);

      const resultado = await controller.actualizarPrenda('VD-001', {
        color: 'Azul',
      });

      expect(resultado).toBe(prendaActualizada);
      expect(mockPrendasService.actualizarPrenda).toHaveBeenCalledWith(
        'VD-001',
        { color: 'Azul' },
      );
    });
  });

  describe('eliminarPrenda', () => {
    it('debería eliminar una prenda', async () => {
      const respuesta = {
        mensaje: 'Prenda con referencia VD-001 eliminada exitosamente',
      };

      mockPrendasService.eliminarPrenda.mockResolvedValue(respuesta);

      const resultado = await controller.eliminarPrenda('VD-001');

      expect(resultado).toEqual(respuesta);
      expect(mockPrendasService.eliminarPrenda).toHaveBeenCalledWith('VD-001');
    });
  });
});
