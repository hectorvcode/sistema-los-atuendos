import { IPrendaLavanderia } from '../prenda-lavanderia.interface';

export abstract class AbstractLavanderiaDecorator implements IPrendaLavanderia {
  constructor(protected component: IPrendaLavanderia) {}

  // Delegar comportamiento básico al component
  getReferencia(): string {
    return this.component.getReferencia();
  }

  getNombre(): string {
    return this.component.getNombre();
  }

  getDescripcion(): string {
    return this.component.getDescripcion();
  }

  necesitaLavado(): boolean {
    return this.component.necesitaLavado();
  }

  // Métodos que serán modificados por decorators concretos
  abstract calcularPrioridad(): number;
  abstract obtenerRazonesPrioridad(): string[];
  abstract getTipoLavado(): string;
  abstract getCosto(): number;

  obtenerDetalleCompleto() {
    return {
      referencia: this.getReferencia(),
      prioridad: this.calcularPrioridad(),
      razones: this.obtenerRazonesPrioridad(),
      tipoLavado: this.getTipoLavado(),
      costo: this.getCosto(),
    };
  }
}
