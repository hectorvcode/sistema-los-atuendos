// src/patterns/structural/decorator/decorators/prioridad-administrativa.decorator.ts

import { AbstractLavanderiaDecorator } from './abstract-lavanderia.decorator';
import { IPrendaLavanderia } from '../prenda-lavanderia.interface';

export class PrioridadAdministrativaDecorator extends AbstractLavanderiaDecorator {
  private readonly nivelPrioridad: 'urgente' | 'alta' | 'media';
  private readonly razonAdministrativa: string;
  private readonly fechaLimite?: Date;
  private readonly solicitadoPor: string;

  constructor(
    component: IPrendaLavanderia,
    nivelPrioridad: 'urgente' | 'alta' | 'media' = 'alta',
    razonAdministrativa: string = 'Solicitud administrativa',
    solicitadoPor: string = 'Administración',
    fechaLimite?: Date,
  ) {
    super(component);
    this.nivelPrioridad = nivelPrioridad;
    this.razonAdministrativa = razonAdministrativa;
    this.solicitadoPor = solicitadoPor;
    this.fechaLimite = fechaLimite;
  }

  calcularPrioridad(): number {
    const prioridadBase = this.component.calcularPrioridad();

    // Las prioridades administrativas tienen precedencia alta
    const incrementosPorNivel = {
      urgente: 50, // Máxima prioridad
      alta: 30, // Alta prioridad
      media: 15, // Prioridad moderada
    };

    let incrementoTotal = incrementosPorNivel[this.nivelPrioridad];

    // Incremento adicional si hay fecha límite próxima
    if (this.fechaLimite) {
      const horasHastaLimite =
        (this.fechaLimite.getTime() - new Date().getTime()) / (1000 * 60 * 60);

      if (horasHastaLimite <= 2) {
        incrementoTotal += 25; // Muy urgente
      } else if (horasHastaLimite <= 6) {
        incrementoTotal += 15; // Urgente
      } else if (horasHastaLimite <= 24) {
        incrementoTotal += 10; // Moderadamente urgente
      }
    }

    // Incrementos especiales por razón administrativa
    const razonesEspeciales: { [key: string]: number } = {
      evento_vip: 20,
      cliente_premium: 15,
      error_empresa: 25,
      compensacion: 20,
      pedido_gerencia: 30,
    };

    const razonKey = this.razonAdministrativa
      .toLowerCase()
      .replace(/\s+/g, '_');
    const incrementoRazon = razonesEspeciales[razonKey] || 0;

    return prioridadBase + incrementoTotal + incrementoRazon;
  }

  obtenerRazonesPrioridad(): string[] {
    const razonesBase = this.component.obtenerRazonesPrioridad();
    const nuevasRazones = [
      ...razonesBase,
      `Prioridad administrativa: ${this.nivelPrioridad.toUpperCase()}`,
      `Razón: ${this.razonAdministrativa}`,
      `Solicitado por: ${this.solicitadoPor}`,
    ];

    if (this.fechaLimite) {
      const fechaFormateada = this.fechaLimite.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      nuevasRazones.push(`Fecha límite: ${fechaFormateada}`);
    }

    return nuevasRazones;
  }

  getTipoLavado(): string {
    const tipoBase = this.component.getTipoLavado();

    // Prioridades urgentes pueden requerir tipo especializado para garantizar calidad
    if (this.nivelPrioridad === 'urgente') {
      return tipoBase === 'normal' ? 'delicado' : tipoBase;
    }

    return tipoBase;
  }

  getCosto(): number {
    const costoBase = this.component.getCosto();

    // Costo adicional por prioridad administrativa
    const costosAdicionales = {
      urgente: 15000, // Costo por urgencia
      alta: 8000, // Costo por alta prioridad
      media: 3000, // Costo mínimo por prioridad
    };

    const costoAdicional = costosAdicionales[this.nivelPrioridad];

    // Descuento por ciertos tipos de razones administrativas
    const descuentosEspeciales: { [key: string]: number } = {
      error_empresa: 0.5, // 50% descuento por error de la empresa
      compensacion: 0.3, // 30% descuento por compensación
      cliente_premium: 0.8, // 20% descuento para clientes premium
    };

    const razonKey = this.razonAdministrativa
      .toLowerCase()
      .replace(/\s+/g, '_');
    const factorDescuento = descuentosEspeciales[razonKey] || 1.0;

    return costoBase + costoAdicional * factorDescuento;
  }

  // Getters específicos del decorator
  getNivelPrioridad(): string {
    return this.nivelPrioridad;
  }

  getRazonAdministrativa(): string {
    return this.razonAdministrativa;
  }

  getSolicitadoPor(): string {
    return this.solicitadoPor;
  }

  getFechaLimite(): Date | undefined {
    return this.fechaLimite;
  }

  getHorasHastaLimite(): number | null {
    if (!this.fechaLimite) return null;

    const horasRestantes =
      (this.fechaLimite.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return Math.max(0, horasRestantes);
  }
}
