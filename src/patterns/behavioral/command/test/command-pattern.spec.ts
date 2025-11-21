import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { CommandInvoker } from '../command-invoker';
import { CommandHistory } from '../command-history';
import { CommandFactory } from '../command.factory';
import { ConfirmarServicioCommand } from '../commands/confirmar-servicio.command';
import { EntregarServicioCommand } from '../commands/entregar-servicio.command';
import { DevolverServicioCommand } from '../commands/devolver-servicio.command';
import { CancelarServicioCommand } from '../commands/cancelar-servicio.command';

import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity';
import { ServicioStateContext } from '../../state/servicio-state-context';
import { Logger } from '@nestjs/common';

describe('Command Pattern - Unit Tests', () => {
  let commandInvoker: CommandInvoker;
  let commandHistory: CommandHistory;
  let commandFactory: CommandFactory;
  let servicioRepository: Repository<ServicioAlquiler>;
  let prendaRepository: Repository<Prenda>;
  let stateContext: ServicioStateContext;

  // Mock data
  const mockServicio: Partial<ServicioAlquiler> = {
    id: 1,
    numero: 1001,
    estado: 'pendiente',
    valorTotal: 150000,
    fechaAlquiler: new Date('2025-11-20'),
    fechaDevolucion: undefined,
    cliente: { id: 1, nombre: 'Juan Pérez' } as any,
    empleado: { id: 1, nombre: 'Carlos López' } as any,
    prendas: [
      { id: 1, referencia: 'VD-001', disponible: false } as Prenda,
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommandInvoker,
        CommandHistory,
        CommandFactory,
        Logger,
        {
          provide: getRepositoryToken(ServicioAlquiler),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Prenda),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: ServicioStateContext,
          useValue: {
            confirmar: jest.fn(),
            entregar: jest.fn(),
            devolver: jest.fn(),
            cancelar: jest.fn(),
          },
        },
      ],
    }).compile();

    commandInvoker = module.get<CommandInvoker>(CommandInvoker);
    commandHistory = module.get<CommandHistory>(CommandHistory);
    commandFactory = module.get<CommandFactory>(CommandFactory);
    servicioRepository = module.get<Repository<ServicioAlquiler>>(
      getRepositoryToken(ServicioAlquiler),
    );
    prendaRepository = module.get<Repository<Prenda>>(
      getRepositoryToken(Prenda),
    );
    stateContext = module.get<ServicioStateContext>(ServicioStateContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ConfirmarServicioCommand', () => {
    it('debe ejecutar el comando confirmar correctamente', async () => {
      const servicioMock = { ...mockServicio };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...servicioMock, estado: 'confirmado' } as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      const result = await command.execute();

      expect(result.estado).toBe('confirmado');
      expect(stateContext.confirmar).toHaveBeenCalledWith(servicioMock);
      expect(servicioRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el servicio no existe', async () => {
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(null);

      const command = commandFactory.createConfirmarServicioCommand(999);

      await expect(command.execute()).rejects.toThrow(NotFoundException);
      await expect(command.execute()).rejects.toThrow('Servicio con ID 999 no encontrado');
    });

    it('debe deshacer el comando confirmar correctamente', async () => {
      const servicioMock = { ...mockServicio, estado: 'pendiente' };
      const servicioConfirmado = { ...servicioMock, estado: 'confirmado' };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      await command.execute();
      await command.undo();

      expect(servicioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'pendiente' }),
      );
    });

    it('debe registrar el nombre del comando correctamente', () => {
      const command = commandFactory.createConfirmarServicioCommand(1);
      expect(command.getName()).toBe('ConfirmarServicioCommand');
    });

    it('debe retornar los parámetros del comando', () => {
      const command = commandFactory.createConfirmarServicioCommand(1);
      const params = command.getParams();
      expect(params).toEqual({ servicioId: 1 });
    });
  });

  describe('EntregarServicioCommand', () => {
    it('debe ejecutar el comando entregar correctamente', async () => {
      const servicioMock = { ...mockServicio, estado: 'confirmado' };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...servicioMock, estado: 'entregado' } as ServicioAlquiler);
      jest.spyOn(stateContext, 'entregar').mockResolvedValue(undefined);

      const command = commandFactory.createEntregarServicioCommand(1);
      const result = await command.execute();

      expect(result.estado).toBe('entregado');
      expect(stateContext.entregar).toHaveBeenCalledWith(servicioMock);
    });

    it('debe lanzar NotFoundException si el servicio no existe', async () => {
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(null);

      const command = commandFactory.createEntregarServicioCommand(999);

      await expect(command.execute()).rejects.toThrow(NotFoundException);
    });

    it('debe deshacer el comando entregar correctamente', async () => {
      const servicioMock = { ...mockServicio, estado: 'confirmado' };
      const servicioEntregado = { ...servicioMock, estado: 'entregado' };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler)
        .mockResolvedValueOnce(servicioEntregado as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioEntregado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler);
      jest.spyOn(stateContext, 'entregar').mockResolvedValue(undefined);

      const command = commandFactory.createEntregarServicioCommand(1);
      await command.execute();
      await command.undo();

      expect(servicioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'confirmado' }),
      );
    });

    it('debe retornar el nombre del comando correctamente', () => {
      const command = commandFactory.createEntregarServicioCommand(1);
      expect(command.getName()).toBe('EntregarServicioCommand');
    });
  });

  describe('DevolverServicioCommand', () => {
    it('debe ejecutar el comando devolver correctamente', async () => {
      const servicioMock = { ...mockServicio, estado: 'entregado', fechaDevolucion: undefined };
      const fechaDevolucion = new Date();
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as unknown as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({
        ...servicioMock,
        estado: 'devuelto',
        fechaDevolucion,
      } as ServicioAlquiler);
      jest.spyOn(stateContext, 'devolver').mockResolvedValue(undefined);

      const command = commandFactory.createDevolverServicioCommand(1);
      const result = await command.execute();

      expect(result.estado).toBe('devuelto');
      expect(result.fechaDevolucion).toBeDefined();
      expect(stateContext.devolver).toHaveBeenCalledWith(servicioMock);
    });

    it('debe lanzar NotFoundException si el servicio no existe', async () => {
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(null);

      const command = commandFactory.createDevolverServicioCommand(999);

      await expect(command.execute()).rejects.toThrow(NotFoundException);
    });

    it('debe deshacer el comando devolver y restaurar fecha de devolución', async () => {
      const servicioMock = { ...mockServicio, estado: 'entregado', fechaDevolucion: undefined };
      const fechaDevolucion = new Date();
      const servicioDevuelto = { ...servicioMock, estado: 'devuelto', fechaDevolucion };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioMock as unknown as ServicioAlquiler)
        .mockResolvedValueOnce(servicioDevuelto as unknown as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioDevuelto as ServicioAlquiler)
        .mockResolvedValueOnce(servicioMock as unknown as ServicioAlquiler);
      jest.spyOn(stateContext, 'devolver').mockResolvedValue(undefined);

      const command = commandFactory.createDevolverServicioCommand(1);
      await command.execute();
      await command.undo();

      const call = jest.spyOn(servicioRepository, 'save').mock.calls[1][0];
      expect(call.estado).toBe('entregado');
      expect(call.fechaDevolucion).toBeNull();
    });

    it('debe retornar el nombre del comando correctamente', () => {
      const command = commandFactory.createDevolverServicioCommand(1);
      expect(command.getName()).toBe('DevolverServicioCommand');
    });
  });

  describe('CancelarServicioCommand', () => {
    it('debe ejecutar el comando cancelar y liberar prendas', async () => {
      const servicioMock = {
        ...mockServicio,
        estado: 'pendiente',
        prendas: [{ id: 1, referencia: 'VD-001', disponible: false } as Prenda],
      };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...servicioMock, estado: 'cancelado' } as ServicioAlquiler);
      jest.spyOn(prendaRepository, 'save').mockResolvedValue([{ id: 1, disponible: true }] as any);
      jest.spyOn(stateContext, 'cancelar').mockResolvedValue(undefined);

      const command = commandFactory.createCancelarServicioCommand(1);
      const result = await command.execute();

      expect(result.estado).toBe('cancelado');
      expect(prendaRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ disponible: true }),
        ]),
      );
    });

    it('debe lanzar NotFoundException si el servicio no existe', async () => {
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(null);

      const command = commandFactory.createCancelarServicioCommand(999);

      await expect(command.execute()).rejects.toThrow(NotFoundException);
    });

    it('debe deshacer el comando cancelar y restaurar disponibilidad de prendas', async () => {
      const servicioMock = {
        ...mockServicio,
        estado: 'pendiente',
        prendas: [{ id: 1, referencia: 'VD-001', disponible: false } as Prenda],
      };
      const servicioCancelado = { ...servicioMock, estado: 'cancelado' };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler)
        .mockResolvedValueOnce(servicioCancelado as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioCancelado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler);
      jest.spyOn(prendaRepository, 'save').mockResolvedValue([{id: 1, disponible: false }] as any);
      jest.spyOn(stateContext, 'cancelar').mockResolvedValue(undefined);

      const command = commandFactory.createCancelarServicioCommand(1);
      await command.execute();
      await command.undo();

      expect(servicioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'pendiente' }),
      );
      expect(prendaRepository.save).toHaveBeenCalledTimes(2);
    });

    it('debe retornar el nombre del comando correctamente', () => {
      const command = commandFactory.createCancelarServicioCommand(1);
      expect(command.getName()).toBe('CancelarServicioCommand');
    });

    it('debe retornar los parámetros del comando', () => {
      const command = commandFactory.createCancelarServicioCommand(1);
      const params = command.getParams();
      expect(params).toHaveProperty('servicioId', 1);
    });
  });

  describe('CommandHistory', () => {
    it('debe agregar comandos al historial', async () => {
      const servicioMock = { ...mockServicio };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...servicioMock, estado: 'confirmado' } as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(command);

      expect(commandHistory.canUndo()).toBe(true);
      expect(commandHistory.getHistory()).toHaveLength(1);
    });

    it('debe limpiar el redo stack cuando se ejecuta un nuevo comando', async () => {
      const servicioMock = { ...mockServicio };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command1 = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(command1);
      await commandInvoker.undo();

      expect(commandHistory.canRedo()).toBe(true);

      const command2 = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(command2);

      expect(commandHistory.canRedo()).toBe(false);
    });

    it('debe limitar el historial a 50 comandos', async () => {
      const servicioMock = { ...mockServicio };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      // Ejecutar 51 comandos
      for (let i = 0; i < 51; i++) {
        const command = commandFactory.createConfirmarServicioCommand(1);
        await commandInvoker.execute(command);
      }

      const history = commandHistory.getHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });

    it('debe almacenar metadata de ejecución', async () => {
      const servicioMock = { ...mockServicio };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...mockServicio, estado: 'confirmado' } as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(command);

      const history = commandHistory.getHistory();
      expect(history[0]).toHaveProperty('commandName', 'ConfirmarServicioCommand');
      expect(history[0].params).toHaveProperty('servicioId', 1);
      expect(history[0]).toHaveProperty('executedAt');
      expect(history[0]).toHaveProperty('result');
    });

    it('debe retornar false en canUndo cuando no hay historial', () => {
      expect(commandHistory.canUndo()).toBe(false);
    });

    it('debe retornar false en canRedo cuando no hay comandos para rehacer', () => {
      expect(commandHistory.canRedo()).toBe(false);
    });
  });

  describe('CommandInvoker', () => {
    it('debe ejecutar comandos y registrarlos en el historial', async () => {
      const servicioMock = { ...mockServicio };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...servicioMock, estado: 'confirmado' } as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      const result = await commandInvoker.execute(command);

      expect(result.estado).toBe('confirmado');
      expect(commandInvoker.canUndo()).toBe(true);
    });

    it('debe deshacer comandos correctamente', async () => {
      const servicioMock = { ...mockServicio, estado: 'pendiente' };
      const servicioConfirmado = { ...servicioMock, estado: 'confirmado' };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(command);
      await commandInvoker.undo();

      expect(commandInvoker.canUndo()).toBe(false);
      expect(commandInvoker.canRedo()).toBe(true);
    });

    it('debe rehacer comandos correctamente', async () => {
      const servicioMock = { ...mockServicio, estado: 'pendiente' };
      const servicioConfirmado = { ...servicioMock, estado: 'confirmado' };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioMock as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(command);
      await commandInvoker.undo();
      await commandInvoker.redo();

      expect(commandInvoker.canUndo()).toBe(true);
      expect(commandInvoker.canRedo()).toBe(false);
    });

    it('debe retornar el historial de comandos', async () => {
      const servicioMock = { ...mockServicio };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...servicioMock, estado: 'confirmado' } as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(command);

      const history = commandInvoker.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].commandName).toBe('ConfirmarServicioCommand');
    });
  });

  describe('CommandFactory', () => {
    it('debe crear ConfirmarServicioCommand con las dependencias correctas', () => {
      const command = commandFactory.createConfirmarServicioCommand(1);

      expect(command).toBeInstanceOf(ConfirmarServicioCommand);
      expect(command.getName()).toBe('ConfirmarServicioCommand');
      expect(command.getParams()).toEqual({ servicioId: 1 });
    });

    it('debe crear EntregarServicioCommand con las dependencias correctas', () => {
      const command = commandFactory.createEntregarServicioCommand(1);

      expect(command).toBeInstanceOf(EntregarServicioCommand);
      expect(command.getName()).toBe('EntregarServicioCommand');
    });

    it('debe crear DevolverServicioCommand con las dependencias correctas', () => {
      const command = commandFactory.createDevolverServicioCommand(1);

      expect(command).toBeInstanceOf(DevolverServicioCommand);
      expect(command.getName()).toBe('DevolverServicioCommand');
    });

    it('debe crear CancelarServicioCommand con las dependencias correctas', () => {
      const command = commandFactory.createCancelarServicioCommand(1);

      expect(command).toBeInstanceOf(CancelarServicioCommand);
      expect(command.getName()).toBe('CancelarServicioCommand');
    });
  });

  describe('Integración con State Pattern', () => {
    it('debe delegar transiciones de estado al StateContext', async () => {
      const servicioMock = { ...mockServicio, estado: 'pendiente' };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(servicioRepository, 'save').mockResolvedValue({ ...servicioMock, estado: 'confirmado' } as ServicioAlquiler);
      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);

      const command = commandFactory.createConfirmarServicioCommand(1);
      await command.execute();

      expect(stateContext.confirmar).toHaveBeenCalledWith(servicioMock);
    });

    it('debe validar transiciones de estado a través del StateContext', async () => {
      const servicioMock = { ...mockServicio, estado: 'pendiente' };
      jest.spyOn(servicioRepository, 'findOne').mockResolvedValue(servicioMock as ServicioAlquiler);
      jest.spyOn(stateContext, 'entregar').mockRejectedValue(
        new Error('No se puede entregar un servicio en estado pendiente'),
      );

      const command = commandFactory.createEntregarServicioCommand(1);

      await expect(command.execute()).rejects.toThrow(
        'No se puede entregar un servicio en estado pendiente',
      );
    });
  });

  describe('Flujo completo de comandos', () => {
    it('debe completar el flujo: confirmar → entregar → devolver', async () => {
      const servicioInicial = { ...mockServicio, estado: 'pendiente', fechaDevolucion: null };
      const servicioConfirmado = { ...servicioInicial, estado: 'confirmado' };
      const servicioEntregado = { ...servicioConfirmado, estado: 'entregado' };
      const servicioDevuelto = { ...servicioEntregado, estado: 'devuelto', fechaDevolucion: new Date() };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioInicial as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioEntregado as ServicioAlquiler);

      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioEntregado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioDevuelto as ServicioAlquiler);

      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);
      jest.spyOn(stateContext, 'entregar').mockResolvedValue(undefined);
      jest.spyOn(stateContext, 'devolver').mockResolvedValue(undefined);

      // Confirmar
      const confirmarCmd = commandFactory.createConfirmarServicioCommand(1);
      const resultConfirmar = await commandInvoker.execute(confirmarCmd);
      expect(resultConfirmar.estado).toBe('confirmado');

      // Entregar
      const entregarCmd = commandFactory.createEntregarServicioCommand(1);
      const resultEntregar = await commandInvoker.execute(entregarCmd);
      expect(resultEntregar.estado).toBe('entregado');

      // Devolver
      const devolverCmd = commandFactory.createDevolverServicioCommand(1);
      const resultDevolver = await commandInvoker.execute(devolverCmd);
      expect(resultDevolver.estado).toBe('devuelto');
      expect(resultDevolver.fechaDevolucion).toBeDefined();

      expect(commandInvoker.getHistory()).toHaveLength(3);
    });

    it('debe deshacer múltiples comandos en orden inverso', async () => {
      const servicioInicial = { ...mockServicio, estado: 'pendiente' };
      const servicioConfirmado = { ...servicioInicial, estado: 'confirmado' };
      const servicioEntregado = { ...servicioConfirmado, estado: 'entregado' };

      jest.spyOn(servicioRepository, 'findOne')
        .mockResolvedValueOnce(servicioInicial as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioEntregado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler);

      jest.spyOn(servicioRepository, 'save')
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioEntregado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioConfirmado as ServicioAlquiler)
        .mockResolvedValueOnce(servicioInicial as ServicioAlquiler);

      jest.spyOn(stateContext, 'confirmar').mockResolvedValue(undefined);
      jest.spyOn(stateContext, 'entregar').mockResolvedValue(undefined);

      // Ejecutar comandos
      const confirmarCmd = commandFactory.createConfirmarServicioCommand(1);
      await commandInvoker.execute(confirmarCmd);

      const entregarCmd = commandFactory.createEntregarServicioCommand(1);
      await commandInvoker.execute(entregarCmd);

      expect(commandInvoker.getHistory()).toHaveLength(2);

      // Deshacer entregar
      await commandInvoker.undo();
      expect(servicioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'confirmado' }),
      );

      // Deshacer confirmar
      await commandInvoker.undo();
      expect(servicioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: 'pendiente' }),
      );

      expect(commandInvoker.canUndo()).toBe(false);
      expect(commandInvoker.canRedo()).toBe(true);
    });
  });
});