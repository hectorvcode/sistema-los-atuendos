import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Prenda } from '../entities/prenda.entity';
import { VestidoDama } from '../entities/vestido-dama.entity';
import { TrajeCaballero } from '../entities/traje-caballero.entity';
import { Disfraz } from '../entities/disfraz.entity';
import {
  IPrendaRepository,
  PaginationResult,
  PrendasAgrupadasPorTipo,
} from '../interfaces/prenda-repository.interface';

/**
 * PrendaRepository - Implementación del patrón Repository con Adapter
 * Adapta la interfaz de TypeORM Repository a nuestra interfaz de dominio IPrendaRepository
 * Esto permite abstraer la lógica de persistencia y facilitar el cambio de ORM en el futuro
 */
@Injectable()
export class PrendaRepository implements IPrendaRepository {
  constructor(
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,

    @InjectRepository(VestidoDama)
    private readonly vestidoDamaRepository: Repository<VestidoDama>,

    @InjectRepository(TrajeCaballero)
    private readonly trajeCaballeroRepository: Repository<TrajeCaballero>,

    @InjectRepository(Disfraz)
    private readonly disfrazRepository: Repository<Disfraz>,
  ) {}

  /**
   * Obtiene el repositorio específico según el tipo de prenda
   */
  private getRepositoryByType(tipo: string): Repository<any> {
    switch (tipo.toLowerCase()) {
      case 'vestido-dama':
      case 'vestidodama':
        return this.vestidoDamaRepository;
      case 'traje-caballero':
      case 'trajecaballero':
        return this.trajeCaballeroRepository;
      case 'disfraz':
        return this.disfrazRepository;
      default:
        return this.prendaRepository;
    }
  }

  async guardar(prenda: Prenda): Promise<Prenda> {
    try {
      // Adaptamos el método save de TypeORM a nuestro método guardar
      const repository = this.getRepositoryByType(
        (prenda as any).tipo || 'prenda',
      );
      return await repository.save(prenda);
    } catch (error) {
      throw new Error(`Error al guardar prenda: ${error.message}`);
    }
  }

  async buscarPorReferencia(referencia: string): Promise<Prenda | null> {
    try {
      // Adaptamos findOne de TypeORM a nuestro método buscarPorReferencia
      return await this.prendaRepository.findOne({
        where: { referencia } as FindOptionsWhere<Prenda>,
      });
    } catch (error) {
      throw new Error(
        `Error al buscar prenda por referencia: ${error.message}`,
      );
    }
  }

  async buscarPorTalla(
    talla: string,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<Prenda>> {
    try {
      const skip = (pagina - 1) * limite;

      // Adaptamos findAndCount de TypeORM con paginación
      const [data, total] = await this.prendaRepository.findAndCount({
        where: { talla } as FindOptionsWhere<Prenda>,
        skip,
        take: limite,
        order: { referencia: 'ASC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar prendas por talla: ${error.message}`);
    }
  }

  async buscarPorTallaAgrupadoPorTipo(
    talla: string,
  ): Promise<PrendasAgrupadasPorTipo[]> {
    try {
      // Buscar todas las prendas de la talla especificada
      const prendas = await this.prendaRepository.find({
        where: { talla } as FindOptionsWhere<Prenda>,
        order: { referencia: 'ASC' },
      });

      // Agrupar por tipo manualmente
      const agrupadas = prendas.reduce(
        (acc, prenda) => {
          const tipo = (prenda as any).tipo || 'Sin tipo';

          if (!acc[tipo]) {
            acc[tipo] = [];
          }

          acc[tipo].push(prenda);
          return acc;
        },
        {} as Record<string, Prenda[]>,
      );

      // Convertir el objeto a array con el formato esperado
      return Object.entries(agrupadas).map(([tipo, prendas]) => ({
        tipo,
        prendas,
        cantidad: prendas.length,
      }));
    } catch (error) {
      throw new Error(
        `Error al buscar prendas por talla agrupadas: ${error.message}`,
      );
    }
  }

  async buscarTodos(
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<Prenda>> {
    try {
      const skip = (pagina - 1) * limite;

      const [data, total] = await this.prendaRepository.findAndCount({
        skip,
        take: limite,
        order: { referencia: 'ASC' },
      });

      return {
        data,
        total,
        pagina,
        limite,
        totalPaginas: Math.ceil(total / limite),
      };
    } catch (error) {
      throw new Error(`Error al buscar todas las prendas: ${error.message}`);
    }
  }

  async buscarPorCriterios(
    criterios: Partial<Prenda>,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<Prenda>> {
    try {
      const skip = (pagina - 1) * limite;

      // Adaptamos el método find de TypeORM con criterios dinámicos
      const [data, total] = await this.prendaRepository.findAndCount({
        where: criterios as FindOptionsWhere<Prenda>,
        skip,
        take: limite,
        order: { referencia: 'ASC' },
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
        `Error al buscar prendas por criterios: ${error.message}`,
      );
    }
  }

  async actualizar(
    referencia: string,
    datos: Partial<Prenda>,
  ): Promise<Prenda> {
    try {
      const prenda = await this.buscarPorReferencia(referencia);

      if (!prenda) {
        throw new NotFoundException(
          `Prenda con referencia ${referencia} no encontrada`,
        );
      }

      // Adaptamos el método update y findOne de TypeORM
      await this.prendaRepository.update(
        { referencia } as FindOptionsWhere<Prenda>,
        datos,
      );

      const prendaActualizada = await this.buscarPorReferencia(referencia);

      if (!prendaActualizada) {
        throw new Error('Error al recuperar prenda actualizada');
      }

      return prendaActualizada;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al actualizar prenda: ${error.message}`);
    }
  }

  async eliminar(referencia: string): Promise<boolean> {
    try {
      const prenda = await this.buscarPorReferencia(referencia);

      if (!prenda) {
        throw new NotFoundException(
          `Prenda con referencia ${referencia} no encontrada`,
        );
      }

      // Adaptamos el método delete de TypeORM
      const resultado = await this.prendaRepository.delete({
        referencia,
      } as FindOptionsWhere<Prenda>);

      return (
        resultado.affected !== undefined &&
        resultado.affected !== null &&
        resultado.affected > 0
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error al eliminar prenda: ${error.message}`);
    }
  }
}
