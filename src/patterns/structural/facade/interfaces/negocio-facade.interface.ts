// src/patterns/structural/facade/interfaces/negocio-facade.interface.ts

export interface ClienteData {
  numeroIdentificacion: string;
  nombre: string;
  direccion: string;
  telefono: string;
  correoElectronico: string;
}

export interface EmpleadoData {
  numeroIdentificacion: string;
  nombre: string;
  direccion: string;
  telefono: string;
  cargo: string;
}

export interface PrendaData {
  referencia: string;
  color: string;
  marca: string;
  talla: string;
  valorAlquiler: number;
  tipo: 'vestido_dama' | 'traje_caballero' | 'disfraz';
  detallesEspecificos?: any;
}

export interface SolicitudAlquiler {
  numeroIdentificacionCliente: string;
  numeroIdentificacionEmpleado: string;
  referenciasPrendas: string[];
  fechaAlquiler: string;
}

export interface ServicioAlquilerCompleto {
  numero: number;
  cliente: ClienteData;
  empleado: EmpleadoData;
  prendas: PrendaData[];
  fechaSolicitud: Date;
  fechaAlquiler: Date;
  valorTotal: number;
  estado: 'pendiente' | 'confirmado' | 'entregado' | 'devuelto';
}

export interface ConsultaServicios {
  clienteId?: string;
  fechaAlquiler?: string;
  numeroServicio?: number;
}

export interface ConsultaPrendas {
  talla?: string;
  tipo?: string;
  disponible?: boolean;
}

export interface SolicitudLavanderia {
  referenciaPrenda: string;
  prioridad?: 'normal' | 'alta' | 'urgente';
  razonPrioridad?: string;
}

export interface EstadisticasNegocio {
  totalServicios: number;
  ingresosTotales: number;
  clientesActivos: number;
  prendasDisponibles: number;
  prendasEnLavanderia: number;
  serviciosDelMes: number;
  clientesFrecuentes: ClienteData[];
  prendasPopulares: PrendaData[];
}

export interface INegocioFacade {
  // Operaciones de Registro
  registrarCliente(
    clienteData: ClienteData,
  ): Promise<{ exito: boolean; mensaje: string; clienteId?: string }>;
  registrarEmpleado(
    empleadoData: EmpleadoData,
  ): Promise<{ exito: boolean; mensaje: string; empleadoId?: string }>;
  registrarPrenda(
    prendaData: PrendaData,
  ): Promise<{ exito: boolean; mensaje: string; prendaId?: string }>;

  // Operaciones de Alquiler (Funcionalidad Principal)
  crearServicioAlquiler(solicitud: SolicitudAlquiler): Promise<{
    exito: boolean;
    servicio?: ServicioAlquilerCompleto;
    errores?: string[];
  }>;
  confirmarServicioAlquiler(
    numeroServicio: number,
  ): Promise<{ exito: boolean; mensaje: string }>;
  entregarServicioAlquiler(
    numeroServicio: number,
  ): Promise<{ exito: boolean; mensaje: string }>;
  devolverServicioAlquiler(
    numeroServicio: number,
  ): Promise<{ exito: boolean; mensaje: string; prendasParaLavar?: string[] }>;

  // Operaciones de Consulta
  consultarServicioAlquiler(
    numeroServicio: number,
  ): Promise<ServicioAlquilerCompleto | null>;
  consultarServiciosPorCliente(
    clienteId: string,
  ): Promise<ServicioAlquilerCompleto[]>;
  consultarServiciosPorFecha(
    fecha: string,
  ): Promise<ServicioAlquilerCompleto[]>;
  consultarPrendasPorTalla(talla: string): Promise<{
    vestidos: PrendaData[];
    trajes: PrendaData[];
    disfraces: PrendaData[];
  }>;
  consultarPrendasDisponibles(): Promise<PrendaData[]>;

  // Operaciones de Lavandería
  registrarPrendaParaLavanderia(
    solicitud: SolicitudLavanderia,
  ): Promise<{ exito: boolean; mensaje: string; posicionEnCola?: number }>;
  visualizarColaLavanderia(): Promise<{
    prendas: any[];
    totalPendientes: number;
  }>;
  enviarPrendasALavanderia(
    cantidad: number,
  ): Promise<{ exito: boolean; prendasEnviadas: any[]; mensaje: string }>;

  // Operaciones de Análisis y Estadísticas
  obtenerEstadisticasNegocio(): Promise<EstadisticasNegocio>;
  obtenerReporteVentas(
    fechaInicio: string,
    fechaFin: string,
  ): Promise<{ ingresos: number; servicios: number; detalles: any[] }>;
  obtenerClientesFrecuentes(limite?: number): Promise<ClienteData[]>;
  obtenerPrendasPopulares(limite?: number): Promise<PrendaData[]>;

  // Operaciones de Validación de Negocio
  validarDisponibilidadPrendas(
    referencias: string[],
    fecha: string,
  ): Promise<{ disponibles: string[]; noDisponibles: string[] }>;
  calcularCostoAlquiler(referencias: string[]): Promise<{
    costoTotal: number;
    detallesPrendas: { referencia: string; valor: number }[];
  }>;
  verificarEstadoCliente(clienteId: string): Promise<{
    activo: boolean;
    serviciosPendientes: number;
    historial: any[];
  }>;
}
