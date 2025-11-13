// src/patterns/structural/facade/services/negocio-facade.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entidades (ajustar rutas según tu estructura)
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity';
import { Cliente } from '../../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../../modules/empleados/entities/empleado.entity';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

// Otros servicios existentes
import { CompositeManagerService } from '../../composite/services/composite-manager.service';
import { DecoratorService } from '../../decorator/decorator.service';

// Interfaces
import {
  INegocioFacade,
  ClienteData,
  EmpleadoData,
  PrendaData,
  SolicitudAlquiler,
  ServicioAlquilerCompleto,
  SolicitudLavanderia,
  EstadisticasNegocio,
} from '../interfaces/negocio-facade.interface';

@Injectable()
export class NegocioFacadeService implements INegocioFacade {
  constructor(
    // Repositorios principales
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,

    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,

    // Servicios de patrones estructurales
    private readonly compositeManager: CompositeManagerService,
    private readonly decoratorService: DecoratorService,
  ) {}

  // ============================================================================
  // OPERACIONES DE REGISTRO
  // ============================================================================

  async registrarCliente(
    clienteData: ClienteData,
  ): Promise<{ exito: boolean; mensaje: string; clienteId?: string }> {
    try {
      // Validar que no existe cliente con el mismo número de identificación
      const clienteExistente = await this.clienteRepository.findOne({
        where: { numeroIdentificacion: clienteData.numeroIdentificacion },
      });

      if (clienteExistente) {
        return {
          exito: false,
          mensaje: `Ya existe un cliente con el número de identificación ${clienteData.numeroIdentificacion}`,
        };
      }

      // Crear nuevo cliente
      const nuevoCliente = this.clienteRepository.create({
        numeroIdentificacion: clienteData.numeroIdentificacion,
        nombre: clienteData.nombre,
        direccion: clienteData.direccion,
        telefono: clienteData.telefono,
        correoElectronico: clienteData.correoElectronico,
      });

      const clienteGuardado = await this.clienteRepository.save(nuevoCliente);

      return {
        exito: true,
        mensaje: `Cliente ${clienteData.nombre} registrado exitosamente`,
        clienteId: clienteGuardado.id.toString(),
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error al registrar cliente: ${error.message}`,
      };
    }
  }

  async registrarEmpleado(
    empleadoData: EmpleadoData,
  ): Promise<{ exito: boolean; mensaje: string; empleadoId?: string }> {
    try {
      // Validar que no existe empleado con el mismo número de identificación
      const empleadoExistente = await this.empleadoRepository.findOne({
        where: { numeroIdentificacion: empleadoData.numeroIdentificacion },
      });

      if (empleadoExistente) {
        return {
          exito: false,
          mensaje: `Ya existe un empleado con el número de identificación ${empleadoData.numeroIdentificacion}`,
        };
      }

      // Crear nuevo empleado
      const nuevoEmpleado = this.empleadoRepository.create({
        numeroIdentificacion: empleadoData.numeroIdentificacion,
        nombre: empleadoData.nombre,
        direccion: empleadoData.direccion,
        telefono: empleadoData.telefono,
        cargo: empleadoData.cargo,
      });

      const empleadoGuardado =
        await this.empleadoRepository.save(nuevoEmpleado);

      return {
        exito: true,
        mensaje: `Empleado ${empleadoData.nombre} registrado exitosamente`,
        empleadoId: empleadoGuardado.id.toString(),
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error al registrar empleado: ${error.message}`,
      };
    }
  }

  async registrarPrenda(
    prendaData: PrendaData,
  ): Promise<{ exito: boolean; mensaje: string; prendaId?: string }> {
    try {
      // Validar que no existe prenda con la misma referencia
      const prendaExistente = await this.prendaRepository.findOne({
        where: { referencia: prendaData.referencia },
      });

      if (prendaExistente) {
        return {
          exito: false,
          mensaje: `Ya existe una prenda con la referencia ${prendaData.referencia}`,
        };
      }

      // Crear nueva prenda
      const nuevaPrendaData = {
        referencia: prendaData.referencia,
        color: prendaData.color,
        marca: prendaData.marca,
        talla: prendaData.talla,
        valorAlquiler: prendaData.valorAlquiler,
        disponible: true,
        estado: 'disponible',
        ...prendaData.detallesEspecificos,
      };

      const nuevaPrenda = this.prendaRepository.create(nuevaPrendaData);
      const resultado = await this.prendaRepository.save(nuevaPrenda);
      const prendaGuardada = Array.isArray(resultado)
        ? resultado[0]
        : resultado;

      return {
        exito: true,
        mensaje: `Prenda ${prendaData.referencia} registrada exitosamente`,
        prendaId: (prendaGuardada as any).id.toString(),
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error al registrar prenda: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // OPERACIONES DE ALQUILER (FUNCIONALIDAD PRINCIPAL)
  // ============================================================================

  async crearServicioAlquiler(solicitud: SolicitudAlquiler): Promise<{
    exito: boolean;
    servicio?: ServicioAlquilerCompleto;
    errores?: string[];
  }> {
    try {
      const errores: string[] = [];

      // 1. Validar que el cliente existe
      const cliente = await this.clienteRepository.findOne({
        where: { numeroIdentificacion: solicitud.numeroIdentificacionCliente },
      });

      if (!cliente) {
        errores.push(
          `Cliente con identificación ${solicitud.numeroIdentificacionCliente} no encontrado`,
        );
      }

      // 2. Validar que el empleado existe
      const empleado = await this.empleadoRepository.findOne({
        where: { numeroIdentificacion: solicitud.numeroIdentificacionEmpleado },
      });

      if (!empleado) {
        errores.push(
          `Empleado con identificación ${solicitud.numeroIdentificacionEmpleado} no encontrado`,
        );
      }

      // 3. Validar que todas las prendas existen y están disponibles
      const prendas: Prenda[] = [];
      for (const referencia of solicitud.referenciasPrendas) {
        const prenda = await this.prendaRepository.findOne({
          where: { referencia },
        });

        if (!prenda) {
          errores.push(`Prenda con referencia ${referencia} no encontrada`);
        } else if (!prenda.disponible) {
          errores.push(`Prenda ${referencia} no está disponible`);
        } else {
          prendas.push(prenda);
        }
      }

      // 4. Si hay errores, retornar sin crear el servicio
      if (errores.length > 0) {
        return {
          exito: false,
          errores,
        };
      }

      // 5. Generar número de servicio consecutivo
      const ultimoServicio = await this.servicioRepository.find({
        order: { numero: 'DESC' },
        take: 1,
      });
      const numeroServicio =
        ultimoServicio.length > 0 ? ultimoServicio[0].numero + 1 : 1;

      // 6. Calcular valor total
      const valorTotal = prendas.reduce(
        (total, prenda) => total + Number(prenda.valorAlquiler),
        0,
      );

      // 7. Crear el servicio de alquiler
      const nuevoServicio = this.servicioRepository.create({
        numero: numeroServicio,
        fechaSolicitud: new Date(),
        fechaAlquiler: new Date(solicitud.fechaAlquiler),
        cliente: cliente!,
        empleado: empleado!,
        // prendas: prendas, // Ajustar según tu relación
        valorTotal,
        estado: 'pendiente',
      });

      const servicioGuardado =
        await this.servicioRepository.save(nuevoServicio);

      // 8. Marcar prendas como no disponibles (reservadas)
      for (const prenda of prendas) {
        prenda.disponible = false;
        prenda.estado = 'reservado';
        await this.prendaRepository.save(prenda);
      }

      // 9. Construir respuesta completa
      const servicioCompleto: ServicioAlquilerCompleto = {
        numero: servicioGuardado.numero,
        cliente: {
          numeroIdentificacion: cliente!.numeroIdentificacion,
          nombre: cliente!.nombre,
          direccion: cliente!.direccion,
          telefono: cliente!.telefono,
          correoElectronico: cliente!.correoElectronico,
        },
        empleado: {
          numeroIdentificacion: empleado!.numeroIdentificacion,
          nombre: empleado!.nombre,
          direccion: empleado!.direccion,
          telefono: empleado!.telefono,
          cargo: empleado!.cargo,
        },
        prendas: prendas.map((p) => ({
          referencia: p.referencia,
          color: p.color,
          marca: p.marca,
          talla: p.talla,
          valorAlquiler: Number(p.valorAlquiler),
          tipo: this.determinarTipoPrenda(p),
        })),
        fechaSolicitud: servicioGuardado.fechaSolicitud,
        fechaAlquiler: servicioGuardado.fechaAlquiler,
        valorTotal: servicioGuardado.valorTotal,
        estado: servicioGuardado.estado as any,
      };

      return {
        exito: true,
        servicio: servicioCompleto,
      };
    } catch (error) {
      return {
        exito: false,
        errores: [`Error interno: ${error.message}`],
      };
    }
  }

  async confirmarServicioAlquiler(
    numeroServicio: number,
  ): Promise<{ exito: boolean; mensaje: string }> {
    try {
      const servicio = await this.servicioRepository.findOne({
        where: { numero: numeroServicio },
      });

      if (!servicio) {
        return {
          exito: false,
          mensaje: `Servicio ${numeroServicio} no encontrado`,
        };
      }

      if (servicio.estado !== 'pendiente') {
        return {
          exito: false,
          mensaje: `El servicio ${numeroServicio} no puede ser confirmado. Estado actual: ${servicio.estado}`,
        };
      }

      servicio.estado = 'confirmado';
      await this.servicioRepository.save(servicio);

      return {
        exito: true,
        mensaje: `Servicio ${numeroServicio} confirmado exitosamente`,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error al confirmar servicio: ${error.message}`,
      };
    }
  }

  async entregarServicioAlquiler(
    numeroServicio: number,
  ): Promise<{ exito: boolean; mensaje: string }> {
    try {
      const servicio = await this.servicioRepository.findOne({
        where: { numero: numeroServicio },
      });

      if (!servicio) {
        return {
          exito: false,
          mensaje: `Servicio ${numeroServicio} no encontrado`,
        };
      }

      if (servicio.estado !== 'confirmado') {
        return {
          exito: false,
          mensaje: `El servicio ${numeroServicio} debe estar confirmado para poder entregarse. Estado actual: ${servicio.estado}`,
        };
      }

      servicio.estado = 'entregado';
      await this.servicioRepository.save(servicio);

      return {
        exito: true,
        mensaje: `Servicio ${numeroServicio} entregado exitosamente`,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error al entregar servicio: ${error.message}`,
      };
    }
  }

  async devolverServicioAlquiler(
    numeroServicio: number,
  ): Promise<{ exito: boolean; mensaje: string; prendasParaLavar?: string[] }> {
    try {
      const servicio = await this.servicioRepository.findOne({
        where: { numero: numeroServicio },
        relations: ['prendas'], // Ajustar según tu relación
      });

      if (!servicio) {
        return {
          exito: false,
          mensaje: `Servicio ${numeroServicio} no encontrado`,
        };
      }

      if (servicio.estado !== 'entregado') {
        return {
          exito: false,
          mensaje: `El servicio ${numeroServicio} debe estar entregado para poder devolverse. Estado actual: ${servicio.estado}`,
        };
      }

      // Marcar servicio como devuelto
      servicio.estado = 'devuelto';
      await this.servicioRepository.save(servicio);

      // Marcar todas las prendas para lavado
      const prendasParaLavar: string[] = [];
      const prendas = await this.prendaRepository.find({
        // where: { servicioId: servicio.id } // Ajustar según tu relación
      });

      for (const prenda of prendas) {
        prenda.estado = 'requiere_lavado';
        prenda.disponible = false;
        await this.prendaRepository.save(prenda);
        prendasParaLavar.push(prenda.referencia);

        // Registrar automáticamente en cola de lavandería
        await this.registrarPrendaParaLavanderia({
          referenciaPrenda: prenda.referencia,
          prioridad: 'normal',
          razonPrioridad: 'Devolución de alquiler',
        });
      }

      return {
        exito: true,
        mensaje: `Servicio ${numeroServicio} devuelto exitosamente. ${prendasParaLavar.length} prendas enviadas a lavandería`,
        prendasParaLavar,
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error al devolver servicio: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // OPERACIONES DE CONSULTA
  // ============================================================================

  async consultarServicioAlquiler(
    numeroServicio: number,
  ): Promise<ServicioAlquilerCompleto | null> {
    try {
      const servicio = await this.servicioRepository.findOne({
        where: { numero: numeroServicio },
        relations: ['cliente', 'empleado', 'prendas'], // Ajustar según tus relaciones
      });

      if (!servicio) {
        return null;
      }

      // Obtener prendas asociadas (ajustar según tu implementación)
      const prendas = await this.prendaRepository.find({
        // where: { servicioId: servicio.id } // Ajustar según tu relación
      });

      return {
        numero: servicio.numero,
        cliente: {
          numeroIdentificacion: servicio.cliente.numeroIdentificacion,
          nombre: servicio.cliente.nombre,
          direccion: servicio.cliente.direccion,
          telefono: servicio.cliente.telefono,
          correoElectronico: servicio.cliente.correoElectronico,
        },
        empleado: {
          numeroIdentificacion: servicio.empleado.numeroIdentificacion,
          nombre: servicio.empleado.nombre,
          direccion: servicio.empleado.direccion,
          telefono: servicio.empleado.telefono,
          cargo: servicio.empleado.cargo,
        },
        prendas: prendas.map((p) => ({
          referencia: p.referencia,
          color: p.color,
          marca: p.marca,
          talla: p.talla,
          valorAlquiler: Number(p.valorAlquiler),
          tipo: this.determinarTipoPrenda(p),
        })),
        fechaSolicitud: servicio.fechaSolicitud,
        fechaAlquiler: servicio.fechaAlquiler,
        valorTotal: servicio.valorTotal,
        estado: servicio.estado as any,
      };
    } catch (error) {
      console.error('Error consultando servicio:', error);
      return null;
    }
  }

  async consultarServiciosPorCliente(
    clienteId: string,
  ): Promise<ServicioAlquilerCompleto[]> {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { numeroIdentificacion: clienteId },
      });

      if (!cliente) {
        return [];
      }

      const servicios = await this.servicioRepository.find({
        where: { cliente: { id: cliente.id } },
        relations: ['cliente', 'empleado', 'prendas'],
        order: { fechaAlquiler: 'DESC' },
      });

      const serviciosCompletos: ServicioAlquilerCompleto[] = [];

      for (const servicio of servicios) {
        const servicioCompleto = await this.consultarServicioAlquiler(
          servicio.numero,
        );
        if (servicioCompleto) {
          serviciosCompletos.push(servicioCompleto);
        }
      }

      return serviciosCompletos;
    } catch (error) {
      console.error('Error consultando servicios por cliente:', error);
      return [];
    }
  }

  async consultarServiciosPorFecha(
    fecha: string,
  ): Promise<ServicioAlquilerCompleto[]> {
    try {
      const fechaConsulta = new Date(fecha);

      const servicios = await this.servicioRepository.find({
        where: {
          fechaAlquiler: fechaConsulta,
        },
        relations: ['cliente', 'empleado', 'prendas'],
        order: { numero: 'ASC' },
      });

      const serviciosCompletos: ServicioAlquilerCompleto[] = [];

      for (const servicio of servicios) {
        const servicioCompleto = await this.consultarServicioAlquiler(
          servicio.numero,
        );
        if (servicioCompleto) {
          serviciosCompletos.push(servicioCompleto);
        }
      }

      return serviciosCompletos;
    } catch (error) {
      console.error('Error consultando servicios por fecha:', error);
      return [];
    }
  }

  async consultarPrendasPorTalla(talla: string): Promise<{
    vestidos: PrendaData[];
    trajes: PrendaData[];
    disfraces: PrendaData[];
  }> {
    try {
      const prendasPorTalla = await this.prendaRepository.find({
        where: { talla },
      });

      const resultado = {
        vestidos: [] as PrendaData[],
        trajes: [] as PrendaData[],
        disfraces: [] as PrendaData[],
      };

      for (const prenda of prendasPorTalla) {
        const prendaData: PrendaData = {
          referencia: prenda.referencia,
          color: prenda.color,
          marca: prenda.marca,
          talla: prenda.talla,
          valorAlquiler: Number(prenda.valorAlquiler),
          tipo: this.determinarTipoPrenda(prenda),
        };

        if (prendaData.tipo === 'vestido_dama') {
          resultado.vestidos.push(prendaData);
        } else if (prendaData.tipo === 'traje_caballero') {
          resultado.trajes.push(prendaData);
        } else if (prendaData.tipo === 'disfraz') {
          resultado.disfraces.push(prendaData);
        }
      }

      return resultado;
    } catch (error) {
      console.error('Error consultando prendas por talla:', error);
      return { vestidos: [], trajes: [], disfraces: [] };
    }
  }

  async consultarPrendasDisponibles(): Promise<PrendaData[]> {
    try {
      const prendasDisponibles = await this.prendaRepository.find({
        where: { disponible: true },
      });

      return prendasDisponibles.map((prenda) => ({
        referencia: prenda.referencia,
        color: prenda.color,
        marca: prenda.marca,
        talla: prenda.talla,
        valorAlquiler: Number(prenda.valorAlquiler),
        tipo: this.determinarTipoPrenda(prenda),
      }));
    } catch (error) {
      console.error('Error consultando prendas disponibles:', error);
      return [];
    }
  }

  // ============================================================================
  // OPERACIONES DE LAVANDERÍA (INTEGRACIÓN CON DECORATOR)
  // ============================================================================

  async registrarPrendaParaLavanderia(
    solicitud: SolicitudLavanderia,
  ): Promise<{ exito: boolean; mensaje: string; posicionEnCola?: number }> {
    try {
      // Usar el DecoratorService para manejar prioridades
      const configuraciones: any = {};

      if (solicitud.prioridad === 'alta') {
        configuraciones.administrativa = {
          nivel: 'alta',
          razon: solicitud.razonPrioridad || 'Prioridad alta solicitada',
          solicitadoPor: 'Sistema',
        };
      } else if (solicitud.prioridad === 'urgente') {
        configuraciones.administrativa = {
          nivel: 'urgente',
          razon: solicitud.razonPrioridad || 'Urgente solicitado',
          solicitadoPor: 'Sistema',
        };
      }

      const prendaLavanderia =
        await this.decoratorService.procesarSolicitudLavanderia({
          referenciaPrenda: solicitud.referenciaPrenda,
          configuraciones,
        });

      return {
        exito: true,
        mensaje: `Prenda ${solicitud.referenciaPrenda} registrada para lavandería con prioridad ${prendaLavanderia.calcularPrioridad()}`,
        posicionEnCola: 1, // Calcular posición real según prioridad
      };
    } catch (error) {
      return {
        exito: false,
        mensaje: `Error al registrar prenda para lavandería: ${error.message}`,
      };
    }
  }

  async visualizarColaLavanderia(): Promise<{
    prendas: any[];
    totalPendientes: number;
  }> {
    try {
      const prendasEnLavanderia = await this.prendaRepository.find({
        where: { estado: 'requiere_lavado' },
      });

      const prendasConPrioridad: Array<{
        referencia: string;
        prioridad: number;
        razones: string[];
        tipoLavado: string;
        costo: number;
      }> = [];

      for (const prenda of prendasEnLavanderia) {
        const prendaLavanderia =
          await this.decoratorService.crearPrendaLavanderia(prenda.referencia);
        const detalle = prendaLavanderia.obtenerDetalleCompleto();
        prendasConPrioridad.push({
          referencia: detalle.referencia,
          prioridad: detalle.prioridad,
          razones: detalle.razones,
          tipoLavado: detalle.tipoLavado,
          costo: detalle.costo,
        });
      }

      // Ordenar por prioridad
      prendasConPrioridad.sort((a, b) => b.prioridad - a.prioridad);

      return {
        prendas: prendasConPrioridad,
        totalPendientes: prendasConPrioridad.length,
      };
    } catch (error) {
      console.error('Error visualizando cola de lavandería:', error);
      return {
        prendas: [],
        totalPendientes: 0,
      };
    }
  }

  async enviarPrendasALavanderia(
    cantidad: number,
  ): Promise<{ exito: boolean; prendasEnviadas: any[]; mensaje: string }> {
    try {
      const cola = await this.visualizarColaLavanderia();

      if (cola.totalPendientes === 0) {
        return {
          exito: false,
          prendasEnviadas: [],
          mensaje: 'No hay prendas pendientes para envío a lavandería',
        };
      }

      const cantidadAEnviar = Math.min(cantidad, cola.totalPendientes);
      const prendasAEnviar = cola.prendas.slice(0, cantidadAEnviar);

      // Actualizar estado de las prendas enviadas
      for (const prendaDetalle of prendasAEnviar) {
        const prenda = await this.prendaRepository.findOne({
          where: { referencia: prendaDetalle.referencia },
        });

        if (prenda) {
          prenda.estado = 'en_lavanderia';
          await this.prendaRepository.save(prenda);
        }
      }

      return {
        exito: true,
        prendasEnviadas: prendasAEnviar,
        mensaje: `${cantidadAEnviar} prendas enviadas a lavandería exitosamente`,
      };
    } catch (error) {
      return {
        exito: false,
        prendasEnviadas: [],
        mensaje: `Error enviando prendas a lavandería: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // OPERACIONES DE ANÁLISIS Y ESTADÍSTICAS
  // ============================================================================

  async obtenerEstadisticasNegocio(): Promise<EstadisticasNegocio> {
    try {
      const [
        totalServicios,
        serviciosDelMes,
        clientesActivos,
        prendasDisponibles,
        prendasEnLavanderia,
        ingresosTotales,
      ] = await Promise.all([
        this.servicioRepository.count(),
        this.servicioRepository.count({
          where: {
            fechaSolicitud: new Date(), // Ajustar para mes actual
          },
        }),
        this.clienteRepository.count(),
        this.prendaRepository.count({ where: { disponible: true } }),
        this.prendaRepository.count({ where: { estado: 'requiere_lavado' } }),
        this.servicioRepository
          .createQueryBuilder('servicio')
          .select('SUM(servicio.valorTotal)', 'total')
          .getRawOne(),
      ]);

      const clientesFrecuentes = await this.obtenerClientesFrecuentes(5);
      const prendasPopulares = await this.obtenerPrendasPopulares(5);

      return {
        totalServicios: totalServicios || 0,
        ingresosTotales: Number(ingresosTotales?.total) || 0,
        clientesActivos: clientesActivos || 0,
        prendasDisponibles: prendasDisponibles || 0,
        prendasEnLavanderia: prendasEnLavanderia || 0,
        serviciosDelMes: serviciosDelMes || 0,
        clientesFrecuentes,
        prendasPopulares,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalServicios: 0,
        ingresosTotales: 0,
        clientesActivos: 0,
        prendasDisponibles: 0,
        prendasEnLavanderia: 0,
        serviciosDelMes: 0,
        clientesFrecuentes: [],
        prendasPopulares: [],
      };
    }
  }

  async obtenerReporteVentas(): Promise<{
    ingresos: number;
    servicios: number;
    detalles: any[];
  }> {
    try {
      const servicios = await this.servicioRepository.find({
        where: {
          fechaAlquiler: new Date(), // Usar Between para rango de fechas
        },
        relations: ['cliente', 'empleado'],
      });

      const ingresos = servicios.reduce(
        (total, servicio) => total + servicio.valorTotal,
        0,
      );

      return {
        ingresos,
        servicios: servicios.length,
        detalles: servicios.map((s) => ({
          numero: s.numero,
          cliente: s.cliente.nombre,
          empleado: s.empleado.nombre,
          fecha: s.fechaAlquiler,
          valor: s.valorTotal,
        })),
      };
    } catch (error) {
      console.error('Error obteniendo reporte de ventas:', error);
      return {
        ingresos: 0,
        servicios: 0,
        detalles: [],
      };
    }
  }

  async obtenerClientesFrecuentes(limite: number = 10): Promise<ClienteData[]> {
    try {
      // Query para obtener clientes con más servicios
      const clientesConConteos = await this.servicioRepository
        .createQueryBuilder('servicio')
        .select('cliente.id', 'clienteId')
        .addSelect('COUNT(servicio.id)', 'totalServicios')
        .leftJoin('servicio.cliente', 'cliente')
        .groupBy('cliente.id')
        .orderBy('totalServicios', 'DESC')
        .limit(limite)
        .getRawMany();

      const clientesFrecuentes: ClienteData[] = [];

      for (const item of clientesConConteos) {
        const cliente = await this.clienteRepository.findOne({
          where: { id: item.clienteId },
        });

        if (cliente) {
          clientesFrecuentes.push({
            numeroIdentificacion: cliente.numeroIdentificacion,
            nombre: cliente.nombre,
            direccion: cliente.direccion,
            telefono: cliente.telefono,
            correoElectronico: cliente.correoElectronico,
          });
        }
      }

      return clientesFrecuentes;
    } catch (error) {
      console.error('Error obteniendo clientes frecuentes:', error);
      return [];
    }
  }

  async obtenerPrendasPopulares(limite: number = 10): Promise<PrendaData[]> {
    try {
      // Lógica para determinar prendas más alquiladas
      // Esto requeriría una relación entre servicios y prendas

      const prendas = await this.prendaRepository.find({
        take: limite,
        order: { valorAlquiler: 'DESC' }, // Por ahora ordenar por valor
      });

      return prendas.map((prenda) => ({
        referencia: prenda.referencia,
        color: prenda.color,
        marca: prenda.marca,
        talla: prenda.talla,
        valorAlquiler: Number(prenda.valorAlquiler),
        tipo: this.determinarTipoPrenda(prenda),
      }));
    } catch (error) {
      console.error('Error obteniendo prendas populares:', error);
      return [];
    }
  }

  // ============================================================================
  // OPERACIONES DE VALIDACIÓN
  // ============================================================================

  async validarDisponibilidadPrendas(
    referencias: string[],
  ): Promise<{ disponibles: string[]; noDisponibles: string[] }> {
    try {
      const disponibles: string[] = [];
      const noDisponibles: string[] = [];

      for (const referencia of referencias) {
        const prenda = await this.prendaRepository.findOne({
          where: { referencia },
        });

        if (!prenda) {
          noDisponibles.push(referencia);
        } else if (!prenda.disponible) {
          noDisponibles.push(referencia);
        } else {
          // Verificar conflictos con otros alquileres en la fecha específica
          // Esta lógica requeriría verificar servicios activos
          disponibles.push(referencia);
        }
      }

      return { disponibles, noDisponibles };
    } catch (error) {
      console.error('Error validando disponibilidad:', error);
      return { disponibles: [], noDisponibles: referencias };
    }
  }

  async calcularCostoAlquiler(referencias: string[]): Promise<{
    costoTotal: number;
    detallesPrendas: { referencia: string; valor: number }[];
  }> {
    try {
      const detallesPrendas: { referencia: string; valor: number }[] = [];
      let costoTotal = 0;

      for (const referencia of referencias) {
        const prenda = await this.prendaRepository.findOne({
          where: { referencia },
        });

        if (prenda) {
          const valor = Number(prenda.valorAlquiler);
          detallesPrendas.push({ referencia, valor });
          costoTotal += valor;
        }
      }

      return { costoTotal, detallesPrendas };
    } catch (error) {
      console.error('Error calculando costo:', error);
      return { costoTotal: 0, detallesPrendas: [] };
    }
  }

  async verificarEstadoCliente(clienteId: string): Promise<{
    activo: boolean;
    serviciosPendientes: number;
    historial: any[];
  }> {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { numeroIdentificacion: clienteId },
      });

      if (!cliente) {
        return { activo: false, serviciosPendientes: 0, historial: [] };
      }

      const serviciosPendientes = await this.servicioRepository.count({
        where: {
          cliente: { id: cliente.id },
          estado: 'pendiente',
        },
      });

      const historial = await this.servicioRepository.find({
        where: { cliente: { id: cliente.id } },
        order: { fechaSolicitud: 'DESC' },
        take: 10,
      });

      return {
        activo: true,
        serviciosPendientes,
        historial: historial.map((s) => ({
          numero: s.numero,
          fecha: s.fechaAlquiler,
          valor: s.valorTotal,
          estado: s.estado,
        })),
      };
    } catch (error) {
      console.error('Error verificando estado del cliente:', error);
      return { activo: false, serviciosPendientes: 0, historial: [] };
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ============================================================================

  private determinarTipoPrenda(
    prenda: Prenda,
  ): 'vestido_dama' | 'traje_caballero' | 'disfraz' {
    // Lógica para determinar el tipo basándose en las propiedades de la prenda
    // Esto dependerá de cómo tengas implementada la herencia en tus entidades

    if ('tienePedreria' in prenda || 'esLargo' in prenda) {
      return 'vestido_dama';
    } else if (
      'tipo' in prenda &&
      ['convencional', 'frac', 'sacoleva'].includes((prenda as any).tipo)
    ) {
      return 'traje_caballero';
    } else if ('nombre' in prenda) {
      return 'disfraz';
    }

    // Default basándose en nombre o referencia
    const ref = prenda.referencia.toLowerCase();
    if (ref.includes('vd') || ref.includes('vestido')) {
      return 'vestido_dama';
    } else if (ref.includes('tc') || ref.includes('traje')) {
      return 'traje_caballero';
    } else {
      return 'disfraz';
    }
  }
}
