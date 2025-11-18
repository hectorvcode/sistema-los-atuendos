import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemLavanderia } from '../entities/item-lavanderia.entity';
import { Prenda } from '../../prendas/entities/prenda.entity';
import { LavanderiaRepository } from '../repositories/lavanderia.repository';
import { DecoratorService } from '../../../patterns/structural/decorator/decorator.service';
import {
  CreateItemLavanderiaDto,
  QueryLavanderiaDto,
  UpdateItemLavanderiaDto,
  EnviarLoteDto,
} from '../dto';
import { PaginationResult } from '../interfaces/lavanderia-repository.interface';

/**
 * LavanderiaService - Servicio para gestión de lavandería
 * Integra el patrón Decorator para cálculo dinámico de prioridades
 * Gestiona cola ordenada por prioridad y procesamiento por lotes
 */
@Injectable()
export class LavanderiaService {
  constructor(
    private readonly lavanderiaRepository: LavanderiaRepository,
    private readonly decoratorService: DecoratorService,
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
  ) {}

  /**
   * Registra una prenda para lavandería con cálculo de prioridad usando Decorator
   */
  async registrarItem(
    createItemDto: CreateItemLavanderiaDto,
  ): Promise<ItemLavanderia> {
    try {
      // Validar que la prenda exista
      const prenda = await this.prendaRepository.findOne({
        where: { id: createItemDto.prendaId },
      });

      if (!prenda) {
        throw new BadRequestException(
          `Prenda con ID ${createItemDto.prendaId} no encontrada`,
        );
      }

      // Usar el servicio Decorator para calcular prioridad
      const prendaConPrioridad =
        await this.decoratorService.procesarSolicitudLavanderia({
          referenciaPrenda: prenda.referencia,
          configuraciones: createItemDto.configuraciones,
        });

      // Crear el ítem de lavandería con los datos calculados
      const item = new ItemLavanderia();
      item.prenda = prenda;
      item.prioridad = prendaConPrioridad.calcularPrioridad();
      item.estado = 'pendiente';
      item.esManchada = createItemDto.esManchada || false;
      item.esDelicada = createItemDto.esDelicada || false;
      item.prioridadAdministrativa =
        createItemDto.prioridadAdministrativa || false;

      return await this.lavanderiaRepository.crear(item);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al registrar ítem para lavandería: ${error.message}`,
      );
    }
  }

  /**
   * Obtiene la lista de lavandería ordenada por prioridad
   */
  async obtenerListaPorPrioridad(): Promise<ItemLavanderia[]> {
    return await this.lavanderiaRepository.buscarPendientesOrdenadosPorPrioridad();
  }

  /**
   * Busca ítems con filtros y paginación
   */
  async buscarItems(
    query: QueryLavanderiaDto,
  ): Promise<PaginationResult<ItemLavanderia>> {
    const opciones = {
      estado: query.estado,
      prioridadMinima: query.prioridadMinima,
      esManchada: query.esManchada,
      esDelicada: query.esDelicada,
      prioridadAdministrativa: query.prioridadAdministrativa,
      pagina: query.pagina || 1,
      limite: query.limite || 10,
    };

    return await this.lavanderiaRepository.buscarConFiltros(opciones);
  }

  /**
   * Busca un ítem por su ID
   */
  async buscarPorId(id: number): Promise<ItemLavanderia> {
    const item = await this.lavanderiaRepository.buscarPorId(id);

    if (!item) {
      throw new NotFoundException(
        `Ítem de lavandería con ID ${id} no encontrado`,
      );
    }

    return item;
  }

  /**
   * Actualiza el estado de un ítem
   */
  async actualizarItem(
    id: number,
    updateDto: UpdateItemLavanderiaDto,
  ): Promise<ItemLavanderia> {
    await this.buscarPorId(id); // Verificar que existe

    return await this.lavanderiaRepository.actualizar(id, {
      estado: updateDto.estado,
    });
  }

  /**
   * Envía un lote de ítems a lavandería
   * Cambia el estado a 'enviado' y genera notificación
   */
  async enviarLote(enviarLoteDto: EnviarLoteDto): Promise<{
    mensaje: string;
    itemsEnviados: number;
    detalles: Array<{
      id: number;
      prenda: string;
      prioridad: number;
    }>;
  }> {
    try {
      // Validar que todos los ítems existan y estén pendientes
      const items = await Promise.all(
        enviarLoteDto.itemsIds.map((id) => this.buscarPorId(id)),
      );

      const itemsNoPendientes = items.filter(
        (item) => item.estado !== 'pendiente',
      );

      if (itemsNoPendientes.length > 0) {
        const ids = itemsNoPendientes.map((item) => item.id).join(', ');
        throw new BadRequestException(
          `Los siguientes ítems no están en estado pendiente: ${ids}`,
        );
      }

      // Actualizar estado a 'enviado'
      await this.lavanderiaRepository.actualizarMultiples(
        enviarLoteDto.itemsIds,
        { estado: 'enviado' },
      );

      // Generar detalles de notificación ordenados por prioridad
      const detalles = items
        .sort((a, b) => b.prioridad - a.prioridad)
        .map((item) => ({
          id: item.id,
          prenda: `${item.prenda.constructor.name} - ${item.prenda.referencia}`,
          prioridad: item.prioridad,
        }));

      return {
        mensaje: `Lote enviado exitosamente a lavandería`,
        itemsEnviados: items.length,
        detalles,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Error al enviar lote a lavandería: ${error.message}`,
      );
    }
  }

  /**
   * Elimina un ítem de lavandería
   */
  async eliminarItem(id: number): Promise<{ mensaje: string }> {
    const item = await this.buscarPorId(id);

    const eliminado = await this.lavanderiaRepository.eliminar(id);

    if (!eliminado) {
      throw new BadRequestException('No se pudo eliminar el ítem');
    }

    return {
      mensaje: `Ítem de lavandería #${item.id} eliminado exitosamente`,
    };
  }

  /**
   * Obtiene estadísticas de lavandería
   */
  async obtenerEstadisticas() {
    const todosPendientes =
      await this.lavanderiaRepository.buscarPendientesOrdenadosPorPrioridad();
    const todosItems = await this.lavanderiaRepository.buscarConFiltros({
      pagina: 1,
      limite: 10000,
    });

    const estadisticas = {
      totalItems: todosItems.total,
      pendientes: todosPendientes.length,
      porEstado: {} as Record<string, number>,
      prioridadPromedio: 0,
      itemsConPrioridadAlta: 0, // prioridad >= 10
    };

    // Agrupar por estado
    todosItems.data.forEach((item) => {
      estadisticas.porEstado[item.estado] =
        (estadisticas.porEstado[item.estado] || 0) + 1;
    });

    // Calcular prioridad promedio
    const totalPrioridad = todosItems.data.reduce(
      (sum, item) => sum + item.prioridad,
      0,
    );
    estadisticas.prioridadPromedio =
      todosItems.total > 0
        ? Math.round((totalPrioridad / todosItems.total) * 100) / 100
        : 0;

    // Contar ítems con prioridad alta
    estadisticas.itemsConPrioridadAlta = todosItems.data.filter(
      (item) => item.prioridad >= 10,
    ).length;

    return estadisticas;
  }
}
