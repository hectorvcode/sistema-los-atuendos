import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Optional,
  Inject,
} from '@nestjs/common';
import { ServicioAlquilerBuilder } from '../../../patterns/creational/builder/servicio-alquiler.builder';
import { ServicioRepository } from '../repositories/servicio.repository';
import { ServicioAlquiler } from '../entities/servicio-alquiler.entity';
import {
  CreateServicioAlquilerDto,
  UpdateServicioAlquilerDto,
  QueryServiciosDto,
} from '../dto';
import { PaginationResult } from '../interfaces/servicio-repository.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Prenda } from '../../prendas/entities/prenda.entity';
import { ServicioStateContext } from '../../../patterns/behavioral/state';
import {
  ServicioSubject,
  ServicioEventType,
} from '../../../patterns/behavioral/observer';
import {
  CommandInvoker,
  CommandFactory,
} from '../../../patterns/behavioral/command';

/**
 * ServiciosService - Lógica de negocio para servicios de alquiler
 * Implementa patrones de diseño:
 * - Builder Pattern para construcción compleja de servicios
 * - Singleton Pattern para generación de consecutivos
 * - State Pattern para gestión del ciclo de vida del servicio
 * - Observer Pattern para notificaciones de eventos
 * - Command Pattern para encapsular operaciones de estado con capacidad de undo/redo
 */
@Injectable()
export class ServiciosService {
  constructor(
    private readonly servicioAlquilerBuilder: ServicioAlquilerBuilder,
    private readonly servicioRepository: ServicioRepository,
    private readonly stateContext: ServicioStateContext,
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
    private readonly commandInvoker: CommandInvoker,
    private readonly commandFactory: CommandFactory,
    @Optional() @Inject(ServicioSubject) private readonly subject?: ServicioSubject,
  ) {}

  /**
   * Crea un nuevo servicio de alquiler usando el patrón Builder
   * El Builder internamente usa el Singleton para generar el número consecutivo
   */
  async crearServicio(
    createServicioDto: CreateServicioAlquilerDto,
  ): Promise<ServicioAlquiler> {
    try {
      // Validar que la fecha no sea en el pasado
      const fechaAlquiler = new Date(createServicioDto.fechaAlquiler);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaAlquiler < hoy) {
        throw new BadRequestException(
          'La fecha de alquiler no puede ser en el pasado',
        );
      }

      // Validar que las prendas existan y estén disponibles
      await this.validarDisponibilidadPrendas(createServicioDto.prendasIds);

      // Usar el Builder para construir el servicio
      // El Builder internamente:
      // 1. Usa el Singleton GeneradorConsecutivo para generar el número
      // 2. Valida disponibilidad de prendas
      // 3. Calcula el valor total
      // 4. Actualiza el estado de las prendas
      const servicio = await this.servicioAlquilerBuilder
        .reset()
        .setCliente(createServicioDto.clienteId)
        .setEmpleado(createServicioDto.empleadoId)
        .setFechaAlquiler(fechaAlquiler)
        .agregarPrendas(createServicioDto.prendasIds)
        .setObservaciones(createServicioDto.observaciones || '')
        .build();

      // Notificar a los observadores (Observer Pattern)
      if (this.subject) {
        await this.subject.notify(ServicioEventType.SERVICIO_CREADO, servicio);
      }

      return servicio;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear servicio: ${error.message}`,
      );
    }
  }

  /**
   * Valida que las prendas existan y estén disponibles
   */
  private async validarDisponibilidadPrendas(
    prendasIds: number[],
  ): Promise<void> {
    const prendas = await this.prendaRepository.find({
      where: { id: In(prendasIds) },
    });

    if (prendas.length !== prendasIds.length) {
      const prendasEncontradas = prendas.map((p) => p.id);
      const prendasNoEncontradas = prendasIds.filter(
        (id) => !prendasEncontradas.includes(id),
      );
      throw new BadRequestException(
        `Las siguientes prendas no fueron encontradas: ${prendasNoEncontradas.join(', ')}`,
      );
    }

    const prendasNoDisponibles = prendas.filter(
      (p) => !p.disponible || p.estado !== 'disponible',
    );

    if (prendasNoDisponibles.length > 0) {
      const referencias = prendasNoDisponibles
        .map((p) => p.referencia)
        .join(', ');
      throw new BadRequestException(
        `Las siguientes prendas no están disponibles: ${referencias}`,
      );
    }
  }

  /**
   * Busca un servicio por su ID
   */
  async buscarPorId(id: number): Promise<ServicioAlquiler> {
    const servicio = await this.servicioRepository.buscarPorId(id);

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }

    return servicio;
  }

  /**
   * Busca un servicio por su número de alquiler
   */
  async buscarPorNumero(numero: number): Promise<ServicioAlquiler> {
    const servicio = await this.servicioRepository.buscarPorNumero(numero);

    if (!servicio) {
      throw new NotFoundException(
        `Servicio con número ${numero} no encontrado`,
      );
    }

    return servicio;
  }

  /**
   * Busca servicios por fecha de alquiler
   */
  async buscarPorFecha(
    fecha: string,
    pagina: number = 1,
    limite: number = 10,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    const fechaBusqueda = new Date(fecha);
    return await this.servicioRepository.buscarPorFecha(
      fechaBusqueda,
      pagina,
      limite,
    );
  }

  /**
   * Busca servicios vigentes por cliente (confirmados o entregados)
   */
  async buscarVigentesPorCliente(
    clienteId: number,
  ): Promise<ServicioAlquiler[]> {
    return await this.servicioRepository.buscarVigentesPorCliente(clienteId);
  }

  /**
   * Busca servicios con filtros y paginación
   */
  async buscarServicios(
    query: QueryServiciosDto,
  ): Promise<PaginationResult<ServicioAlquiler>> {
    const { pagina = 1, limite = 10 } = query;

    // Buscar por cliente
    if (query.clienteId) {
      return await this.servicioRepository.buscarPorCliente(
        query.clienteId,
        pagina,
        limite,
      );
    }

    // Buscar por empleado
    if (query.empleadoId) {
      return await this.servicioRepository.buscarPorEmpleado(
        query.empleadoId,
        pagina,
        limite,
      );
    }

    // Buscar por estado
    if (query.estado) {
      return await this.servicioRepository.buscarPorEstado(
        query.estado,
        pagina,
        limite,
      );
    }

    // Buscar por rango de fechas
    if (query.fechaDesde && query.fechaHasta) {
      const fechaDesde = new Date(query.fechaDesde);
      const fechaHasta = new Date(query.fechaHasta);
      return await this.servicioRepository.buscarPorRangoFechas(
        fechaDesde,
        fechaHasta,
        pagina,
        limite,
      );
    }

    // Buscar por fecha específica
    if (query.fechaDesde) {
      const fecha = new Date(query.fechaDesde);
      return await this.servicioRepository.buscarPorFecha(
        fecha,
        pagina,
        limite,
      );
    }

    // Buscar todos
    return await this.servicioRepository.buscarTodos(pagina, limite);
  }

  /**
   * Actualiza un servicio existente
   * Usa State Pattern para validar modificaciones según el estado actual
   */
  async actualizarServicio(
    id: number,
    updateServicioDto: UpdateServicioAlquilerDto,
  ): Promise<ServicioAlquiler> {
    const servicio = await this.buscarPorId(id);

    // Validar si se puede modificar usando State Pattern
    if (!this.stateContext.puedeModificar(servicio)) {
      throw new BadRequestException(
        `No se puede modificar un servicio en estado ${servicio.estado}`,
      );
    }

    const datosActualizacion: Partial<ServicioAlquiler> = {};

    if (updateServicioDto.fechaDevolucion) {
      datosActualizacion.fechaDevolucion = new Date(
        updateServicioDto.fechaDevolucion,
      );
    }

    if (updateServicioDto.estado) {
      // Las transiciones de estado ahora se manejan mediante métodos específicos
      // Esta actualización directa solo debe usarse para otros campos
      throw new BadRequestException(
        'Use los métodos específicos para cambiar el estado: confirmarServicio, entregarServicio, devolverServicio, cancelarServicio',
      );
    }

    if (updateServicioDto.observaciones !== undefined) {
      datosActualizacion.observaciones = updateServicioDto.observaciones;
    }

    return await this.servicioRepository.actualizar(id, datosActualizacion);
  }

  /**
   * Libera prendas (marca como disponibles)
   */
  private async liberarPrendas(prendasIds: number[]): Promise<void> {
    for (const prendaId of prendasIds) {
      await this.prendaRepository.update(prendaId, {
        disponible: true,
        estado: 'disponible',
      });
    }
  }

  /**
   * Confirma un servicio (pendiente → confirmado)
   * Usa Command Pattern para encapsular la operación con capacidad de undo
   */
  async confirmarServicio(id: number): Promise<ServicioAlquiler> {
    // Crear comando usando Factory
    const command = this.commandFactory.createConfirmarServicioCommand(id);

    // Ejecutar comando a través del Invoker
    // Esto registrará el comando en el historial para permitir undo/redo
    return await this.commandInvoker.execute(command);
  }

  /**
   * Entrega un servicio al cliente (confirmado → entregado)
   * Usa Command Pattern para encapsular la operación con capacidad de undo
   */
  async entregarServicio(id: number): Promise<ServicioAlquiler> {
    // Crear comando usando Factory
    const command = this.commandFactory.createEntregarServicioCommand(id);

    // Ejecutar comando a través del Invoker
    return await this.commandInvoker.execute(command);
  }

  /**
   * Registra la devolución de un servicio (entregado → devuelto)
   * Usa Command Pattern para encapsular la operación con capacidad de undo
   */
  async devolverServicio(id: number): Promise<ServicioAlquiler> {
    // Crear comando usando Factory
    const command = this.commandFactory.createDevolverServicioCommand(id);

    // Ejecutar comando a través del Invoker
    return await this.commandInvoker.execute(command);
  }

  /**
   * Cancela un servicio
   * Usa Command Pattern para encapsular la operación con capacidad de undo
   */
  async cancelarServicio(id: number): Promise<ServicioAlquiler> {
    // Crear comando usando Factory
    const command = this.commandFactory.createCancelarServicioCommand(id);

    // Ejecutar comando a través del Invoker
    return await this.commandInvoker.execute(command);
  }

  /**
   * Deshace la última operación de cambio de estado
   * Utiliza el historial de comandos del Command Pattern
   */
  async deshacerUltimaOperacion(): Promise<void> {
    return await this.commandInvoker.undo();
  }

  /**
   * Rehace la última operación deshecha
   * Utiliza el historial de comandos del Command Pattern
   */
  async rehacerOperacion(): Promise<void> {
    return await this.commandInvoker.redo();
  }

  /**
   * Obtiene el historial de comandos ejecutados
   */
  obtenerHistorialComandos() {
    return this.commandInvoker.getHistory();
  }

  /**
   * Verifica si se puede deshacer una operación
   */
  puedeDeshacerOperacion(): boolean {
    return this.commandInvoker.canUndo();
  }

  /**
   * Verifica si se puede rehacer una operación
   */
  puedeRehacerOperacion(): boolean {
    return this.commandInvoker.canRedo();
  }

  /**
   * Elimina un servicio
   * Usa State Pattern para validar si se puede eliminar
   */
  async eliminarServicio(id: number): Promise<{ mensaje: string }> {
    const servicio = await this.buscarPorId(id);

    // Validar si se puede eliminar usando State Pattern
    if (!this.stateContext.puedeEliminar(servicio)) {
      throw new BadRequestException(
        `No se puede eliminar un servicio en estado ${servicio.estado}. Solo se pueden eliminar servicios pendientes o cancelados.`,
      );
    }

    // Liberar prendas antes de eliminar
    await this.liberarPrendas(servicio.prendas.map((p) => p.id));

    const eliminado = await this.servicioRepository.eliminar(id);

    if (!eliminado) {
      throw new BadRequestException('No se pudo eliminar el servicio');
    }

    return {
      mensaje: `Servicio #${servicio.numero} eliminado exitosamente`,
    };
  }

  /**
   * Obtiene información del estado actual del servicio
   * Incluye transiciones permitidas
   */
  async obtenerInformacionEstado(id: number) {
    const servicio = await this.buscarPorId(id);
    return this.stateContext.obtenerInformacionEstado(servicio);
  }

  /**
   * Obtiene estadísticas de servicios
   */
  async obtenerEstadisticas() {
    const todosServicios = await this.servicioRepository.buscarTodos(1, 10000);

    const estadisticas = {
      total: todosServicios.total,
      porEstado: {} as Record<string, number>,
      valorTotal: 0,
      promedioPrendas: 0,
    };

    // Agrupar por estado
    todosServicios.data.forEach((servicio) => {
      estadisticas.porEstado[servicio.estado] =
        (estadisticas.porEstado[servicio.estado] || 0) + 1;
      estadisticas.valorTotal += Number(servicio.valorTotal);
    });

    // Calcular promedio de prendas
    const totalPrendas = todosServicios.data.reduce(
      (sum, servicio) => sum + (servicio.prendas?.length || 0),
      0,
    );
    estadisticas.promedioPrendas =
      todosServicios.total > 0
        ? Math.round((totalPrendas / todosServicios.total) * 100) / 100
        : 0;

    return estadisticas;
  }
}
