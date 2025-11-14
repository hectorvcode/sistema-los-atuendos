import { ServicioAlquiler } from '../entities/servicio-alquiler.entity';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface IServicioRepository {
  crear(servicio: ServicioAlquiler): Promise<ServicioAlquiler>;
  buscarPorId(id: number): Promise<ServicioAlquiler | null>;
  buscarPorNumero(numero: number): Promise<ServicioAlquiler | null>;
  buscarPorFecha(fecha: Date, pagina?: number, limite?: number): Promise<PaginationResult<ServicioAlquiler>>;
  buscarPorRangoFechas(fechaDesde: Date, fechaHasta: Date, pagina?: number, limite?: number): Promise<PaginationResult<ServicioAlquiler>>;
  buscarVigentesPorCliente(clienteId: number): Promise<ServicioAlquiler[]>;
  buscarPorCliente(clienteId: number, pagina?: number, limite?: number): Promise<PaginationResult<ServicioAlquiler>>;
  buscarPorEmpleado(empleadoId: number, pagina?: number, limite?: number): Promise<PaginationResult<ServicioAlquiler>>;
  buscarPorEstado(estado: string, pagina?: number, limite?: number): Promise<PaginationResult<ServicioAlquiler>>;
  buscarTodos(pagina?: number, limite?: number): Promise<PaginationResult<ServicioAlquiler>>;
  actualizar(id: number, datos: Partial<ServicioAlquiler>): Promise<ServicioAlquiler>;
  eliminar(id: number): Promise<boolean>;
}