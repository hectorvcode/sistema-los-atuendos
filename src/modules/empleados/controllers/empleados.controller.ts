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
} from '@nestjs/swagger';
import { EmpleadosService } from '../services/empleados.service';
import { CreateEmpleadoDto, UpdateEmpleadoDto, QueryEmpleadosDto } from '../dto';
import { Empleado } from '../entities/empleado.entity';

/**
 * EmpleadosController - Controlador REST para gestión de empleados
 */
@ApiTags('Empleados')
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo empleado',
    description: 'Registra un nuevo empleado en el sistema con validación de datos únicos',
  })
  @ApiResponse({ status: 201, description: 'Empleado creado exitosamente', type: Empleado })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un empleado con esa identificación o email' })
  async crearEmpleado(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createEmpleadoDto: CreateEmpleadoDto,
  ): Promise<Empleado> {
    return await this.empleadosService.crearEmpleado(createEmpleadoDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consultar empleados',
    description: 'Obtiene un listado de empleados con filtros opcionales y paginación',
  })
  @ApiResponse({ status: 200, description: 'Lista de empleados obtenida exitosamente' })
  async buscarEmpleados(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryEmpleadosDto,
  ) {
    return await this.empleadosService.buscarEmpleados(query);
  }

  @Get('estadisticas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estadísticas de empleados',
    description: 'Obtiene estadísticas generales sobre los empleados en el sistema',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async obtenerEstadisticas() {
    return await this.empleadosService.obtenerEstadisticas();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar empleado por ID',
    description: 'Obtiene un empleado específico por su ID',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', example: 1 })
  @ApiResponse({ status: 200, description: 'Empleado encontrado', type: Empleado })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async buscarPorId(@Param('id', ParseIntPipe) id: number): Promise<Empleado> {
    return await this.empleadosService.buscarPorId(id);
  }

  @Get(':id/servicios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener servicios gestionados por el empleado',
    description: 'Obtiene todos los servicios de alquiler que el empleado ha gestionado',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', example: 1 })
  @ApiResponse({ status: 200, description: 'Servicios del empleado obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async obtenerServiciosEmpleado(@Param('id', ParseIntPipe) id: number) {
    return await this.empleadosService.obtenerServiciosEmpleado(id);
  }

  @Get('identificacion/:numeroIdentificacion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Buscar empleado por número de identificación',
    description: 'Obtiene un empleado específico por su número de identificación',
  })
  @ApiParam({ name: 'numeroIdentificacion', description: 'Número de identificación', example: '9876543210' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado', type: Empleado })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async buscarPorIdentificacion(
    @Param('numeroIdentificacion') numeroIdentificacion: string,
  ): Promise<Empleado> {
    return await this.empleadosService.buscarPorIdentificacion(numeroIdentificacion);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar empleado',
    description: 'Actualiza los datos de un empleado existente',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', example: 1 })
  @ApiResponse({ status: 200, description: 'Empleado actualizado exitosamente', type: Empleado })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @ApiResponse({ status: 409, description: 'Conflicto con datos únicos' })
  async actualizarEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<Empleado> {
    return await this.empleadosService.actualizarEmpleado(id, updateEmpleadoDto);
  }

  @Patch(':id/desactivar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar empleado',
    description: 'Marca un empleado como inactivo (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', example: 1 })
  @ApiResponse({ status: 200, description: 'Empleado desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async desactivarEmpleado(@Param('id', ParseIntPipe) id: number): Promise<Empleado> {
    return await this.empleadosService.desactivarEmpleado(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar empleado',
    description: 'Elimina permanentemente un empleado del sistema',
  })
  @ApiParam({ name: 'id', description: 'ID del empleado', example: 1 })
  @ApiResponse({ status: 200, description: 'Empleado eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  async eliminarEmpleado(@Param('id', ParseIntPipe) id: number) {
    return await this.empleadosService.eliminarEmpleado(id);
  }
}