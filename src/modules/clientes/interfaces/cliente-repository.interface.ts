import { Cliente } from '../entities/cliente.entity';
import { ServicioAlquiler } from '../../servicios/entities/servicio-alquiler.entity';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ServiciosClienteResult {
  cliente: Cliente;
  servicios: ServicioAlquiler[];
  totalServicios: number;
  serviciosVigentes: number;
  valorTotalServicios: number;
}

export interface IClienteRepository {
  crear(cliente: Cliente): Promise<Cliente>;
  buscarPorId(id: number): Promise<Cliente | null>;
  buscarPorIdentificacion(
    numeroIdentificacion: string,
  ): Promise<Cliente | null>;
  buscarPorEmail(correoElectronico: string): Promise<Cliente | null>;
  buscarTodos(
    pagina?: number,
    limite?: number,
  ): Promise<PaginationResult<Cliente>>;
  buscarPorCriterios(
    criterios: Partial<Cliente>,
    pagina?: number,
    limite?: number,
  ): Promise<PaginationResult<Cliente>>;
  actualizar(id: number, datos: Partial<Cliente>): Promise<Cliente>;
  eliminar(id: number): Promise<boolean>;
  buscarServiciosPorCliente(
    clienteId: number,
    soloVigentes?: boolean,
  ): Promise<ServicioAlquiler[]>;
}
