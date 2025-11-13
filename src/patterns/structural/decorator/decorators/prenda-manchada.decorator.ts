// src/patterns/structural/decorator/decorators/prenda-manchada.decorator.ts

import { AbstractLavanderiaDecorator } from './abstract-lavanderia.decorator';
import { IPrendaLavanderia } from '../prenda-lavanderia.interface';

export class PrendaManchadaDecorator extends AbstractLavanderiaDecorator {
  private readonly tipoMancha: string;
  private readonly gravedadMancha: 'leve' | 'moderada' | 'severa';

  constructor(
    component: IPrendaLavanderia,
    tipoMancha: string = 'general',
    gravedadMancha: 'leve' | 'moderada' | 'severa' = 'moderada',
  ) {
    super(component);
    this.tipoMancha = tipoMancha;
    this.gravedadMancha = gravedadMancha;
  }

  calcularPrioridad(): number {
    const prioridadBase = this.component.calcularPrioridad();

    // Incremento basado en gravedad de la mancha
    const incrementosPorGravedad = {
      leve: 5,
      moderada: 10,
      severa: 20,
    };

    // Incremento adicional por tipo de mancha
    const incrementosPorTipo: { [key: string]: number } = {
      sangre: 15,
      vino: 12,
      aceite: 18,
      maquillaje: 8,
      sudor: 5,
      general: 7,
    };

    const incrementoGravedad = incrementosPorGravedad[this.gravedadMancha];
    const incrementoTipo =
      incrementosPorTipo[this.tipoMancha] || incrementosPorTipo['general'];

    return prioridadBase + incrementoGravedad + incrementoTipo;
  }

  obtenerRazonesPrioridad(): string[] {
    const razonesBase = this.component.obtenerRazonesPrioridad();
    const nuevasRazones = [
      ...razonesBase,
      `Prenda manchada (${this.tipoMancha})`,
      `Gravedad: ${this.gravedadMancha}`,
    ];

    if (this.tipoMancha === 'sangre' || this.tipoMancha === 'vino') {
      nuevasRazones.push('Mancha difícil - requiere tratamiento inmediato');
    }

    return nuevasRazones;
  }

  getTipoLavado(): string {
    const tipoBase = this.component.getTipoLavado();

    // Las manchas severas o ciertos tipos requieren lavado especializado
    if (
      this.gravedadMancha === 'severa' ||
      ['sangre', 'aceite', 'vino'].includes(this.tipoMancha)
    ) {
      return 'especializado';
    }

    // Las manchas moderadas requieren al menos lavado delicado
    if (this.gravedadMancha === 'moderada' && tipoBase === 'normal') {
      return 'delicado';
    }

    return tipoBase;
  }

  getCosto(): number {
    const costoBase = this.component.getCosto();

    // Costo adicional por tratamiento de manchas
    const costosAdicionales = {
      leve: 2000,
      moderada: 5000,
      severa: 10000,
    };

    const costoTipoMancha: { [key: string]: number } = {
      sangre: 8000,
      vino: 6000,
      aceite: 12000,
      maquillaje: 3000,
      sudor: 1000,
      general: 2000,
    };

    return (
      costoBase +
      costosAdicionales[this.gravedadMancha] +
      (costoTipoMancha[this.tipoMancha] || costoTipoMancha['general'])
    );
  }

  // Getters específicos del decorator
  getTipoMancha(): string {
    return this.tipoMancha;
  }

  getGravedadMancha(): string {
    return this.gravedadMancha;
  }
}
