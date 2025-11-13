// src/patterns/structural/decorator/decorators/prenda-delicada.decorator.ts

import { AbstractLavanderiaDecorator } from './abstract-lavanderia.decorator';
import { IPrendaLavanderia } from '../prenda-lavanderia.interface';

export class PrendaDelicadaDecorator extends AbstractLavanderiaDecorator {
  private readonly razonDelicadeza: string;
  private readonly requiereCuidadoEspecial: boolean;

  constructor(
    component: IPrendaLavanderia,
    razonDelicadeza: string = 'Material delicado',
    requiereCuidadoEspecial: boolean = false,
  ) {
    super(component);
    this.razonDelicadeza = razonDelicadeza;
    this.requiereCuidadoEspecial = requiereCuidadoEspecial;
  }

  calcularPrioridad(): number {
    const prioridadBase = this.component.calcularPrioridad();

    // Las prendas delicadas tienen prioridad moderada pero constante
    let incremento = 8;

    if (this.requiereCuidadoEspecial) {
      incremento += 12; // Cuidado especial suma más prioridad
    }

    // Incrementos específicos por razón de delicadeza
    const incrementosPorRazon: { [key: string]: number } = {
      seda: 10,
      encaje: 15,
      bordado: 8,
      pedreria: 12,
      vintage: 20,
      material_exclusivo: 25,
    };

    const razonKey = this.razonDelicadeza.toLowerCase().replace(/\s+/g, '_');
    const incrementoRazon = incrementosPorRazon[razonKey] || 8;

    return prioridadBase + incremento + incrementoRazon;
  }

  obtenerRazonesPrioridad(): string[] {
    const razonesBase = this.component.obtenerRazonesPrioridad();
    const nuevasRazones = [
      ...razonesBase,
      `Prenda delicada: ${this.razonDelicadeza}`,
    ];

    if (this.requiereCuidadoEspecial) {
      nuevasRazones.push('Requiere cuidado especial');
    }

    return nuevasRazones;
  }

  getTipoLavado(): string {
    // Las prendas delicadas siempre requieren al menos lavado delicado
    const tipoBase = this.component.getTipoLavado();

    if (
      this.requiereCuidadoEspecial ||
      ['seda', 'encaje', 'vintage'].some((material) =>
        this.razonDelicadeza.toLowerCase().includes(material),
      )
    ) {
      return 'especializado';
    }

    if (tipoBase === 'normal') {
      return 'delicado';
    }

    return tipoBase;
  }

  getCosto(): number {
    const costoBase = this.component.getCosto();

    // Costo adicional por manejo delicado
    let costoAdicional = 3000;

    if (this.requiereCuidadoEspecial) {
      costoAdicional += 8000;
    }

    // Costos específicos por tipo de material delicado
    const costosEspeciales: { [key: string]: number } = {
      seda: 6000,
      encaje: 8000,
      bordado: 4000,
      pedreria: 7000,
      vintage: 15000,
      material_exclusivo: 20000,
    };

    const razonKey = this.razonDelicadeza.toLowerCase().replace(/\s+/g, '_');
    const costoEspecial = costosEspeciales[razonKey] || 0;

    return costoBase + costoAdicional + costoEspecial;
  }

  // Getters específicos del decorator
  getRazonDelicadeza(): string {
    return this.razonDelicadeza;
  }

  requiereEspecial(): boolean {
    return this.requiereCuidadoEspecial;
  }
}
