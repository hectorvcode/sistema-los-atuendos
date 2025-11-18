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
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ClientesService } from '../services/clientes.service';
import { CreateClienteDto, UpdateClienteDto, QueryClientesDto } from '../dto';
import { Cliente } from '../entities/cliente.entity';

/**
 * ClientesController - Controlador REST para gestión de clientes
 */
@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  /**
   * POST /clientes - Crear nuevo cliente
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo cliente',
    description:
      'Registra un nuevo cliente en el sistema con validación de datos únicos',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente creado exitosamente',
    type: Cliente,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un cliente con esa identificación o email',
  })
  async crearCliente(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createClienteDto: CreateClienteDto,
  ): Promise<Cliente> {
    return await this.clientesService.crearCliente(createClienteDto);
  }

  /**
   * GET /clientes - Consultar clientes con filtros
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar clientes',
    description:
      'Obtiene un listado de clientes con filtros opcionales y paginación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
  })
  async buscarClientes(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryClientesDto,
  ) {
    return await this.clientesService.buscarClientes(query);
  }

  /**
   * GET /clientes/estadisticas - Obtener estadísticas
   */
  @Get('estadisticas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas de clientes',
    description:
      'Obtiene estadísticas generales sobre los clientes en el sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  async obtenerEstadisticas() {
    return await this.clientesService.obtenerEstadisticas();
  }

  /**
   * GET /clientes/:id - Buscar cliente por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar cliente por ID',
    description: 'Obtiene un cliente específico por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: Cliente,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
    return await this.clientesService.buscarPorId(id);
  }

  /**
   * GET /clientes/:id/servicios - Obtener servicios del cliente
   */
  @Get(':id/servicios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener servicios de alquiler del cliente',
    description:
      'Obtiene todos los servicios de alquiler asociados a un cliente con información detallada de las prendas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiQuery({
    name: 'vigentes',
    required: false,
    type: Boolean,
    description:
      'Si es true, solo retorna servicios vigentes (confirmados o entregados)',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicios del cliente obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async obtenerServiciosCliente(
    @Param('id', ParseIntPipe) id: number,
    @Query('vigentes', new ParseBoolPipe({ optional: true }))
    vigentes?: boolean,
  ) {
    return await this.clientesService.obtenerServiciosCliente(
      id,
      vigentes || false,
    );
  }

  /**
   * GET /clientes/identificacion/:numeroIdentificacion - Buscar por identificación
   */
  @Get('identificacion/:numeroIdentificacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar cliente por número de identificación',
    description:
      'Obtiene un cliente específico por su número de identificación',
  })
  @ApiParam({
    name: 'numeroIdentificacion',
    description: 'Número de identificación del cliente',
    example: '1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: Cliente,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async buscarPorIdentificacion(
    @Param('numeroIdentificacion') numeroIdentificacion: string,
  ): Promise<Cliente> {
    return await this.clientesService.buscarPorIdentificacion(
      numeroIdentificacion,
    );
  }

  /**
   * PUT /clientes/:id - Actualizar cliente
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar cliente',
    description: 'Actualiza los datos de un cliente existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente',
    type: Cliente,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con datos únicos (identificación o email)',
  })
  async actualizarCliente(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    return await this.clientesService.actualizarCliente(id, updateClienteDto);
  }

  /**
   * PATCH /clientes/:id/desactivar - Desactivar cliente
   */
  @Patch(':id/desactivar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar cliente',
    description: 'Marca un cliente como inactivo (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async desactivarCliente(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Cliente> {
    return await this.clientesService.desactivarCliente(id);
  }

  /**
   * DELETE /clientes/:id - Eliminar cliente
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar cliente',
    description: 'Elimina permanentemente un cliente del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente no encontrado',
  })
  async eliminarCliente(@Param('id', ParseIntPipe) id: number) {
    return await this.clientesService.eliminarCliente(id);
  }
}
