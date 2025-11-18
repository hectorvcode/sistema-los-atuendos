import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, In } from 'typeorm';
import { ServicioAlquiler } from '../entities/servicio-alquiler.entity';
import {
  IServicioRepository,
  PaginationResult,
} from '../interfaces/servicio-repository.interface';

/**
 * ServicioRepository - Implementación del patrón Repository con Adapter
 * Adapta la interfaz de TypeORM a nuestra interfaz de dominio
 */
@Injectable()
export class ServicioRepository implements IServicioRepository {
  constructor(
    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
  ) {}

  async crear(servicio: ServicioAlquiler): Promise<ServicioAlquiler> {
    try {
      return await this.servicioRepository.save(servicio);
    } catch (error) {
      throw new Error(`Error al crear servicio: ${error.message}`);
    }
  }

  async buscarPorId(id: number): Promise<ServicioAlquiler | null> {
    try {
      return await this.servicioRepository.findOne({
        where: { id } as FindOptionsWhere<ServicioAlquiler>,
        relations: ['cliente', 'empleado', 'prendas'],
      });
    } catch (error) {
      throw new Error(`Error al buscar servicio por ID: ${error.message}`);
    }
  }

  async buscarPorNumero(numero: number): Promise<ServicioAlquiler | null> {
    try {
      return await this.servicioRepository.findOne({
        where: { numero } as FindOptionsWhere<ServicioAlquiler>,
        relations: ['cliente', 'empleado', 'prendas'],
      });
    } catch (error) {
      throw new Error(`Error al buscar servicio por número: ${error.message}`);
    }
  }

  async buscarPorFecha(
    fecha: Date,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    try {
      const skip = (pagina - 1) * limite;

      // Buscar servicios en la fecha especificada
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);

      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      const [data, total] = await this.servicioRepository.findAndCount({
        where: {
          fechaAlquiler: Between(fechaInicio, fechaFin) as any,
        },
        relations: ['cliente', 'empleado', 'prendas'],
        skip,
        take: limite,
        order: { numero: 'DESC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar servicios por fecha: ${error.message}`);
    }
  }

  async buscarPorRangoFechas(
    fechaDesde: Date,
    fechaHasta: Date,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.servicioRepository.findAndCount({
        where: {
          fechaAlquiler: Between(fechaDesde, fechaHasta) as any,
        },
        relations: ['cliente', 'empleado', 'prendas'],
        skip,
        take: limite,
        order: { fechaAlquiler: 'DESC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(
        `Error al buscar servicios por rango de fechas: ${error.message}`,
      );
    }
  }

  async buscarVigentesPorCliente(
    clienteId: number,
  ): Promise<ServicioAlquiler[]> {
    try {
      return await this.servicioRepository.find({
        where: {
          cliente: { id: clienteId },
          estado: In(['confirmado', 'entregado']),
        } as any,
        relations: ['cliente', 'empleado', 'prendas'],
        order: { fechaAlquiler: 'DESC' },
      });
    } catch (error) {
      throw new Error(
        `Error al buscar servicios vigentes del cliente: ${error.message}`,
      );
    }
  }

  async buscarPorCliente(
    clienteId: number,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.servicioRepository.findAndCount({
        where: {
          cliente: { id: clienteId },
        } as any,
        relations: ['cliente', 'empleado', 'prendas'],
        skip,
        take: limite,
        order: { fechaAlquiler: 'DESC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(
        `Error al buscar servicios por cliente: ${error.message}`,
      );
    }
  }

  async buscarPorEmpleado(
    empleadoId: number,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.servicioRepository.findAndCount({
        where: {
          empleado: { id: empleadoId },
        } as any,
        relations: ['cliente', 'empleado', 'prendas'],
        skip,
        take: limite,
        order: { fechaAlquiler: 'DESC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(
        `Error al buscar servicios por empleado: ${error.message}`,
      );
    }
  }

  async buscarPorEstado(
    estado: string,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.servicioRepository.findAndCount({
        where: { estado } as FindOptionsWhere<ServicioAlquiler>,
        relations: ['cliente', 'empleado', 'prendas'],
        skip,
        take: limite,
        order: { fechaAlquiler: 'DESC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar servicios por estado: ${error.message}`);
    }
  }

  async buscarTodos(
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.servicioRepository.findAndCount({
        relations: ['cliente', 'empleado', 'prendas'],
        skip,
        take: limite,
        order: { numero: 'DESC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar todos los servicios: ${error.message}`);
    }
  }

  async actualizar(
    id: number,
    datos: Partial<ServicioAlquiler>,
  ): Promise<ServicioAlquiler> {
    try {
      const servicio = await this.buscarPorId(id);

      if (!servicio) {
        throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
      }

      await this.servicioRepository.update(
        { id } as FindOptionsWhere<ServicioAlquiler>,
        datos,
      );

      const servicioActualizado = await this.buscarPorId(id);

      if (!servicioActualizado) {
        throw new Error('Error al recuperar servicio actualizado');
      }

      return servicioActualizado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al actualizar servicio: ${error.message}`);
    }
  }

  async eliminar(id: number): Promise<boolean> {
    try {
      const servicio = await this.buscarPorId(id);

      if (!servicio) {
        throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
      }

      const resultado = await this.servicioRepository.delete({
        id,
      } as FindOptionsWhere<ServicioAlquiler>);

      return (
        resultado.affected !== undefined &&
        resultado.affected !== null &&
        resultado.affected > 0
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al eliminar servicio: ${error.message}`);
    }
  }
}
