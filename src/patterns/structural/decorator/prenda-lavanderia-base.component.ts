import { IPrendaLavanderia } from './prenda-lavanderia.interface';
import { Prenda } from '../../../modules/prendas/entities/prenda.entity';
import { VestidoDama } from '../../../modules/prendas/entities/vestido-dama.entity';
import { TrajeCaballero } from '../../../modules/prendas/entities/traje-caballero.entity';
import { Disfraz } from '../../../modules/prendas/entities/disfraz.entity';

export class PrendaLavanderiaBase implements IPrendaLavanderia {
  constructor(private readonly prenda: Prenda) {}

  getReferencia(): string {
    return this.prenda.referencia;
  }

  getNombre(): string {
    if (this.prenda instanceof VestidoDama) {
      return `Vestido ${this.prenda.referencia}`;
    } else if (this.prenda instanceof TrajeCaballero) {
      const tipoTexto = this.prenda.tipo || '';
      return `Traje ${tipoTexto} ${this.prenda.referencia}`.trim();
    } else if (this.prenda instanceof Disfraz) {
      return this.prenda.nombre;
    }
    return `Prenda ${this.prenda.referencia}`;
  }

  getDescripcion(): string {
    let descripcion = `${this.getNombre()} - Color: ${this.prenda.color}, Talla: ${this.prenda.talla}`;

    if (this.prenda instanceof VestidoDama) {
      if (this.prenda.tienePedreria) descripcion += ', Con pedrería';
      descripcion += this.prenda.esLargo ? ', Largo' : ', Corto';
    } else if (this.prenda instanceof TrajeCaballero) {
      if (this.prenda.accesoriosIncluidos) {
        descripcion += `, Accesorios: ${this.prenda.accesoriosIncluidos}`;
      }
    } else if (this.prenda instanceof Disfraz) {
      descripcion += `, Categoría: ${this.prenda.categoria}`;
    }

    return descripcion;
  }

  // Prioridad base según tipo de prenda
  calcularPrioridad(): number {
    let prioridadBase = 1; // Prioridad mínima

    if (this.prenda instanceof VestidoDama) {
      prioridadBase = 3; // Vestidos requieren más cuidado
      if (this.prenda.tienePedreria) prioridadBase += 2; // Pedrería es delicada
      if (this.prenda.esLargo) prioridadBase += 1; // Vestidos largos requieren más espacio
    } else if (this.prenda instanceof TrajeCaballero) {
      prioridadBase = 2;
      if (this.prenda.tipo === 'frac') prioridadBase += 3; // Fracs son formales
      if (this.prenda.tipo === 'sacoleva') prioridadBase += 2; // Sacolevas son especiales
    } else if (this.prenda instanceof Disfraz) {
      prioridadBase = 1; // Disfraces son menos complejos
    }

    return prioridadBase;
  }

  obtenerRazonesPrioridad(): string[] {
    const razones: string[] = ['Prioridad base'];

    if (this.prenda instanceof VestidoDama) {
      if (this.prenda.tienePedreria) razones.push('Tiene pedrería');
      if (this.prenda.esLargo) razones.push('Vestido largo');
    } else if (this.prenda instanceof TrajeCaballero) {
      if (this.prenda.tipo === 'frac') razones.push('Traje de frac');
      if (this.prenda.tipo === 'sacoleva') razones.push('Traje sacoleva');
    }

    return razones;
  }

  necesitaLavado(): boolean {
    return (
      this.prenda.estado === 'requiere_lavado' || this.prenda.estado === 'sucio'
    );
  }

  getTipoLavado(): string {
    if (this.prenda instanceof VestidoDama && this.prenda.tienePedreria) {
      return 'especializado';
    }
    if (this.prenda instanceof TrajeCaballero && this.prenda.tipo === 'frac') {
      return 'delicado';
    }
    return 'normal';
  }

  getCosto(): number {
    const costoBase = 5000; // Costo base de lavado

    if (this.getTipoLavado() === 'especializado') {
      return costoBase * 3;
    }
    if (this.getTipoLavado() === 'delicado') {
      return costoBase * 2;
    }

    return costoBase;
  }

  obtenerDetalleCompleto() {
    return {
      referencia: this.getReferencia(),
      prioridad: this.calcularPrioridad(),
      razones: this.obtenerRazonesPrioridad(),
      tipoLavado: this.getTipoLavado(),
      costo: this.getCosto(),
    };
  }

  // Getter para acceder a la prenda original
  getPrenda(): Prenda {
    return this.prenda;
  }
}
