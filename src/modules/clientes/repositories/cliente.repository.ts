import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
import { ServicioAlquiler } from '../../servicios/entities/servicio-alquiler.entity';
import {
  IClienteRepository,
  PaginationResult,
} from '../interfaces/cliente-repository.interface';

/**
 * ClienteRepository - Implementación del patrón Repository con Adapter
 * Adapta la interfaz de TypeORM a nuestra interfaz de dominio
 */
@Injectable()
export class ClienteRepository implements IClienteRepository {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
  ) {}

  async crear(cliente: Cliente): Promise<Cliente> {
    try {
      return await this.clienteRepository.save(cliente);
    } catch (error) {
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
  }

  async buscarPorId(id: number): Promise<Cliente | null> {
    try {
      return await this.clienteRepository.findOne({
        where: { id } as FindOptionsWhere<Cliente>,
      });
    } catch (error) {
      throw new Error(`Error al buscar cliente por ID: ${error.message}`);
    }
  }

  async buscarPorIdentificacion(
    numeroIdentificacion: string,
  ): Promise<Cliente | null> {
    try {
      return await this.clienteRepository.findOne({
        where: { numeroIdentificacion } as FindOptionsWhere<Cliente>,
      });
    } catch (error) {
      throw new Error(
        `Error al buscar cliente por identificación: ${error.message}`,
      );
    }
  }

  async buscarPorEmail(correoElectronico: string): Promise<Cliente | null> {
    try {
      return await this.clienteRepository.findOne({
        where: { correoElectronico } as FindOptionsWhere<Cliente>,
      });
    } catch (error) {
      throw new Error(`Error al buscar cliente por email: ${error.message}`);
    }
  }

  async buscarTodos(
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<Cliente>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.clienteRepository.findAndCount({
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
      throw new Error(`Error al buscar todos los clientes: ${error.message}`);
    }
  }

  async buscarPorCriterios(
    criterios: Partial<Cliente>,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<Cliente>> {
    try {
      const skip = (pagina - 1) * limite;

      // Construir where dinámico
      const where: any = {};

      if (criterios.nombre) {
        where.nombre = Like(`%${criterios.nombre}%`);
      }

      if (criterios.numeroIdentificacion) {
        where.numeroIdentificacion = criterios.numeroIdentificacion;
      }

      if (criterios.activo !== undefined) {
        where.activo = criterios.activo;
      }

      const [data, total] = await this.clienteRepository.findAndCount({
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
      throw new Error(
        `Error al buscar clientes por criterios: ${error.message}`,
      );
    }
  }

  async actualizar(id: number, datos: Partial<Cliente>): Promise<Cliente> {
    try {
      const cliente = await this.buscarPorId(id);

      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      await this.clienteRepository.update(
        { id } as FindOptionsWhere<Cliente>,
        datos,
      );

      const clienteActualizado = await this.buscarPorId(id);

      if (!clienteActualizado) {
        throw new Error('Error al recuperar cliente actualizado');
      }

      return clienteActualizado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }
  }

  async eliminar(id: number): Promise<boolean> {
    try {
      const cliente = await this.buscarPorId(id);

      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      const resultado = await this.clienteRepository.delete({
        id,
      } as FindOptionsWhere<Cliente>);

      return (
        resultado.affected !== undefined &&
        resultado.affected !== null &&
        resultado.affected > 0
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }

  async buscarServiciosPorCliente(
    clienteId: number,
    soloVigentes: boolean = false,
  ): Promise<ServicioAlquiler[]> {
    try {
      const where: any = {
        cliente: { id: clienteId },
      };

      // Si solo queremos servicios vigentes
      if (soloVigentes) {
        where.estado = In(['confirmado', 'entregado']);
      }

      return await this.servicioRepository.find({
        where,
        relations: ['prendas', 'empleado'],
        order: { fechaAlquiler: 'DESC' },
      });
    } catch (error) {
      throw new Error(
        `Error al buscar servicios del cliente: ${error.message}`,
      );
    }
  }
}
