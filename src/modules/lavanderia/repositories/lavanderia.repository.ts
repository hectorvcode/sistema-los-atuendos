import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { ItemLavanderia } from '../entities/item-lavanderia.entity';
import {
  ILavanderiaRepository,
  PaginationResult,
  QueryLavanderiaOptions,
} from '../interfaces/lavanderia-repository.interface';

/**
 * LavanderiaRepository - Implementación del patrón Repository con Adapter
 * Adapta la interfaz de TypeORM a nuestra interfaz de dominio
 */
@Injectable()
export class LavanderiaRepository implements ILavanderiaRepository {
  constructor(
    @InjectRepository(ItemLavanderia)
    private readonly itemLavanderiaRepository: Repository<ItemLavanderia>,
  ) {}

  async crear(item: ItemLavanderia): Promise<ItemLavanderia> {
    try {
      return await this.itemLavanderiaRepository.save(item);
    } catch (error) {
      throw new Error(`Error al crear ítem de lavandería: ${error.message}`);
    }
  }

  async buscarPorId(id: number): Promise<ItemLavanderia | null> {
    try {
      return await this.itemLavanderiaRepository.findOne({
        where: { id } as FindOptionsWhere<ItemLavanderia>,
        relations: ['prenda'],
      });
    } catch (error) {
      throw new Error(`Error al buscar ítem por ID: ${error.message}`);
    }
  }

  async buscarConFiltros(
    opciones: QueryLavanderiaOptions,
  ): Promise<PaginationResult<ItemLavanderia>> {
    try {
      const { pagina = 1, limite = 10, ...filtros } = opciones;
      const skip = (pagina - 1) * limite;

      // Construir condiciones dinámicamente
      const where: FindOptionsWhere<ItemLavanderia> = {};

      if (filtros.estado) {
        where.estado = filtros.estado;
      }

      if (filtros.esManchada !== undefined) {
        where.esManchada = filtros.esManchada;
      }

      if (filtros.esDelicada !== undefined) {
        where.esDelicada = filtros.esDelicada;
      }

      if (filtros.prioridadAdministrativa !== undefined) {
        where.prioridadAdministrativa = filtros.prioridadAdministrativa;
      }

      // Consulta base
      let queryBuilder = this.itemLavanderiaRepository
        .createQueryBuilder('item')
        .leftJoinAndSelect('item.prenda', 'prenda');

      // Aplicar filtros where
      if (Object.keys(where).length > 0) {
        Object.entries(where).forEach(([key, value]) => {
          queryBuilder = queryBuilder.andWhere(`item.${key} = :${key}`, {
            [key]: value,
          });
        });
      }

      // Filtro de prioridad mínima
      if (filtros.prioridadMinima !== undefined) {
        queryBuilder = queryBuilder.andWhere(
          'item.prioridad >= :prioridadMinima',
          {
            prioridadMinima: filtros.prioridadMinima,
          },
        );
      }

      // Ordenar por prioridad descendente (mayor prioridad primero)
      queryBuilder = queryBuilder
        .orderBy('item.prioridad', 'DESC')
        .addOrderBy('item.fechaRegistro', 'ASC')
        .skip(skip)
        .take(limite);

      const [data, total] = await queryBuilder.getManyAndCount();

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar ítems con filtros: ${error.message}`);
    }
  }

  async buscarPendientesOrdenadosPorPrioridad(): Promise<ItemLavanderia[]> {
    try {
      return await this.itemLavanderiaRepository.find({
        where: { estado: 'pendiente' } as FindOptionsWhere<ItemLavanderia>,
        relations: ['prenda'],
        order: {
          prioridad: 'DESC', // Mayor prioridad primero
          fechaRegistro: 'ASC', // Más antiguos primero en caso de empate
        },
      });
    } catch (error) {
      throw new Error(`Error al buscar ítems pendientes: ${error.message}`);
    }
  }

  async buscarPorEstado(
    estado: string,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ItemLavanderia>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.itemLavanderiaRepository.findAndCount({
        where: { estado } as FindOptionsWhere<ItemLavanderia>,
        relations: ['prenda'],
        skip,
        take: limite,
        order: {
          prioridad: 'DESC',
          fechaRegistro: 'ASC',
        },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar ítems por estado: ${error.message}`);
    }
  }

  async actualizar(
    id: number,
    datos: Partial<ItemLavanderia>,
  ): Promise<ItemLavanderia> {
    try {
      const item = await this.buscarPorId(id);

      if (!item) {
        throw new NotFoundException(
          `Ítem de lavandería con ID ${id} no encontrado`,
        );
      }

      await this.itemLavanderiaRepository.update(
        { id } as FindOptionsWhere<ItemLavanderia>,
        datos,
      );

      const itemActualizado = await this.buscarPorId(id);

      if (!itemActualizado) {
        throw new Error('Error al recuperar ítem actualizado');
      }

      return itemActualizado;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al actualizar ítem: ${error.message}`);
    }
  }

  async actualizarMultiples(
    ids: number[],
    datos: Partial<ItemLavanderia>,
  ): Promise<void> {
    try {
      await this.itemLavanderiaRepository.update(
        { id: In(ids) } as FindOptionsWhere<ItemLavanderia>,
        datos,
      );
    } catch (error) {
      throw new Error(`Error al actualizar múltiples ítems: ${error.message}`);
    }
  }

  async eliminar(id: number): Promise<boolean> {
    try {
      const item = await this.buscarPorId(id);

      if (!item) {
        throw new NotFoundException(
          `Ítem de lavandería con ID ${id} no encontrado`,
        );
      }

      const resultado = await this.itemLavanderiaRepository.delete({
        id,
      } as FindOptionsWhere<ItemLavanderia>);

      return (
        resultado.affected !== undefined &&
        resultado.affected !== null &&
        resultado.affected > 0
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al eliminar ítem: ${error.message}`);
    }
  }
}
