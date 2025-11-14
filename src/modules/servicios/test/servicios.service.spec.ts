import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiciosService } from '../services/servicios.service';
import { ServicioRepository } from '../repositories/servicio.repository';
import { ServicioAlquilerBuilder } from '../../../patterns/creational/builder/servicio-alquiler.builder';
import { CreateServicioAlquilerDto } from '../dto';
import { ServicioAlquiler } from '../entities/servicio-alquiler.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Prenda } from '../../prendas/entities/prenda.entity';

describe('ServiciosService', () => {
  let service: ServiciosService;
  let repository: ServicioRepository;
  let builder: ServicioAlquilerBuilder;

  const mockServicioRepository = {
    buscarPorId: jest.fn(),
    buscarPorNumero: jest.fn(),
    buscarPorFecha: jest.fn(),
    buscarVigentesPorCliente: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  const mockServicioAlquilerBuilder = {
    reset: jest.fn().mockReturnThis(),
    setCliente: jest.fn().mockReturnThis(),
    setEmpleado: jest.fn().mockReturnThis(),
    setFechaAlquiler: jest.fn().mockReturnThis(),
    agregarPrendas: jest.fn().mockReturnThis(),
    setObservaciones: jest.fn().mockReturnThis(),
    build: jest.fn(),
  };

  const mockPrendaRepository = {
    findByIds: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiciosService,
        {
          provide: ServicioRepository,
          useValue: mockServicioRepository,
        },
        {
          provide: ServicioAlquilerBuilder,
          useValue: mockServicioAlquilerBuilder,
        },
        {
          provide: getRepositoryToken(Prenda),
          useValue: mockPrendaRepository,
        },
      ],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
    repository = module.get<ServicioRepository>(ServicioRepository);
    builder = module.get<ServicioAlquilerBuilder>(ServicioAlquilerBuilder);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearServicio', () => {
    it('debería crear un servicio usando el Builder', async () => {
      // Usar una fecha futura válida
      const fechaFutura = new Date();
      fechaFutura.setDate(fechaFutura.getDate() + 30);
      const fechaFuturaISO = fechaFutura.toISOString().split('T')[0];

      const createDto: CreateServicioAlquilerDto = {
        clienteId: 1,
        empleadoId: 1,
        fechaAlquiler: fechaFuturaISO,
        prendasIds: [1, 2],
        observaciones: 'Test',
      };

      const prendasMock = [
        { id: 1, disponible: true, estado: 'disponible' } as Prenda,
        { id: 2, disponible: true, estado: 'disponible' } as Prenda,
      ];

      const servicioCreado = new ServicioAlquiler();
      servicioCreado.numero = 1001;

      mockPrendaRepository.findByIds.mockResolvedValue(prendasMock);
      mockServicioAlquilerBuilder.build.mockResolvedValue(servicioCreado);

      const resultado = await service.crearServicio(createDto);

      expect(resultado).toBeDefined();
      expect(mockPrendaRepository.findByIds).toHaveBeenCalledWith([1, 2]);
      expect(mockServicioAlquilerBuilder.reset).toHaveBeenCalled();
      expect(mockServicioAlquilerBuilder.setCliente).toHaveBeenCalledWith(1);
      expect(mockServicioAlquilerBuilder.setEmpleado).toHaveBeenCalledWith(1);
      expect(mockServicioAlquilerBuilder.agregarPrendas).toHaveBeenCalledWith([1, 2]);
      expect(mockServicioAlquilerBuilder.build).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la fecha es en el pasado', async () => {
      const createDto: CreateServicioAlquilerDto = {
        clienteId: 1,
        empleadoId: 1,
        fechaAlquiler: '2020-01-01',
        prendasIds: [1],
      };

      await expect(service.crearServicio(createDto)).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar BadRequestException si las prendas no están disponibles', async () => {
      const createDto: CreateServicioAlquilerDto = {
        clienteId: 1,
        empleadoId: 1,
        fechaAlquiler: '2025-02-15',
        prendasIds: [1],
      };

      const prendasMock = [
        { id: 1, disponible: false, estado: 'alquilada', referencia: 'VD-001' } as Prenda,
      ];

      mockPrendaRepository.findByIds.mockResolvedValue(prendasMock);

      await expect(service.crearServicio(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('buscarPorNumero', () => {
    it('debería retornar un servicio por su número', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1001;

      mockServicioRepository.buscarPorNumero.mockResolvedValue(servicio);

      const resultado = await service.buscarPorNumero(1001);

      expect(resultado).toBe(servicio);
      expect(mockServicioRepository.buscarPorNumero).toHaveBeenCalledWith(1001);
    });

    it('debería lanzar NotFoundException si el servicio no existe', async () => {
      mockServicioRepository.buscarPorNumero.mockResolvedValue(null);

      await expect(service.buscarPorNumero(9999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelarServicio', () => {
    it('debería cancelar un servicio y liberar prendas', async () => {
      const servicio = new ServicioAlquiler();
      servicio.id = 1;
      servicio.estado = 'confirmado';
      servicio.prendas = [
        { id: 1 } as Prenda,
        { id: 2 } as Prenda,
      ];

      mockServicioRepository.buscarPorId.mockResolvedValue(servicio);
      mockServicioRepository.actualizar.mockResolvedValue({
        ...servicio,
        estado: 'cancelado',
      });

      const resultado = await service.cancelarServicio(1);

      expect(resultado.estado).toBe('cancelado');
      expect(mockPrendaRepository.update).toHaveBeenCalledTimes(2);
      expect(mockServicioRepository.actualizar).toHaveBeenCalledWith(1, { estado: 'cancelado' });
    });
  });
});