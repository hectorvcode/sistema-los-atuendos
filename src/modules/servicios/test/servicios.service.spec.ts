import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServiciosService } from '../services/servicios.service';
import { ServicioRepository } from '../repositories/servicio.repository';
import { ServicioAlquilerBuilder } from '../../../patterns/creational/builder/servicio-alquiler.builder';
import { CreateServicioAlquilerDto } from '../dto';
import { ServicioAlquiler } from '../entities/servicio-alquiler.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Prenda } from '../../prendas/entities/prenda.entity';
import { ServicioStateContext } from '../../../patterns/behavioral/state/servicio-state-context';
import { CommandInvoker } from '../../../patterns/behavioral/command/command-invoker';
import { CommandFactory } from '../../../patterns/behavioral/command/command.factory';
import { ServicioSubject } from '../../../patterns/behavioral/observer/servicio-subject';

describe('ServiciosService', () => {
  let service: ServiciosService;
  let repository: ServicioRepository;
  let builder: ServicioAlquilerBuilder;
  let module: TestingModule;
  let commandFactory: CommandFactory;
  let commandInvoker: CommandInvoker;

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
    find: jest.fn(),
    findByIds: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
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
        {
          provide: ServicioStateContext,
          useValue: {
            confirmar: jest.fn(),
            entregar: jest.fn(),
            devolver: jest.fn(),
            cancelar: jest.fn(),
            puedeModificar: jest.fn().mockReturnValue(true),
            puedeEliminar: jest.fn().mockReturnValue(true),
            obtenerInformacionEstado: jest.fn().mockReturnValue({
              estadoActual: 'pendiente',
              puedeModificar: true,
              puedeEliminar: true,
              transicionesPermitidas: ['confirmado', 'cancelado'],
            }),
          },
        },
        {
          provide: CommandInvoker,
          useValue: {
            execute: jest.fn(),
            undo: jest.fn(),
            redo: jest.fn(),
            canUndo: jest.fn().mockReturnValue(false),
            canRedo: jest.fn().mockReturnValue(false),
            getHistory: jest.fn().mockReturnValue([]),
          },
        },
        {
          provide: CommandFactory,
          useValue: {
            createConfirmarServicioCommand: jest.fn(),
            createEntregarServicioCommand: jest.fn(),
            createDevolverServicioCommand: jest.fn(),
            createCancelarServicioCommand: jest.fn(),
          },
        },
        {
          provide: ServicioSubject,
          useValue: {
            notify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
    repository = module.get<ServicioRepository>(ServicioRepository);
    builder = module.get<ServicioAlquilerBuilder>(ServicioAlquilerBuilder);
    commandFactory = module.get<CommandFactory>(CommandFactory);
    commandInvoker = module.get<CommandInvoker>(CommandInvoker);

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

      mockPrendaRepository.find.mockResolvedValue(prendasMock);
      mockServicioAlquilerBuilder.build.mockResolvedValue(servicioCreado);

      const resultado = await service.crearServicio(createDto);

      expect(resultado).toBeDefined();
      expect(mockPrendaRepository.find).toHaveBeenCalled();
      expect(mockServicioAlquilerBuilder.reset).toHaveBeenCalled();
      expect(mockServicioAlquilerBuilder.setCliente).toHaveBeenCalledWith(1);
      expect(mockServicioAlquilerBuilder.setEmpleado).toHaveBeenCalledWith(1);
      expect(mockServicioAlquilerBuilder.agregarPrendas).toHaveBeenCalledWith([
        1, 2,
      ]);
      expect(mockServicioAlquilerBuilder.build).toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException si la fecha es en el pasado', async () => {
      const createDto: CreateServicioAlquilerDto = {
        clienteId: 1,
        empleadoId: 1,
        fechaAlquiler: '2020-01-01',
        prendasIds: [1],
      };

      await expect(service.crearServicio(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar BadRequestException si las prendas no están disponibles', async () => {
      const createDto: CreateServicioAlquilerDto = {
        clienteId: 1,
        empleadoId: 1,
        fechaAlquiler: '2025-02-15',
        prendasIds: [1],
      };

      const prendasMock = [
        {
          id: 1,
          disponible: false,
          estado: 'alquilada',
          referencia: 'VD-001',
        } as Prenda,
      ];

      mockPrendaRepository.findByIds.mockResolvedValue(prendasMock);

      await expect(service.crearServicio(createDto)).rejects.toThrow(
        BadRequestException,
      );
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

      await expect(service.buscarPorNumero(9999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelarServicio', () => {
    it('debería cancelar un servicio usando Command Pattern', async () => {
      const servicioCancelado = new ServicioAlquiler();
      servicioCancelado.id = 1;
      servicioCancelado.estado = 'cancelado';
      servicioCancelado.prendas = [{ id: 1 } as Prenda, { id: 2 } as Prenda];

      const mockCommand = {
        execute: jest.fn().mockResolvedValue(servicioCancelado),
        undo: jest.fn(),
      };

      (commandFactory.createCancelarServicioCommand as jest.Mock).mockReturnValue(mockCommand);
      (commandInvoker.execute as jest.Mock).mockResolvedValue(servicioCancelado);

      const resultado = await service.cancelarServicio(1);

      expect(resultado.estado).toBe('cancelado');
      expect(commandFactory.createCancelarServicioCommand).toHaveBeenCalledWith(1);
      expect(commandInvoker.execute).toHaveBeenCalledWith(mockCommand);
    });
  });
});
