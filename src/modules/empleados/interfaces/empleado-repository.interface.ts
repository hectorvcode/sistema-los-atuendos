import { Empleado } from '../entities/empleado.entity';
import { ServicioAlquiler } from '../../servicios/entities/servicio-alquiler.entity';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface IEmpleadoRepository {
  crear(empleado: Empleado): Promise<Empleado>;
  buscarPorId(id: number): Promise<Empleado | null>;
  buscarPorIdentificacion(
    numeroIdentificacion: string,
  ): Promise<Empleado | null>;
  buscarPorEmail(correoElectronico: string): Promise<Empleado | null>;
  buscarTodos(
    pagina?: number,
    limite?: number,
  ): Promise<PaginationResult<Empleado>>;
  buscarPorCriterios(
    criterios: Partial<Empleado>,
    pagina?: number,
    limite?: number,
  ): Promise<PaginationResult<Empleado>>;
  actualizar(id: number, datos: Partial<Empleado>): Promise<Empleado>;
  eliminar(id: number): Promise<boolean>;
  buscarServiciosPorEmpleado(empleadoId: number): Promise<ServicioAlquiler[]>;
}
