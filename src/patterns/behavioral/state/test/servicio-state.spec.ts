import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ServicioStateContext } from '../servicio-state-context';
import { PendingState } from '../states/pending-state';
import { ConfirmedState } from '../states/confirmed-state';
import { DeliveredState } from '../states/delivered-state';
import { ReturnedState } from '../states/returned-state';
import { CancelledState } from '../states/cancelled-state';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

describe('State Pattern - ServicioAlquiler', () => {
  let stateContext: ServicioStateContext;
  let servicio: ServicioAlquiler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicioStateContext,
        PendingState,
        ConfirmedState,
        DeliveredState,
        ReturnedState,
        CancelledState,
      ],
    }).compile();

    stateContext = module.get<ServicioStateContext>(ServicioStateContext);

    // Crear servicio de prueba
    servicio = new ServicioAlquiler();
    servicio.id = 1;
    servicio.numero = 1001;
    servicio.estado = 'pendiente';
    servicio.fechaAlquiler = new Date('2025-02-15');
    servicio.valorTotal = 100000;
  });

  describe('Estado Pendiente', () => {
    it('debe permitir confirmar', async () => {
      await stateContext.confirmar(servicio);
      expect(servicio.estado).toBe('confirmado');
    });

    it('debe permitir cancelar', async () => {
      await stateContext.cancelar(servicio);
      expect(servicio.estado).toBe('cancelado');
    });

    it('no debe permitir entregar', async () => {
      await expect(stateContext.entregar(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe permitir devolver', async () => {
      await expect(stateContext.devolver(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe permitir modificar', () => {
      expect(stateContext.puedeModificar(servicio)).toBe(true);
    });

    it('debe permitir eliminar', () => {
      expect(stateContext.puedeEliminar(servicio)).toBe(true);
    });

    it('debe retornar transiciones correctas', () => {
      const transiciones = stateContext.obtenerTransicionesPermitidas(servicio);
      expect(transiciones).toEqual(['confirmado', 'cancelado']);
    });
  });

  describe('Estado Confirmado', () => {
    beforeEach(() => {
      servicio.estado = 'confirmado';
    });

    it('debe permitir entregar', async () => {
      // Ajustar fecha para permitir entrega
      servicio.fechaAlquiler = new Date(Date.now() + 24 * 60 * 60 * 1000); // mañana
      await stateContext.entregar(servicio);
      expect(servicio.estado).toBe('entregado');
    });

    it('debe permitir cancelar', async () => {
      await stateContext.cancelar(servicio);
      expect(servicio.estado).toBe('cancelado');
    });

    it('no debe permitir confirmar nuevamente', async () => {
      await expect(stateContext.confirmar(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe permitir devolver', async () => {
      await expect(stateContext.devolver(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe permitir modificar', () => {
      expect(stateContext.puedeModificar(servicio)).toBe(true);
    });

    it('no debe permitir eliminar', () => {
      expect(stateContext.puedeEliminar(servicio)).toBe(false);
    });

    it('debe retornar transiciones correctas', () => {
      const transiciones = stateContext.obtenerTransicionesPermitidas(servicio);
      expect(transiciones).toEqual(['entregado', 'cancelado']);
    });

    it('no debe permitir entregar con más de 7 días de anticipación', async () => {
      servicio.fechaAlquiler = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 días
      await expect(stateContext.entregar(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Estado Entregado', () => {
    beforeEach(() => {
      servicio.estado = 'entregado';
    });

    it('debe permitir devolver', async () => {
      await stateContext.devolver(servicio);
      expect(servicio.estado).toBe('devuelto');
      expect(servicio.fechaDevolucion).toBeDefined();
    });

    it('no debe permitir confirmar', async () => {
      await expect(stateContext.confirmar(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe permitir entregar nuevamente', async () => {
      await expect(stateContext.entregar(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe permitir cancelar', async () => {
      await expect(stateContext.cancelar(servicio)).rejects.toThrow(
        'No se puede cancelar un servicio ya entregado',
      );
    });

    it('no debe permitir modificar', () => {
      expect(stateContext.puedeModificar(servicio)).toBe(false);
    });

    it('no debe permitir eliminar', () => {
      expect(stateContext.puedeEliminar(servicio)).toBe(false);
    });

    it('debe retornar transiciones correctas', () => {
      const transiciones = stateContext.obtenerTransicionesPermitidas(servicio);
      expect(transiciones).toEqual(['devuelto']);
    });
  });

  describe('Estado Devuelto', () => {
    beforeEach(() => {
      servicio.estado = 'devuelto';
      servicio.fechaDevolucion = new Date();
    });

    it('no debe permitir ninguna transición', async () => {
      await expect(stateContext.confirmar(servicio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(stateContext.entregar(servicio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(stateContext.devolver(servicio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(stateContext.cancelar(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe permitir modificar', () => {
      expect(stateContext.puedeModificar(servicio)).toBe(false);
    });

    it('no debe permitir eliminar', () => {
      expect(stateContext.puedeEliminar(servicio)).toBe(false);
    });

    it('debe retornar transiciones vacías', () => {
      const transiciones = stateContext.obtenerTransicionesPermitidas(servicio);
      expect(transiciones).toEqual([]);
    });
  });

  describe('Estado Cancelado', () => {
    beforeEach(() => {
      servicio.estado = 'cancelado';
    });

    it('no debe permitir ninguna transición', async () => {
      await expect(stateContext.confirmar(servicio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(stateContext.entregar(servicio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(stateContext.devolver(servicio)).rejects.toThrow(
        BadRequestException,
      );
      await expect(stateContext.cancelar(servicio)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('no debe permitir modificar', () => {
      expect(stateContext.puedeModificar(servicio)).toBe(false);
    });

    it('debe permitir eliminar', () => {
      expect(stateContext.puedeEliminar(servicio)).toBe(true);
    });

    it('debe retornar transiciones vacías', () => {
      const transiciones = stateContext.obtenerTransicionesPermitidas(servicio);
      expect(transiciones).toEqual([]);
    });
  });

  describe('obtenerInformacionEstado', () => {
    it('debe retornar información completa para estado pendiente', () => {
      const info = stateContext.obtenerInformacionEstado(servicio);
      expect(info).toEqual({
        estadoActual: 'pendiente',
        puedeModificar: true,
        puedeEliminar: true,
        transicionesPermitidas: ['confirmado', 'cancelado'],
      });
    });

    it('debe retornar información completa para estado confirmado', () => {
      servicio.estado = 'confirmado';
      const info = stateContext.obtenerInformacionEstado(servicio);
      expect(info).toEqual({
        estadoActual: 'confirmado',
        puedeModificar: true,
        puedeEliminar: false,
        transicionesPermitidas: ['entregado', 'cancelado'],
      });
    });
  });

  describe('validarTransicion', () => {
    it('debe validar correctamente transiciones permitidas', () => {
      expect(stateContext.validarTransicion(servicio, 'confirmado')).toBe(true);
      expect(stateContext.validarTransicion(servicio, 'cancelado')).toBe(true);
      expect(stateContext.validarTransicion(servicio, 'entregado')).toBe(false);
      expect(stateContext.validarTransicion(servicio, 'devuelto')).toBe(false);
    });

    it('debe validar correctamente desde estado confirmado', () => {
      servicio.estado = 'confirmado';
      expect(stateContext.validarTransicion(servicio, 'entregado')).toBe(true);
      expect(stateContext.validarTransicion(servicio, 'cancelado')).toBe(true);
      expect(stateContext.validarTransicion(servicio, 'confirmado')).toBe(
        false,
      );
      expect(stateContext.validarTransicion(servicio, 'devuelto')).toBe(false);
    });
  });

  describe('Flujo completo', () => {
    it('debe completar el flujo exitoso: pendiente → confirmado → entregado → devuelto', async () => {
      // Pendiente → Confirmado
      expect(servicio.estado).toBe('pendiente');
      await stateContext.confirmar(servicio);
      expect(servicio.estado).toBe('confirmado');

      // Confirmado → Entregado
      servicio.fechaAlquiler = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await stateContext.entregar(servicio);
      expect(servicio.estado).toBe('entregado');

      // Entregado → Devuelto
      await stateContext.devolver(servicio);
      expect(servicio.estado).toBe('devuelto');
      expect(servicio.fechaDevolucion).toBeDefined();
    });

    it('debe completar el flujo de cancelación: pendiente → cancelado', async () => {
      expect(servicio.estado).toBe('pendiente');
      await stateContext.cancelar(servicio);
      expect(servicio.estado).toBe('cancelado');
    });

    it('debe completar el flujo de cancelación tardía: pendiente → confirmado → cancelado', async () => {
      expect(servicio.estado).toBe('pendiente');
      await stateContext.confirmar(servicio);
      expect(servicio.estado).toBe('confirmado');
      await stateContext.cancelar(servicio);
      expect(servicio.estado).toBe('cancelado');
    });
  });
});
