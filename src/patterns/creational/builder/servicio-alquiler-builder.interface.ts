import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import { Cliente } from '../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../modules/empleados/entities/empleado.entity';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';

export interface IServicioAlquilerBuilder {
  setCliente(cliente: Cliente | number): IServicioAlquilerBuilder;
  setEmpleado(empleado: Empleado | number): IServicioAlquilerBuilder;
  setFechaAlquiler(fecha: Date): IServicioAlquilerBuilder;
  agregarPrenda(prenda: Prenda | number): IServicioAlquilerBuilder;
  agregarPrendas(prendas: (Prenda | number)[]): IServicioAlquilerBuilder;
  setObservaciones(observaciones: string): IServicioAlquilerBuilder;
  build(): Promise<ServicioAlquiler>;
  reset(): IServicioAlquilerBuilder;
}
