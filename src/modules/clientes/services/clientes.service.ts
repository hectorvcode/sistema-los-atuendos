import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { ClienteRepository } from '../repositories/cliente.repository';
import { Cliente } from '../entities/cliente.entity';
import { CreateClienteDto, UpdateClienteDto, QueryClientesDto } from '../dto';
import { PaginationResult } from '../interfaces/cliente-repository.interface';

/**
 * ClientesService - Lógica de negocio para gestión de clientes
 */
@Injectable()
export class ClientesService {
  constructor(
    private readonly clienteRepository: ClienteRepository,
  ) {}

  /**
   * Crea un nuevo cliente con validaciones de negocio
   */
  async crearCliente(createClienteDto: CreateClienteDto): Promise<Cliente> {
    try {
      // Validar que la identificación no exista
      const clientePorIdentificacion = await this.clienteRepository.buscarPorIdentificacion(
        createClienteDto.numeroIdentificacion
      );

      if (clientePorIdentificacion) {
        throw new ConflictException(
          `Ya existe un cliente con la identificación ${createClienteDto.numeroIdentificacion}`
        );
      }

      // Validar que el email no exista
      const clientePorEmail = await this.clienteRepository.buscarPorEmail(
        createClienteDto.correoElectronico
      );

      if (clientePorEmail) {
        throw new ConflictException(
          `Ya existe un cliente con el email ${createClienteDto.correoElectronico}`
        );
      }

      // Crear el cliente
      const cliente = new Cliente();
      Object.assign(cliente, createClienteDto);

      return await this.clienteRepository.crear(cliente);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear cliente: ${error.message}`);
    }
  }

  /**
   * Busca un cliente por su ID
   */
  async buscarPorId(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.buscarPorId(id);

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  /**
   * Busca un cliente por número de identificación
   */
  async buscarPorIdentificacion(numeroIdentificacion: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.buscarPorIdentificacion(numeroIdentificacion);

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con identificación ${numeroIdentificacion} no encontrado`
      );
    }

    return cliente;
  }

  /**
   * Busca clientes con filtros y paginación
   */
  async buscarClientes(query: QueryClientesDto): Promise<PaginationResult<Cliente>> {
    const { pagina = 1, limite = 10, ...criterios } = query;

    // Si no hay criterios, buscar todos
    if (Object.keys(criterios).length === 0) {
      return await this.clienteRepository.buscarTodos(pagina, limite);
    }

    // Construir criterios de búsqueda
    const criteriosBusqueda: Partial<Cliente> = {};

    if (criterios.nombre) {
      criteriosBusqueda.nombre = criterios.nombre;
    }

    if (criterios.numeroIdentificacion) {
      criteriosBusqueda.numeroIdentificacion = criterios.numeroIdentificacion;
    }

    if (criterios.activo !== undefined) {
      criteriosBusqueda.activo = criterios.activo;
    }

    return await this.clienteRepository.buscarPorCriterios(
      criteriosBusqueda,
      pagina,
      limite
    );
  }

  /**
   * Actualiza un cliente existente
   */
  async actualizarCliente(id: number, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    // Verificar que el cliente existe
    await this.buscarPorId(id);

    // Si se intenta cambiar la identificación, validar que no exista
    if (updateClienteDto.numeroIdentificacion) {
      const clienteExistente = await this.clienteRepository.buscarPorIdentificacion(
        updateClienteDto.numeroIdentificacion
      );

      if (clienteExistente && clienteExistente.id !== id) {
        throw new ConflictException(
          `Ya existe otro cliente con la identificación ${updateClienteDto.numeroIdentificacion}`
        );
      }
    }

    // Si se intenta cambiar el email, validar que no exista
    if (updateClienteDto.correoElectronico) {
      const clienteExistente = await this.clienteRepository.buscarPorEmail(
        updateClienteDto.correoElectronico
      );

      if (clienteExistente && clienteExistente.id !== id) {
        throw new ConflictException(
          `Ya existe otro cliente con el email ${updateClienteDto.correoElectronico}`
        );
      }
    }

    return await this.clienteRepository.actualizar(id, updateClienteDto);
  }

  /**
   * Elimina un cliente (soft delete cambiando a inactivo)
   */
  async desactivarCliente(id: number): Promise<Cliente> {
    await this.buscarPorId(id);
    return await this.clienteRepository.actualizar(id, { activo: false });
  }

  /**
   * Elimina permanentemente un cliente
   */
  async eliminarCliente(id: number): Promise<{ mensaje: string }> {
    await this.buscarPorId(id);

    const eliminado = await this.clienteRepository.eliminar(id);

    if (!eliminado) {
      throw new BadRequestException('No se pudo eliminar el cliente');
    }

    return {
      mensaje: `Cliente con ID ${id} eliminado exitosamente`,
    };
  }

  /**
   * Obtiene los servicios de alquiler de un cliente
   */
  async obtenerServiciosCliente(
    clienteId: number,
    soloVigentes: boolean = false
  ) {
    // Verificar que el cliente existe
    const cliente = await this.buscarPorId(clienteId);

    // Obtener servicios
    const servicios = await this.clienteRepository.buscarServiciosPorCliente(
      clienteId,
      soloVigentes
    );

    // Calcular estadísticas
    const serviciosVigentes = servicios.filter(
      s => s.estado === 'confirmado' || s.estado === 'entregado'
    ).length;

    const valorTotal = servicios.reduce(
      (sum, servicio) => sum + Number(servicio.valorTotal),
      0
    );

    return {
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        numeroIdentificacion: cliente.numeroIdentificacion,
        correoElectronico: cliente.correoElectronico,
      },
      servicios: servicios.map(servicio => ({
        id: servicio.id,
        numero: servicio.numero,
        fechaAlquiler: servicio.fechaAlquiler,
        fechaDevolucion: servicio.fechaDevolucion,
        estado: servicio.estado,
        valorTotal: servicio.valorTotal,
        prendas: servicio.prendas?.map(prenda => ({
          id: prenda.id,
          referencia: prenda.referencia,
          tipo: (prenda as any).tipo,
          talla: prenda.talla,
          color: prenda.color,
          valorAlquiler: prenda.valorAlquiler,
        })),
        empleado: servicio.empleado ? {
          id: servicio.empleado.id,
          nombre: servicio.empleado.nombre,
        } : null,
      })),
      totalServicios: servicios.length,
      serviciosVigentes,
      valorTotalServicios: valorTotal,
    };
  }

  /**
   * Obtiene estadísticas de clientes
   */
  async obtenerEstadisticas() {
    const todosClientes = await this.clienteRepository.buscarTodos(1, 10000);

    const activos = todosClientes.data.filter(c => c.activo).length;
    const inactivos = todosClientes.data.filter(c => !c.activo).length;

    return {
      total: todosClientes.total,
      activos,
      inactivos,
    };
  }
}