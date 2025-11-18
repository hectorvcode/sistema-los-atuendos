import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  Patch,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LavanderiaService } from '../services/lavanderia.service';
import {
  CreateItemLavanderiaDto,
  QueryLavanderiaDto,
  UpdateItemLavanderiaDto,
  EnviarLoteDto,
} from '../dto';
import { ItemLavanderia } from '../entities/item-lavanderia.entity';

/**
 * LavanderiaController - Controlador REST para gestión de lavandería
 * Implementa endpoints para registro, consulta y procesamiento por lotes
 * Utiliza patrón Decorator para cálculo dinámico de prioridades
 */
@ApiTags('Gestión de Lavandería')
@Controller('lavanderia')
export class LavanderiaController {
  constructor(private readonly lavanderiaService: LavanderiaService) {}

  /**
   * POST /lavanderia - Registrar prenda para lavandería
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar prenda para lavandería',
    description:
      'Registra una prenda en la cola de lavandería. Aplica patrón Decorator para calcular prioridad dinámicamente según: manchas, delicadeza y prioridad administrativa.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ítem registrado exitosamente con prioridad calculada',
    type: ItemLavanderia,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o prenda no encontrada',
  })
  async registrarItem(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createItemDto: CreateItemLavanderiaDto,
  ): Promise<ItemLavanderia> {
    return await this.lavanderiaService.registrarItem(createItemDto);
  }

  /**
   * GET /lavanderia/cola - Obtener cola de lavandería ordenada por prioridad
   */
  @Get('cola')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener cola de lavandería por prioridad',
    description:
      'Obtiene todos los ítems pendientes ordenados por prioridad (descendente). Mayor prioridad primero.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cola de lavandería obtenida exitosamente',
    type: [ItemLavanderia],
  })
  async obtenerColaPorPrioridad(): Promise<ItemLavanderia[]> {
    return await this.lavanderiaService.obtenerListaPorPrioridad();
  }

  /**
   * GET /lavanderia/estadisticas - Obtener estadísticas de lavandería
   */
  @Get('estadisticas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas de lavandería',
    description:
      'Obtiene estadísticas generales: total de ítems, por estado, prioridad promedio, ítems con prioridad alta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async obtenerEstadisticas() {
    return await this.lavanderiaService.obtenerEstadisticas();
  }

  /**
   * POST /lavanderia/enviar-lote - Enviar lote a lavandería
   */
  @Post('enviar-lote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar lote de ítems a lavandería',
    description:
      'Procesa un lote de ítems pendientes, cambia su estado a "enviado" y genera notificación con listado detallado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lote enviado exitosamente con detalles de notificación',
  })
  @ApiResponse({
    status: 400,
    description: 'Ítems no válidos o no están en estado pendiente',
  })
  async enviarLote(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    enviarLoteDto: EnviarLoteDto,
  ) {
    return await this.lavanderiaService.enviarLote(enviarLoteDto);
  }

  /**
   * GET /lavanderia - Consultar ítems con filtros
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar ítems de lavandería',
    description:
      'Obtiene ítems con filtros opcionales: estado, prioridad mínima, manchada, delicada, administrativa. Siempre ordenados por prioridad.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ítems obtenida exitosamente',
  })
  async buscarItems(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryLavanderiaDto,
  ) {
    return await this.lavanderiaService.buscarItems(query);
  }

  /**
   * GET /lavanderia/:id - Buscar ítem por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar ítem por ID',
    description:
      'Obtiene un ítem específico por su ID con información completa de la prenda',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ítem de lavandería',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ítem encontrado',
    type: ItemLavanderia,
  })
  @ApiResponse({
    status: 404,
    description: 'Ítem no encontrado',
  })
  async buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ItemLavanderia> {
    return await this.lavanderiaService.buscarPorId(id);
  }

  /**
   * PUT /lavanderia/:id - Actualizar estado de ítem
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar estado de ítem',
    description:
      'Actualiza el estado de un ítem de lavandería (pendiente, enviado, en_proceso, completado)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ítem de lavandería',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ítem actualizado exitosamente',
    type: ItemLavanderia,
  })
  @ApiResponse({
    status: 404,
    description: 'Ítem no encontrado',
  })
  async actualizarItem(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateItemDto: UpdateItemLavanderiaDto,
  ): Promise<ItemLavanderia> {
    return await this.lavanderiaService.actualizarItem(id, updateItemDto);
  }

  /**
   * DELETE /lavanderia/:id - Eliminar ítem
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar ítem de lavandería',
    description: 'Elimina permanentemente un ítem de la cola de lavandería',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del ítem de lavandería',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Ítem eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Ítem no encontrado',
  })
  async eliminarItem(@Param('id', ParseIntPipe) id: number) {
    return await this.lavanderiaService.eliminarItem(id);
  }
}
