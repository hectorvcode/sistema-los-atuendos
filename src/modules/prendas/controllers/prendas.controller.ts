import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PrendasService } from '../services/prendas.service';
import { CreatePrendaDto, QueryPrendasDto } from '../dto';
import { Prenda } from '../entities/prenda.entity';

/**
 * PrendasController - Controlador REST para gestión de prendas
 * Implementa los endpoints para crear y consultar prendas
 */
@ApiTags('Prendas')
@Controller('prendas')
export class PrendasController {
  constructor(private readonly prendasService: PrendasService) {}

  /**
   * POST /prendas - Crear nueva prenda usando Factory Method
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva prenda',
    description:
      'Crea una nueva prenda utilizando el patrón Factory Method para validar y construir la prenda según su tipo',
  })
  @ApiResponse({
    status: 201,
    description: 'Prenda creada exitosamente',
    type: Prenda,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o tipo de prenda no soportado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una prenda con esa referencia',
  })
  async crearPrenda(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createPrendaDto: CreatePrendaDto,
  ): Promise<Prenda> {
    return await this.prendasService.crearPrenda(createPrendaDto);
  }

  /**
   * GET /prendas - Consultar prendas con filtros y paginación
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar prendas',
    description:
      'Obtiene un listado de prendas con filtros opcionales por talla, tipo, estado, color. Incluye paginación y ordenamiento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de prendas obtenida exitosamente',
  })
  async buscarPrendas(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryPrendasDto,
  ) {
    return await this.prendasService.buscarPrendas(query);
  }

  /**
   * GET /prendas/talla/:talla - Consultar prendas por talla con paginación
   */
  @Get('talla/:talla')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar prendas por talla',
    description:
      'Obtiene todas las prendas de una talla específica con paginación',
  })
  @ApiParam({
    name: 'talla',
    description: 'Talla de la prenda',
    example: 'M',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página (por defecto: 1)',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Elementos por página (por defecto: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de prendas por talla obtenida exitosamente',
  })
  async buscarPorTalla(
    @Param('talla') talla: string,
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
  ) {
    return await this.prendasService.buscarPorTalla(
      talla,
      pagina ? Number(pagina) : 1,
      limite ? Number(limite) : 10,
    );
  }

  /**
   * GET /prendas/talla/:talla/agrupado - Consultar prendas por talla agrupadas por tipo
   */
  @Get('talla/:talla/agrupado')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar prendas por talla agrupadas por tipo',
    description:
      'Obtiene todas las prendas de una talla específica separadas y agrupadas por tipo de prenda',
  })
  @ApiParam({
    name: 'talla',
    description: 'Talla de la prenda',
    example: 'M',
  })
  @ApiResponse({
    status: 200,
    description: 'Prendas agrupadas por tipo obtenidas exitosamente',
  })
  async buscarPorTallaAgrupado(@Param('talla') talla: string) {
    return await this.prendasService.buscarPorTallaAgrupadoPorTipo(talla);
  }

  /**
   * GET /prendas/referencia/:referencia - Buscar prenda por referencia
   */
  @Get('referencia/:referencia')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar prenda por referencia',
    description: 'Obtiene una prenda específica por su referencia única',
  })
  @ApiParam({
    name: 'referencia',
    description: 'Referencia única de la prenda',
    example: 'VD-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Prenda encontrada',
    type: Prenda,
  })
  @ApiResponse({
    status: 404,
    description: 'Prenda no encontrada',
  })
  async buscarPorReferencia(
    @Param('referencia') referencia: string,
  ): Promise<Prenda> {
    return await this.prendasService.buscarPorReferencia(referencia);
  }

  /**
   * GET /prendas/tipos - Obtener tipos de prendas disponibles
   */
  @Get('tipos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener tipos de prendas disponibles',
    description:
      'Lista todos los tipos de prendas que se pueden crear (vestido-dama, traje-caballero, disfraz)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipos de prendas obtenidos exitosamente',
  })
  getTiposDisponibles() {
    return {
      tipos: this.prendasService.getTiposDisponibles(),
    };
  }

  /**
   * GET /prendas/estadisticas - Obtener estadísticas de prendas
   */
  @Get('estadisticas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas de prendas',
    description:
      'Obtiene estadísticas generales sobre las prendas en el sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async obtenerEstadisticas() {
    return await this.prendasService.obtenerEstadisticas();
  }

  /**
   * PUT /prendas/:referencia - Actualizar prenda
   */
  @Put(':referencia')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar prenda',
    description: 'Actualiza los datos de una prenda existente',
  })
  @ApiParam({
    name: 'referencia',
    description: 'Referencia única de la prenda',
    example: 'VD-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Prenda actualizada exitosamente',
    type: Prenda,
  })
  @ApiResponse({
    status: 404,
    description: 'Prenda no encontrada',
  })
  async actualizarPrenda(
    @Param('referencia') referencia: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    datos: Partial<CreatePrendaDto>,
  ): Promise<Prenda> {
    return await this.prendasService.actualizarPrenda(referencia, datos);
  }

  /**
   * DELETE /prendas/:referencia - Eliminar prenda
   */
  @Delete(':referencia')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar prenda',
    description: 'Elimina una prenda del sistema',
  })
  @ApiParam({
    name: 'referencia',
    description: 'Referencia única de la prenda',
    example: 'VD-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Prenda eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Prenda no encontrada',
  })
  async eliminarPrenda(@Param('referencia') referencia: string) {
    return await this.prendasService.eliminarPrenda(referencia);
  }
}
