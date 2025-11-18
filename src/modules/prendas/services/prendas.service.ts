import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrendaFactoryRegistry } from '../../../patterns/creational/factory/prenda-factory.registry';
import { PrendaRepository } from '../repositories/prenda.repository';
import { Prenda } from '../entities/prenda.entity';
import { CreatePrendaDto, QueryPrendasDto, OrdenPrendas } from '../dto';
import {
  PaginationResult,
  PrendasAgrupadasPorTipo,
} from '../interfaces/prenda-repository.interface';
import { PrendaBaseData } from '../../../patterns/creational/factory/prenda-factory.interface';

/**
 * PrendasService - Capa de lógica de negocio
 * Orquesta el uso del Factory Method y el Repository Adapter
 */
@Injectable()
export class PrendasService {
  constructor(
    private readonly prendaFactory: PrendaFactoryRegistry,
    private readonly prendaRepository: PrendaRepository,
  ) {}

  /**
   * Crea una nueva prenda usando Factory Method y la persiste usando Repository (Adapter)
   */
  async crearPrenda(createPrendaDto: CreatePrendaDto): Promise<Prenda> {
    try {
      // Validar que el tipo de prenda sea válido
      const tiposDisponibles = this.prendaFactory.getTiposDisponibles();
      if (!tiposDisponibles.includes(createPrendaDto.tipo.toLowerCase())) {
        throw new BadRequestException(
          `Tipo de prenda inválido. Tipos disponibles: ${tiposDisponibles.join(', ')}`,
        );
      }

      // Verificar que la referencia no exista
      const prendaExistente = await this.prendaRepository.buscarPorReferencia(
        createPrendaDto.referencia,
      );

      if (prendaExistente) {
        throw new ConflictException(
          `Ya existe una prenda con la referencia ${createPrendaDto.referencia}`,
        );
      }

      // Preparar datos base para el factory
      const datosBase: PrendaBaseData & Record<string, any> = {
        referencia: createPrendaDto.referencia,
        color: createPrendaDto.color,
        marca: createPrendaDto.marca,
        talla: createPrendaDto.talla,
        valorAlquiler: createPrendaDto.valorAlquiler,
        ...createPrendaDto.propiedadesEspecificas,
      };

      // Usar Factory Method para crear la prenda según su tipo (ya persiste)
      const prenda = await this.prendaFactory.crearPrenda(
        createPrendaDto.tipo,
        datosBase,
      );

      // Establecer propiedades adicionales si están presentes y guardar cambios si aplican
      let necesitaGuardar = false;
      if (createPrendaDto.estado && prenda.estado !== createPrendaDto.estado) {
        prenda.estado = createPrendaDto.estado;
        necesitaGuardar = true;
      }

      if (
        createPrendaDto.disponible !== undefined &&
        prenda.disponible !== createPrendaDto.disponible
      ) {
        prenda.disponible = createPrendaDto.disponible;
        necesitaGuardar = true;
      }

      if (necesitaGuardar) {
        await this.prendaRepository.guardar(prenda); // update
      }

      // Evitar doble inserción (factory ya hizo save)
      return prenda;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException(`Error al crear prenda: ${error.message}`);
    }
  }

  /**
   * Busca una prenda por su referencia única
   */
  async buscarPorReferencia(referencia: string): Promise<Prenda> {
    const prenda = await this.prendaRepository.buscarPorReferencia(referencia);

    if (!prenda) {
      throw new NotFoundException(
        `Prenda con referencia ${referencia} no encontrada`,
      );
    }

    return prenda;
  }

  /**
   * Busca prendas con filtros y paginación
   */
  async buscarPrendas(
    query: QueryPrendasDto,
  ): Promise<PaginationResult<Prenda>> {
    const { pagina = 1, limite = 10, orden, ...criterios } = query;

    // Construir criterios de búsqueda dinámicos
    const criteriosBusqueda: Partial<Prenda> = {};

    if (criterios.talla) {
      criteriosBusqueda.talla = criterios.talla;
    }

    if (criterios.estado) {
      criteriosBusqueda.estado = criterios.estado;
    }

    if (criterios.color) {
      criteriosBusqueda.color = criterios.color;
    }

    // Si no hay criterios, buscar todos
    if (Object.keys(criteriosBusqueda).length === 0) {
      return await this.prendaRepository.buscarTodos(pagina, limite);
    }

    return await this.prendaRepository.buscarPorCriterios(
      criteriosBusqueda,
      pagina,
      limite,
    );
  }

  /**
   * Busca prendas por talla y las agrupa por tipo
   */
  async buscarPorTallaAgrupadoPorTipo(
    talla: string,
  ): Promise<PrendasAgrupadasPorTipo[]> {
    if (!talla || talla.trim() === '') {
      throw new BadRequestException('La talla es requerida');
    }

    return await this.prendaRepository.buscarPorTallaAgrupadoPorTipo(talla);
  }

  /**
   * Busca prendas por talla con paginación
   */
  async buscarPorTalla(
    talla: string,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<Prenda>> {
    if (!talla || talla.trim() === '') {
      throw new BadRequestException('La talla es requerida');
    }

    return await this.prendaRepository.buscarPorTalla(talla, pagina, limite);
  }

  /**
   * Actualiza una prenda existente
   */
  async actualizarPrenda(
    referencia: string,
    datos: Partial<CreatePrendaDto>,
  ): Promise<Prenda> {
    // Verificar que la prenda existe
    await this.buscarPorReferencia(referencia);

    // Si se intenta cambiar la referencia, validar que no exista
    if (datos.referencia && datos.referencia !== referencia) {
      const prendaExistente = await this.prendaRepository.buscarPorReferencia(
        datos.referencia,
      );

      if (prendaExistente) {
        throw new ConflictException(
          `Ya existe una prenda con la referencia ${datos.referencia}`,
        );
      }
    }

    return await this.prendaRepository.actualizar(
      referencia,
      datos as Partial<Prenda>,
    );
  }

  /**
   * Elimina una prenda
   */
  async eliminarPrenda(referencia: string): Promise<{ mensaje: string }> {
    await this.buscarPorReferencia(referencia);

    const eliminada = await this.prendaRepository.eliminar(referencia);

    if (!eliminada) {
      throw new BadRequestException('No se pudo eliminar la prenda');
    }

    return {
      mensaje: `Prenda con referencia ${referencia} eliminada exitosamente`,
    };
  }

  /**
   * Obtiene todos los tipos de prendas disponibles
   */
  getTiposDisponibles(): string[] {
    return this.prendaFactory.getTiposDisponibles();
  }

  /**
   * Obtiene estadísticas generales de las prendas
   */
  async obtenerEstadisticas(): Promise<any> {
    const todasPrendas = await this.prendaRepository.buscarTodos(1, 1000);

    const estadisticas = {
      total: todasPrendas.total,
      disponibles: todasPrendas.data.filter((p) => p.disponible).length,
      alquiladas: todasPrendas.data.filter((p) => p.estado === 'alquilada')
        .length,
      porTipo: {} as Record<string, number>,
      porTalla: {} as Record<string, number>,
    };

    // Agrupar por tipo
    todasPrendas.data.forEach((prenda) => {
      const tipo = (prenda as any).tipo || 'Sin tipo';
      estadisticas.porTipo[tipo] = (estadisticas.porTipo[tipo] || 0) + 1;

      const talla = prenda.talla;
      estadisticas.porTalla[talla] = (estadisticas.porTalla[talla] || 0) + 1;
    });

    return estadisticas;
  }
}
