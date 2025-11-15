import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { EmpleadoRepository } from '../repositories/empleado.repository';
import { Empleado } from '../entities/empleado.entity';
import { CreateEmpleadoDto, UpdateEmpleadoDto, QueryEmpleadosDto } from '../dto';
import { PaginationResult } from '../interfaces/empleado-repository.interface';

/**
 * EmpleadosService - Lógica de negocio para gestión de empleados
 */
@Injectable()
export class EmpleadosService {
  constructor(
    private readonly empleadoRepository: EmpleadoRepository,
  ) {}

  async crearEmpleado(createEmpleadoDto: CreateEmpleadoDto): Promise<Empleado> {
    try {
      const empleadoPorIdentificacion = await this.empleadoRepository.buscarPorIdentificacion(
        createEmpleadoDto.numeroIdentificacion
      );

      if (empleadoPorIdentificacion) {
        throw new ConflictException(
          `Ya existe un empleado con la identificación ${createEmpleadoDto.numeroIdentificacion}`
        );
      }

      const empleadoPorEmail = await this.empleadoRepository.buscarPorEmail(
        createEmpleadoDto.correoElectronico
      );

      if (empleadoPorEmail) {
        throw new ConflictException(
          `Ya existe un empleado con el email ${createEmpleadoDto.correoElectronico}`
        );
      }

      const empleado = new Empleado();
      Object.assign(empleado, createEmpleadoDto);

      // Convertir fechaIngreso de string a Date
      if (createEmpleadoDto.fechaIngreso) {
        empleado.fechaIngreso = new Date(createEmpleadoDto.fechaIngreso);
      }

      return await this.empleadoRepository.crear(empleado);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear empleado: ${error.message}`);
    }
  }

  async buscarPorId(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.buscarPorId(id);

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  async buscarPorIdentificacion(numeroIdentificacion: string): Promise<Empleado> {
    const empleado = await this.empleadoRepository.buscarPorIdentificacion(numeroIdentificacion);

    if (!empleado) {
      throw new NotFoundException(
        `Empleado con identificación ${numeroIdentificacion} no encontrado`
      );
    }

    return empleado;
  }

  async buscarEmpleados(query: QueryEmpleadosDto): Promise<PaginationResult<Empleado>> {
    const { pagina = 1, limite = 10, ...criterios } = query;

    if (Object.keys(criterios).length === 0) {
      return await this.empleadoRepository.buscarTodos(pagina, limite);
    }

    const criteriosBusqueda: Partial<Empleado> = {};

    if (criterios.nombre) {
      criteriosBusqueda.nombre = criterios.nombre;
    }

    if (criterios.numeroIdentificacion) {
      criteriosBusqueda.numeroIdentificacion = criterios.numeroIdentificacion;
    }

    if (criterios.cargo) {
      criteriosBusqueda.cargo = criterios.cargo;
    }

    if (criterios.activo !== undefined) {
      criteriosBusqueda.activo = criterios.activo;
    }

    return await this.empleadoRepository.buscarPorCriterios(
      criteriosBusqueda,
      pagina,
      limite
    );
  }

  async actualizarEmpleado(id: number, updateEmpleadoDto: UpdateEmpleadoDto): Promise<Empleado> {
    await this.buscarPorId(id);

    if (updateEmpleadoDto.numeroIdentificacion) {
      const empleadoExistente = await this.empleadoRepository.buscarPorIdentificacion(
        updateEmpleadoDto.numeroIdentificacion
      );

      if (empleadoExistente && empleadoExistente.id !== id) {
        throw new ConflictException(
          `Ya existe otro empleado con la identificación ${updateEmpleadoDto.numeroIdentificacion}`
        );
      }
    }

    if (updateEmpleadoDto.correoElectronico) {
      const empleadoExistente = await this.empleadoRepository.buscarPorEmail(
        updateEmpleadoDto.correoElectronico
      );

      if (empleadoExistente && empleadoExistente.id !== id) {
        throw new ConflictException(
          `Ya existe otro empleado con el email ${updateEmpleadoDto.correoElectronico}`
        );
      }
    }

    // Convertir datos para actualización
    const datosActualizacion: Partial<Empleado> = {
      nombre: updateEmpleadoDto.nombre,
      numeroIdentificacion: updateEmpleadoDto.numeroIdentificacion,
      direccion: updateEmpleadoDto.direccion,
      telefono: updateEmpleadoDto.telefono,
      cargo: updateEmpleadoDto.cargo,
      correoElectronico: updateEmpleadoDto.correoElectronico,
      activo: updateEmpleadoDto.activo,
      salario: updateEmpleadoDto.salario,
    };

    // Convertir fechaIngreso de string a Date si está presente
    if (updateEmpleadoDto.fechaIngreso) {
      datosActualizacion.fechaIngreso = new Date(updateEmpleadoDto.fechaIngreso);
    }

    return await this.empleadoRepository.actualizar(id, datosActualizacion);
  }

  async desactivarEmpleado(id: number): Promise<Empleado> {
    await this.buscarPorId(id);
    return await this.empleadoRepository.actualizar(id, { activo: false });
  }

  async eliminarEmpleado(id: number): Promise<{ mensaje: string }> {
    await this.buscarPorId(id);

    const eliminado = await this.empleadoRepository.eliminar(id);

    if (!eliminado) {
      throw new BadRequestException('No se pudo eliminar el empleado');
    }

    return {
      mensaje: `Empleado con ID ${id} eliminado exitosamente`,
    };
  }

  async obtenerServiciosEmpleado(empleadoId: number) {
    const empleado = await this.buscarPorId(empleadoId);

    const servicios = await this.empleadoRepository.buscarServiciosPorEmpleado(empleadoId);

    const totalValor = servicios.reduce(
      (sum, servicio) => sum + Number(servicio.valorTotal),
      0
    );

    return {
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        numeroIdentificacion: empleado.numeroIdentificacion,
        cargo: empleado.cargo,
      },
      servicios: servicios.map(servicio => ({
        id: servicio.id,
        numero: servicio.numero,
        fechaAlquiler: servicio.fechaAlquiler,
        fechaDevolucion: servicio.fechaDevolucion,
        estado: servicio.estado,
        valorTotal: servicio.valorTotal,
        cliente: servicio.cliente ? {
          id: servicio.cliente.id,
          nombre: servicio.cliente.nombre,
        } : null,
        cantidadPrendas: servicio.prendas?.length || 0,
      })),
      totalServicios: servicios.length,
      valorTotalServicios: totalValor,
    };
  }

  async obtenerEstadisticas() {
    const todosEmpleados = await this.empleadoRepository.buscarTodos(1, 10000);

    const activos = todosEmpleados.data.filter(e => e.activo).length;
    const inactivos = todosEmpleados.data.filter(e => !e.activo).length;

    // Agrupar por cargo
    const porCargo = todosEmpleados.data.reduce((acc, empleado) => {
      acc[empleado.cargo] = (acc[empleado.cargo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: todosEmpleados.total,
      activos,
      inactivos,
      porCargo,
    };
  }
}