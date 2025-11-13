import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { ServicioAlquiler } from '../../servicios/entities/servicio-alquiler.entity';
import {
  IEmpleadoRepository,
  PaginationResult,
} from '../interfaces/empleado-repository.interface';

/**
 * EmpleadoRepository - Implementación del patrón Repository con Adapter
 */
@Injectable()
export class EmpleadoRepository implements IEmpleadoRepository {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,

    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
  ) {}

  async crear(empleado: Empleado): Promise<Empleado> {
    try {
      return await this.empleadoRepository.save(empleado);
    } catch (error) {
      throw new Error(`Error al crear empleado: ${error.message}`);
    }
  }

  async buscarPorId(id: number): Promise<Empleado | null> {
    try {
      return await this.empleadoRepository.findOne({
        where: { id } as FindOptionsWhere<Empleado>,
      });
    } catch (error) {
      throw new Error(`Error al buscar empleado por ID: ${error.message}`);
    }
  }

  async buscarPorIdentificacion(numeroIdentificacion: string): Promise<Empleado | null> {
    try {
      return await this.empleadoRepository.findOne({
        where: { numeroIdentificacion } as FindOptionsWhere<Empleado>,
      });
    } catch (error) {
      throw new Error(`Error al buscar empleado por identificación: ${error.message}`);
    }
  }

  async buscarPorEmail(correoElectronico: string): Promise<Empleado | null> {
    try {
      return await this.empleadoRepository.findOne({
        where: { correoElectronico } as FindOptionsWhere<Empleado>,
      });
    } catch (error) {
      throw new Error(`Error al buscar empleado por email: ${error.message}`);
    }
  }

  async buscarTodos(
    pagina: number = 1,
    limite: number = 10
  ): Promise<PaginationResult<Empleado>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.empleadoRepository.findAndCount({
        skip,
        take: limite,
        order: { nombre: 'ASC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar todos los empleados: ${error.message}`);
    }
  }

  async buscarPorCriterios(
    criterios: Partial<Empleado>,
    pagina: number = 1,
    limite: number = 10
  ): Promise<PaginationResult<Empleado>> {
    try {
      const skip = (pagina - 1) * limite;

      const where: any = {};

      if (criterios.nombre) {
        where.nombre = Like(`%${criterios.nombre}%`);
      }

      if (criterios.numeroIdentificacion) {
        where.numeroIdentificacion = criterios.numeroIdentificacion;
      }

      if (criterios.cargo) {
        where.cargo = Like(`%${criterios.cargo}%`);
      }

      if (criterios.activo !== undefined) {
        where.activo = criterios.activo;
      }

      const [data, total] = await this.empleadoRepository.findAndCount({
        where,
        skip,
        take: limite,
        order: { nombre: 'ASC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar empleados por criterios: ${error.message}`);
    }
  }

  async actualizar(id: number, datos: Partial<Empleado>): Promise<Empleado> {
    try {
      const empleado = await this.buscarPorId(id);

      if (!empleado) {
        throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
      }

      await this.empleadoRepository.update({ id } as FindOptionsWhere<Empleado>, datos);

      const empleadoActualizado = await this.buscarPorId(id);

      if (!empleadoActualizado) {
        throw new Error('Error al recuperar empleado actualizado');
      }

      return empleadoActualizado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al actualizar empleado: ${error.message}`);
    }
  }

  async eliminar(id: number): Promise<boolean> {
    try {
      const empleado = await this.buscarPorId(id);

      if (!empleado) {
        throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
      }

      const resultado = await this.empleadoRepository.delete({
        id
      } as FindOptionsWhere<Empleado>);

      return resultado.affected !== undefined && resultado.affected !== null && resultado.affected > 0;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al eliminar empleado: ${error.message}`);
    }
  }

  async buscarServiciosPorEmpleado(empleadoId: number): Promise<ServicioAlquiler[]> {
    try {
      return await this.servicioRepository.find({
        where: {
          empleado: { id: empleadoId },
        },
        relations: ['cliente', 'prendas'],
        order: { fechaAlquiler: 'DESC' },
      });
    } catch (error) {
      throw new Error(`Error al buscar servicios del empleado: ${error.message}`);
    }
  }
}