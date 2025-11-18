import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ClientesService } from '../services/clientes.service';
import { ClienteRepository } from '../repositories/cliente.repository';
import { CreateClienteDto } from '../dto';
import { Cliente } from '../entities/cliente.entity';

describe('ClientesService', () => {
  let service: ClientesService;
  let repository: ClienteRepository;

  const mockClienteRepository = {
    crear: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorIdentificacion: jest.fn(),
    buscarPorEmail: jest.fn(),
    buscarTodos: jest.fn(),
    buscarPorCriterios: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
    buscarServiciosPorCliente: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: ClienteRepository,
          useValue: mockClienteRepository,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    repository = module.get<ClienteRepository>(ClienteRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearCliente', () => {
    it('debería crear un cliente exitosamente', async () => {
      const createDto: CreateClienteDto = {
        numeroIdentificacion: '1234567890',
        nombre: 'Juan Pérez',
        direccion: 'Calle 123',
        telefono: '3001234567',
        correoElectronico: 'juan@email.com',
      };

      const clienteCreado = new Cliente();
      Object.assign(clienteCreado, createDto);
      clienteCreado.id = 1;

      mockClienteRepository.buscarPorIdentificacion.mockResolvedValue(null);
      mockClienteRepository.buscarPorEmail.mockResolvedValue(null);
      mockClienteRepository.crear.mockResolvedValue(clienteCreado);

      const resultado = await service.crearCliente(createDto);

      expect(resultado).toBeDefined();
      expect(
        mockClienteRepository.buscarPorIdentificacion,
      ).toHaveBeenCalledWith('1234567890');
      expect(mockClienteRepository.buscarPorEmail).toHaveBeenCalledWith(
        'juan@email.com',
      );
      expect(mockClienteRepository.crear).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si la identificación ya existe', async () => {
      const createDto: CreateClienteDto = {
        numeroIdentificacion: '1234567890',
        nombre: 'Juan Pérez',
        direccion: 'Calle 123',
        telefono: '3001234567',
        correoElectronico: 'juan@email.com',
      };

      const clienteExistente = new Cliente();
      clienteExistente.numeroIdentificacion = '1234567890';

      mockClienteRepository.buscarPorIdentificacion.mockResolvedValue(
        clienteExistente,
      );

      await expect(service.crearCliente(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      const createDto: CreateClienteDto = {
        numeroIdentificacion: '1234567890',
        nombre: 'Juan Pérez',
        direccion: 'Calle 123',
        telefono: '3001234567',
        correoElectronico: 'juan@email.com',
      };

      const clienteExistente = new Cliente();
      clienteExistente.correoElectronico = 'juan@email.com';

      mockClienteRepository.buscarPorIdentificacion.mockResolvedValue(null);
      mockClienteRepository.buscarPorEmail.mockResolvedValue(clienteExistente);

      await expect(service.crearCliente(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('buscarPorId', () => {
    it('debería retornar un cliente por su ID', async () => {
      const cliente = new Cliente();
      cliente.id = 1;
      cliente.nombre = 'Juan Pérez';

      mockClienteRepository.buscarPorId.mockResolvedValue(cliente);

      const resultado = await service.buscarPorId(1);

      expect(resultado).toBe(cliente);
      expect(mockClienteRepository.buscarPorId).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si el cliente no existe', async () => {
      mockClienteRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.buscarPorId(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminarCliente', () => {
    it('debería eliminar un cliente exitosamente', async () => {
      const cliente = new Cliente();
      cliente.id = 1;

      mockClienteRepository.buscarPorId.mockResolvedValue(cliente);
      mockClienteRepository.eliminar.mockResolvedValue(true);

      const resultado = await service.eliminarCliente(1);

      expect(resultado).toEqual({
        mensaje: 'Cliente con ID 1 eliminado exitosamente',
      });
      expect(mockClienteRepository.eliminar).toHaveBeenCalledWith(1);
    });

    it('debería lanzar NotFoundException si el cliente no existe', async () => {
      mockClienteRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.eliminarCliente(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
