import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IServicioAlquilerBuilder } from './servicio-alquiler-builder.interface';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import { Cliente } from '../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../modules/empleados/entities/empleado.entity';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';
import { GeneradorConsecutivo } from '../singleton/generador-consecutivo.singleton';

@Injectable()
export class ServicioAlquilerBuilder implements IServicioAlquilerBuilder {
  private servicio: Partial<ServicioAlquiler> = {};
  private prendasSeleccionadas: Prenda[] = [];

  constructor(
    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Prenda)
    private readonly prendaRepository: Repository<Prenda>,
    private readonly generadorConsecutivo: GeneradorConsecutivo,
  ) {
    this.reset();
  }

  setCliente(cliente: Cliente | number): IServicioAlquilerBuilder {
    if (typeof cliente === 'number') {
      this.servicio.cliente = { id: cliente } as Cliente;
    } else {
      this.servicio.cliente = cliente;
    }
    return this;
  }

  setEmpleado(empleado: Empleado | number): IServicioAlquilerBuilder {
    if (typeof empleado === 'number') {
      this.servicio.empleado = { id: empleado } as Empleado;
    } else {
      this.servicio.empleado = empleado;
    }
    return this;
  }

  setFechaAlquiler(fecha: Date): IServicioAlquilerBuilder {
    this.servicio.fechaAlquiler = fecha;
    return this;
  }

  agregarPrenda(prenda: Prenda | number): IServicioAlquilerBuilder {
    if (typeof prenda === 'number') {
      this.prendasSeleccionadas.push({ id: prenda } as Prenda);
    } else {
      this.prendasSeleccionadas.push(prenda);
    }
    return this;
  }

  agregarPrendas(prendas: (Prenda | number)[]): IServicioAlquilerBuilder {
    prendas.forEach((prenda) => this.agregarPrenda(prenda));
    return this;
  }

  setObservaciones(observaciones: string): IServicioAlquilerBuilder {
    this.servicio.observaciones = observaciones;
    return this;
  }

  async build(): Promise<ServicioAlquiler> {
    try {
      // Validaciones antes de construir
      await this.validarDatos();

      // Generar número consecutivo

      const numero: number =
        await this.generadorConsecutivo.obtenerSiguienteNumero();

      // Cargar entidades completas si solo tenemos IDs
      const clienteCompleto: Cliente = await this.cargarCliente();
      const empleadoCompleto: Empleado = await this.cargarEmpleado();
      const prendasCompletas: Prenda[] = await this.cargarPrendas();

      // Calcular valor total
      const valorTotal: number = this.calcularValorTotal(prendasCompletas);

      // Crear servicio
      const nuevoServicio = this.servicioRepository.create({
        numero,
        fechaSolicitud: new Date(),
        fechaAlquiler: this.servicio.fechaAlquiler,
        estado: 'pendiente' as const,
        valorTotal,
        observaciones: this.servicio.observaciones,
        cliente: clienteCompleto,
        empleado: empleadoCompleto,
        prendas: prendasCompletas,
      });

      // Guardar en base de datos
      const servicioGuardado: ServicioAlquiler =
        await this.servicioRepository.save(nuevoServicio);

      // Actualizar estado de prendas a 'alquilada'
      await this.actualizarEstadoPrendas(prendasCompletas, 'alquilada');

      console.log(
        `✅ Servicio de alquiler creado: #${servicioGuardado.numero}`,
      );

      // Reset para siguiente uso
      this.reset();

      return servicioGuardado;
    } catch (error) {
      // Reset en caso de error
      this.reset();
      throw error;
    }
  }

  reset(): IServicioAlquilerBuilder {
    this.servicio = {};
    this.prendasSeleccionadas = [];
    return this;
  }

  private async validarDatos(): Promise<void> {
    const errores: string[] = [];

    // Validar cliente
    if (!this.servicio.cliente) {
      errores.push('Cliente es requerido');
    }

    // Validar empleado
    if (!this.servicio.empleado) {
      errores.push('Empleado es requerido');
    }

    // Validar fecha de alquiler
    if (!this.servicio.fechaAlquiler) {
      errores.push('Fecha de alquiler es requerida');
    } else if (this.servicio.fechaAlquiler < new Date()) {
      errores.push('La fecha de alquiler no puede ser en el pasado');
    }

    // Validar prendas
    if (this.prendasSeleccionadas.length === 0) {
      errores.push('Debe seleccionar al menos una prenda');
    }

    // Validar disponibilidad de prendas
    await this.validarDisponibilidadPrendas();

    if (errores.length > 0) {
      throw new Error(`Error de validación: ${errores.join(', ')}`);
    }
  }

  private async cargarCliente(): Promise<Cliente> {
    if (this.servicio.cliente && typeof this.servicio.cliente.id === 'number') {
      const cliente = await this.clienteRepository.findOne({
        where: { id: this.servicio.cliente.id },
      });
      if (!cliente) {
        throw new Error(
          `Cliente con ID ${this.servicio.cliente.id} no encontrado`,
        );
      }
      return cliente;
    }
    return this.servicio.cliente as Cliente;
  }

  private async cargarEmpleado(): Promise<Empleado> {
    if (
      this.servicio.empleado &&
      typeof this.servicio.empleado.id === 'number'
    ) {
      const empleado = await this.empleadoRepository.findOne({
        where: { id: this.servicio.empleado.id },
      });
      if (!empleado) {
        throw new Error(
          `Empleado con ID ${this.servicio.empleado.id} no encontrado`,
        );
      }
      return empleado;
    }
    return this.servicio.empleado as Empleado;
  }

  private async cargarPrendas(): Promise<Prenda[]> {
    const prendas: Prenda[] = [];

    for (const prenda of this.prendasSeleccionadas) {
      if (typeof prenda.id === 'number') {
        const prendaCompleta = await this.prendaRepository.findOne({
          where: { id: prenda.id },
        });
        if (!prendaCompleta) {
          throw new Error(`Prenda con ID ${prenda.id} no encontrada`);
        }
        prendas.push(prendaCompleta);
      } else {
        prendas.push(prenda);
      }
    }

    return prendas;
  }

  private async validarDisponibilidadPrendas(): Promise<void> {
    const prendasCompletas = await this.cargarPrendas();

    const prendasNoDisponibles = prendasCompletas.filter(
      (prenda) => !prenda.disponible || prenda.estado !== 'disponible',
    );

    if (prendasNoDisponibles.length > 0) {
      const referencias = prendasNoDisponibles
        .map((p) => p.referencia)
        .join(', ');
      throw new Error(
        `Las siguientes prendas no están disponibles: ${referencias}`,
      );
    }
  }

  private calcularValorTotal(prendas: Prenda[]): number {
    return prendas.reduce(
      (total, prenda) => total + Number(prenda.valorAlquiler),
      0,
    );
  }

  private async actualizarEstadoPrendas(
    prendas: Prenda[],
    estado: string,
  ): Promise<void> {
    for (const prenda of prendas) {
      await this.prendaRepository.update(prenda.id, {
        disponible: estado === 'disponible',
        estado: estado,
      });
    }
  }
}
