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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiciosService } from '../services/servicios.service';
import { CreateServicioAlquilerDto, UpdateServicioAlquilerDto, QueryServiciosDto } from '../dto';
import { ServicioAlquiler } from '../entities/servicio-alquiler.entity';

/**
 * ServiciosController - Controlador REST para servicios de alquiler
 * Implementa endpoints especializados para consultas complejas
 */
@ApiTags('Servicios de Alquiler')
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  /**
   * POST /servicios - Crear nuevo servicio usando Builder Pattern
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo servicio de alquiler',
    description: 'Crea un servicio de alquiler usando el patrón Builder. Genera número consecutivo automáticamente usando Singleton. Valida disponibilidad de prendas.',
  })
  @ApiResponse({
    status: 201,
    description: 'Servicio creado exitosamente con número consecutivo generado',
    type: ServicioAlquiler,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o prendas no disponibles',
  })
  async crearServicio(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createServicioDto: CreateServicioAlquilerDto,
  ): Promise<ServicioAlquiler> {
    return await this.serviciosService.crearServicio(createServicioDto);
  }

  /**
   * GET /servicios - Consultar servicios con filtros
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar servicios de alquiler',
    description: 'Obtiene servicios con filtros opcionales: cliente, empleado, estado, rango de fechas, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de servicios obtenida exitosamente',
  })
  async buscarServicios(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryServiciosDto,
  ) {
    return await this.serviciosService.buscarServicios(query);
  }

  /**
   * GET /servicios/estadisticas - Obtener estadísticas
   */
  @Get('estadisticas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas de servicios',
    description: 'Obtiene estadísticas generales: total, por estado, valor total, promedio de prendas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async obtenerEstadisticas() {
    return await this.serviciosService.obtenerEstadisticas();
  }

  /**
   * GET /servicios/numero/:numero - Buscar por número de alquiler
   */
  @Get('numero/:numero')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar servicio por número de alquiler',
    description: 'Obtiene un servicio específico por su número consecutivo único',
  })
  @ApiParam({
    name: 'numero',
    description: 'Número de alquiler (consecutivo)',
    example: 1001,
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio encontrado',
    type: ServicioAlquiler,
  })
  @ApiResponse({
    status: 404,
    description: 'Servicio no encontrado',
  })
  async buscarPorNumero(@Param('numero', ParseIntPipe) numero: number): Promise<ServicioAlquiler> {
    return await this.serviciosService.buscarPorNumero(numero);
  }

  /**
   * GET /servicios/fecha/:fecha - Buscar por fecha de alquiler
   */
  @Get('fecha/:fecha')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar servicios por fecha de alquiler',
    description: 'Obtiene todos los servicios programados para una fecha específica',
  })
  @ApiParam({
    name: 'fecha',
    description: 'Fecha de alquiler (formato ISO: YYYY-MM-DD)',
    example: '2025-02-15',
  })
  @ApiQuery({
    name: 'pagina',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limite',
    required: false,
    type: Number,
    description: 'Elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios por fecha obtenidos exitosamente',
  })
  async buscarPorFecha(
    @Param('fecha') fecha: string,
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number,
  ) {
    return await this.serviciosService.buscarPorFecha(
      fecha,
      pagina ? Number(pagina) : 1,
      limite ? Number(limite) : 10,
    );
  }

  /**
   * GET /servicios/cliente/:clienteId/vigentes - Servicios vigentes por cliente
   */
  @Get('cliente/:clienteId/vigentes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener servicios vigentes de un cliente',
    description: 'Obtiene servicios en estado confirmado o entregado de un cliente específico',
  })
  @ApiParam({
    name: 'clienteId',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios vigentes obtenidos exitosamente',
  })
  async buscarVigentesPorCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
  ) {
    return await this.serviciosService.buscarVigentesPorCliente(clienteId);
  }

  /**
   * GET /servicios/:id - Buscar servicio por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar servicio por ID',
    description: 'Obtiene un servicio específico por su ID con todas sus relaciones',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del servicio',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio encontrado',
    type: ServicioAlquiler,
  })
  @ApiResponse({
    status: 404,
    description: 'Servicio no encontrado',
  })
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<ServicioAlquiler> {
    return await this.serviciosService.buscarPorId(id);
  }

  /**
   * PUT /servicios/:id - Actualizar servicio
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar servicio de alquiler',
    description: 'Actualiza el estado, fecha de devolución u observaciones de un servicio',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del servicio',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio actualizado exitosamente',
    type: ServicioAlquiler,
  })
  @ApiResponse({
    status: 404,
    description: 'Servicio no encontrado',
  })
  async actualizarServicio(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateServicioDto: UpdateServicioAlquilerDto,
  ): Promise<ServicioAlquiler> {
    return await this.serviciosService.actualizarServicio(id, updateServicioDto);
  }

  /**
   * PATCH /servicios/:id/cancelar - Cancelar servicio
   */
  @Patch(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar servicio de alquiler',
    description: 'Marca el servicio como cancelado y libera las prendas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del servicio',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio cancelado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Servicio no encontrado',
  })
  async cancelarServicio(@Param('id', ParseIntPipe) id: number): Promise<ServicioAlquiler> {
    return await this.serviciosService.cancelarServicio(id);
  }

  /**
   * DELETE /servicios/:id - Eliminar servicio
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar servicio de alquiler',
    description: 'Elimina permanentemente un servicio y libera las prendas asociadas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del servicio',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Servicio no encontrado',
  })
  async eliminarServicio(@Param('id', ParseIntPipe) id: number) {
    return await this.serviciosService.eliminarServicio(id);
  }
}