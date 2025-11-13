import { IPrendaComponent } from '../interfaces/prenda-component.interface.js';
import { Prenda } from '../../../../modules/prendas/entities/prenda.entity.js';
import { VestidoDama } from '../../../../modules/prendas/entities/vestido-dama.entity.js';
import { TrajeCaballero } from '../../../../modules/prendas/entities/traje-caballero.entity.js';
import { Disfraz } from '../../../../modules/prendas/entities/disfraz.entity.js';

export class PrendaSimpleComponent implements IPrendaComponent {
  private prenda: Prenda;
  private padre: IPrendaComponent | null = null;
  private fechaCreacion: Date;
  private ultimaModificacion: Date;
  private requiereLavado: boolean = false;
  private prioridadLavado: number = 0;

  constructor(prenda: Prenda) {
    this.prenda = prenda;
    this.fechaCreacion = new Date();
    this.ultimaModificacion = new Date();
  }

  // Operaciones básicas
  getId(): string {
    return `prenda_${this.prenda.id}`;
  }

  getNombre(): string {
    // Obtener nombre específico según el tipo de prenda
    if (this.prenda instanceof VestidoDama) {
      return `Vestido ${this.prenda.referencia}`;
    } else if (this.prenda instanceof TrajeCaballero) {
      return `Traje ${this.prenda.tipo} ${this.prenda.referencia}`;
    } else if (this.prenda instanceof Disfraz) {
      return this.prenda.nombre;
    }
    return `Prenda ${this.prenda.referencia}`;
  }

  getDescripcion(): string {
    let descripcion = `${this.getNombre()} - Talla: ${this.prenda.talla}, Color: ${this.prenda.color}`;

    if (this.prenda instanceof VestidoDama) {
      descripcion += `, Pedrería: ${this.prenda.tienePedreria ? 'Sí' : 'No'}`;
      descripcion += `, Largo: ${this.prenda.esLargo ? 'Largo' : 'Corto'}`;
    } else if (this.prenda instanceof TrajeCaballero) {
      descripcion += `, Tipo: ${this.prenda.tipo}`;
      if (this.prenda.accesoriosIncluidos) {
        descripcion += `, Accesorios: ${this.prenda.accesoriosIncluidos}`;
      }
    } else if (this.prenda instanceof Disfraz) {
      descripcion += `, Categoría: ${this.prenda.categoria}`;
    }

    return descripcion;
  }

  // Operaciones de cálculo (en hoja, no son recursivas)
  calcularPrecioTotal(): number {
    return Number(this.prenda.valorAlquiler);
  }

  contarPiezas(): number {
    if (this.prenda instanceof VestidoDama) {
      return this.prenda.cantidadPiezas || 1;
    }
    return 1;
  }

  obtenerListaReferencias(): string[] {
    return [this.prenda.referencia];
  }

  // Operaciones de estado
  verificarDisponibilidad(): boolean {
    return this.prenda.disponible && this.prenda.estado === 'disponible';
  }

  marcarComoAlquilado(): void {
    this.prenda.disponible = false;
    this.prenda.estado = 'alquilado';
    this.ultimaModificacion = new Date();
  }

  marcarComoDisponible(): void {
    this.prenda.disponible = true;
    this.prenda.estado = 'disponible';
    this.requiereLavado = false;
    this.ultimaModificacion = new Date();
  }

  // Operaciones de estructura (las hojas no tienen hijos)
  esComposite(): boolean {
    return false;
  }

  obtenerHijos(): IPrendaComponent[] {
    return []; // Las hojas no tienen hijos
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  agregarHijo(_componente: IPrendaComponent): void {
    throw new Error('No se pueden agregar hijos a una prenda simple');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removerHijo(_componente: IPrendaComponent): void {
    throw new Error('Las prendas simples no tienen hijos que remover');
  }

  buscarPorReferencia(referencia: string): IPrendaComponent | null {
    return this.prenda.referencia === referencia ? this : null;
  }

  // Operaciones de lavandería
  necesitaLavado(): boolean {
    return this.requiereLavado || this.prenda.estado === 'requiere_lavado';
  }

  marcarParaLavado(): void {
    this.requiereLavado = true;
    this.prenda.estado = 'requiere_lavado';
    this.ultimaModificacion = new Date();
  }

  obtenerPrioridadLavado(): number {
    let prioridad = this.prioridadLavado;

    // Prioridad base según tipo de prenda
    if (this.prenda instanceof VestidoDama) {
      prioridad += this.prenda.tienePedreria ? 5 : 0; // Pedrería requiere cuidado especial
      prioridad += this.prenda.esLargo ? 3 : 0; // Vestidos largos son más delicados
    } else if (this.prenda instanceof TrajeCaballero) {
      prioridad += this.prenda.tipo === 'frac' ? 8 : 0; // Fracs son más formales
    }

    return Math.max(prioridad, 0);
  }

  // Serialización
  toJSON(): any {
    return {
      tipo: 'simple',
      prendaId: this.prenda.id,
      referencia: this.prenda.referencia,
      fechaCreacion: this.fechaCreacion,
      ultimaModificacion: this.ultimaModificacion,
      requiereLavado: this.requiereLavado,
      prioridadLavado: this.prioridadLavado,
    };
  }

  fromJSON(data: {
    fechaCreacion: string | Date;
    ultimaModificacion: string | Date;
    requiereLavado?: boolean;
    prioridadLavado?: number;
  }): IPrendaComponent {
    this.fechaCreacion = new Date(data.fechaCreacion);
    this.ultimaModificacion = new Date(data.ultimaModificacion);
    this.requiereLavado = data.requiereLavado || false;
    this.prioridadLavado = data.prioridadLavado || 0;
    return this;
  }

  // Validación
  validarIntegridad(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.prenda) {
      errores.push('La prenda no está definida');
    } else {
      if (!this.prenda.referencia || this.prenda.referencia.trim() === '') {
        errores.push('La prenda debe tener una referencia válida');
      }
      if (!this.prenda.valorAlquiler || this.prenda.valorAlquiler <= 0) {
        errores.push('La prenda debe tener un valor de alquiler válido');
      }
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  // Metadatos
  obtenerMetadatos() {
    return {
      tipo: 'simple' as const,
      nivel: this.padre ? this.calcularNivel() : 0,
      padre: this.padre,
      fechaCreacion: this.fechaCreacion,
      ultimaModificacion: this.ultimaModificacion,
    };
  }

  // Métodos auxiliares
  private calcularNivel(): number {
    let nivel = 0;
    let actual = this.padre;
    while (actual) {
      nivel++;
      actual = actual.obtenerMetadatos().padre;
    }
    return nivel;
  }

  // Getters para acceso a la prenda
  getPrenda(): Prenda {
    return this.prenda;
  }

  setPadre(padre: IPrendaComponent | null): void {
    this.padre = padre;
  }

  getPadre(): IPrendaComponent | null {
    return this.padre;
  }

  // Operaciones adicionales específicas
  aplicarPrioridadEspecial(prioridad: number, razon: string): void {
    this.prioridadLavado = Math.max(this.prioridadLavado, prioridad);
    this.ultimaModificacion = new Date();
    console.log(
      `✅ Prioridad ${prioridad} aplicada a ${this.prenda.referencia}: ${razon}`,
    );
  }
}
