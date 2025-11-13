import { IPrendaComponent } from '../interfaces/prenda-component.interface';

export class ConjuntoPrendasComponent implements IPrendaComponent {
  private readonly id: string;
  private readonly nombre: string;
  private descripcion: string;
  private hijos: IPrendaComponent[] = [];
  private padre: IPrendaComponent | null = null;
  private fechaCreacion: Date;
  private ultimaModificacion: Date;
  private metadata: { [key: string]: any } = {};

  constructor(id: string, nombre: string, descripcion?: string) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion || `Conjunto ${nombre}`;
    this.fechaCreacion = new Date();
    this.ultimaModificacion = new Date();
  }

  // Operaciones básicas
  getId(): string {
    return this.id;
  }

  getNombre(): string {
    return this.nombre;
  }

  getDescripcion(): string {
    const cantidadHijos = this.hijos.length;
    const totalPiezas = this.contarPiezas();
    return `${this.descripcion} (${cantidadHijos} componentes, ${totalPiezas} piezas totales)`;
  }

  // Operaciones de cálculo (recursivas)
  calcularPrecioTotal(): number {
    return this.hijos.reduce(
      (total, hijo) => total + hijo.calcularPrecioTotal(),
      0,
    );
  }

  contarPiezas(): number {
    return this.hijos.reduce((total, hijo) => total + hijo.contarPiezas(), 0);
  }

  obtenerListaReferencias(): string[] {
    const referencias: string[] = [];
    this.hijos.forEach((hijo) => {
      referencias.push(...hijo.obtenerListaReferencias());
    });
    return referencias;
  }

  // Operaciones de estado (recursivas)
  verificarDisponibilidad(): boolean {
    if (this.hijos.length === 0) {
      return false; // Un conjunto vacío no está disponible
    }

    return this.hijos.every((hijo) => hijo.verificarDisponibilidad());
  }

  marcarComoAlquilado(): void {
    this.hijos.forEach((hijo) => hijo.marcarComoAlquilado());
    this.ultimaModificacion = new Date();
  }

  marcarComoDisponible(): void {
    this.hijos.forEach((hijo) => hijo.marcarComoDisponible());
    this.ultimaModificacion = new Date();
  }

  // Operaciones de estructura
  esComposite(): boolean {
    return true;
  }

  obtenerHijos(): IPrendaComponent[] {
    return [...this.hijos]; // Retornar copia para evitar modificaciones directas
  }

  agregarHijo(componente: IPrendaComponent): void {
    if (this.hijos.includes(componente)) {
      throw new Error(
        `El componente ${componente.getId()} ya está en este conjunto`,
      );
    }

    // Verificar que no se cree una referencia circular
    if (this.esAncestro(componente)) {
      throw new Error(
        'No se puede agregar un ancestro como hijo (referencia circular)',
      );
    }

    this.hijos.push(componente);

    // Establecer relación padre-hijo si el componente lo soporta
    if ('setPadre' in componente && typeof componente.setPadre === 'function') {
      (componente.setPadre as (padre: IPrendaComponent | null) => void)(this);
    }

    this.ultimaModificacion = new Date();
    console.log(
      `✅ Componente ${componente.getId()} agregado al conjunto ${this.id}`,
    );
  }

  removerHijo(componente: IPrendaComponent): void {
    const index = this.hijos.findIndex(
      (hijo) => hijo.getId() === componente.getId(),
    );

    if (index === -1) {
      throw new Error(
        `El componente ${componente.getId()} no está en este conjunto`,
      );
    }

    this.hijos.splice(index, 1);

    // Remover relación padre-hijo
    if ('setPadre' in componente && typeof componente.setPadre === 'function') {
      (componente.setPadre as (padre: IPrendaComponent | null) => void)(null);
    }

    this.ultimaModificacion = new Date();
    console.log(
      `✅ Componente ${componente.getId()} removido del conjunto ${this.id}`,
    );
  }

  buscarPorReferencia(referencia: string): IPrendaComponent | null {
    // Buscar recursivamente en todos los hijos
    for (const hijo of this.hijos) {
      const resultado = hijo.buscarPorReferencia(referencia);
      if (resultado) {
        return resultado;
      }
    }
    return null;
  }

  // Operaciones de lavandería (recursivas)
  necesitaLavado(): boolean {
    return this.hijos.some((hijo) => hijo.necesitaLavado());
  }

  marcarParaLavado(): void {
    this.hijos.forEach((hijo) => hijo.marcarParaLavado());
    this.ultimaModificacion = new Date();
  }

  obtenerPrioridadLavado(): number {
    if (this.hijos.length === 0) {
      return 0;
    }

    // Retornar la prioridad máxima de todos los hijos
    return Math.max(...this.hijos.map((hijo) => hijo.obtenerPrioridadLavado()));
  }

  // Serialización
  toJSON(): {
    tipo: string;
    id: string;
    nombre: string;
    descripcion: string;
    fechaCreacion: Date;
    ultimaModificacion: Date;
    metadata: { [key: string]: any };
    hijos: any[];
  } {
    return {
      tipo: 'composite',
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      fechaCreacion: this.fechaCreacion,
      ultimaModificacion: this.ultimaModificacion,
      metadata: this.metadata,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      hijos: this.hijos.map((hijo) => hijo.toJSON()),
    };
  }

  fromJSON(data: {
    descripcion?: string;
    fechaCreacion: string | Date;
    ultimaModificacion: string | Date;
    metadata?: { [key: string]: any };
  }): IPrendaComponent {
    this.descripcion = data.descripcion || this.descripcion;
    this.fechaCreacion = new Date(data.fechaCreacion);
    this.ultimaModificacion = new Date(data.ultimaModificacion);
    this.metadata = data.metadata || {};

    // Nota: La reconstrucción de hijos debe manejarse externamente
    // ya que requiere acceso al factory de componentes

    return this;
  }

  // Validación
  validarIntegridad(): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!this.id || this.id.trim() === '') {
      errores.push('El conjunto debe tener un ID válido');
    }

    if (!this.nombre || this.nombre.trim() === '') {
      errores.push('El conjunto debe tener un nombre válido');
    }

    if (this.hijos.length === 0) {
      errores.push('El conjunto debe tener al menos un componente hijo');
    }

    // Validar recursivamente todos los hijos
    this.hijos.forEach((hijo, index) => {
      const validacionHijo = hijo.validarIntegridad();
      if (!validacionHijo.valido) {
        errores.push(
          `Hijo ${index} (${hijo.getId()}): ${validacionHijo.errores.join(', ')}`,
        );
      }
    });

    // Verificar que no hay referencias circulares
    if (this.detectarReferenciaCircular()) {
      errores.push('Se detectó una referencia circular en la estructura');
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }

  // Metadatos
  obtenerMetadatos() {
    return {
      tipo: 'composite' as const,
      nivel: this.padre ? this.calcularNivel() : 0,
      padre: this.padre,
      fechaCreacion: this.fechaCreacion,
      ultimaModificacion: this.ultimaModificacion,
    };
  }

  // Métodos auxiliares privados
  private esAncestro(componente: IPrendaComponent): boolean {
    let actual = this.padre;
    while (actual) {
      if (actual.getId() === componente.getId()) {
        return true;
      }
      actual = actual.obtenerMetadatos().padre;
    }
    return false;
  }

  private calcularNivel(): number {
    let nivel = 0;
    let actual = this.padre;
    while (actual) {
      nivel++;
      actual = actual.obtenerMetadatos().padre;
    }
    return nivel;
  }

  private detectarReferenciaCircular(
    visitados: Set<string> = new Set(),
  ): boolean {
    if (visitados.has(this.id)) {
      return true; // Encontró ciclo
    }

    visitados.add(this.id);

    for (const hijo of this.hijos) {
      if (hijo.esComposite()) {
        const hijoComposite = hijo as ConjuntoPrendasComponent;
        if (hijoComposite.detectarReferenciaCircular(new Set(visitados))) {
          return true;
        }
      }
    }

    return false;
  }

  // Métodos adicionales específicos de conjunto
  setPadre(padre: IPrendaComponent | null): void {
    this.padre = padre;
  }

  getPadre(): IPrendaComponent | null {
    return this.padre;
  }

  obtenerEstructuraArbol(): string {
    return this.generarEstructuraArbol('');
  }

  private generarEstructuraArbol(indentacion: string): string {
    let estructura = `${indentacion}├─ ${this.getNombre()}\n`;

    this.hijos.forEach((hijo, index) => {
      const esUltimo = index === this.hijos.length - 1;
      const nuevaIndentacion = indentacion + (esUltimo ? '    ' : '│   ');

      if (hijo.esComposite()) {
        const hijoComposite = hijo as ConjuntoPrendasComponent;
        estructura += hijoComposite.generarEstructuraArbol(nuevaIndentacion);
      } else {
        estructura += `${nuevaIndentacion}├─ ${hijo.getNombre()}\n`;
      }
    });

    return estructura;
  }

  // Operaciones de consulta avanzada
  buscarPorTipo(tipo: string): IPrendaComponent[] {
    const resultados: IPrendaComponent[] = [];

    this.hijos.forEach((hijo) => {
      if (hijo.esComposite()) {
        const hijoComposite = hijo as ConjuntoPrendasComponent;
        resultados.push(...hijoComposite.buscarPorTipo(tipo));
      } else {
        // Verificar si la prenda simple coincide con el tipo
        if (hijo.getNombre().toLowerCase().includes(tipo.toLowerCase())) {
          resultados.push(hijo);
        }
      }
    });

    return resultados;
  }

  obtenerEstadisticas(): {
    totalComponentes: number;
    totalPiezas: number;
    precioTotal: number;
    componentesDisponibles: number;
    componentesRequierenLavado: number;
    prioridadMaxima: number;
    nivel: number;
  } {
    const totalComponentes: number = this.hijos.length;
    const totalPiezas: number = this.contarPiezas();
    const precioTotal: number = this.calcularPrecioTotal();
    const componentesDisponibles: number = this.hijos.filter((h) =>
      h.verificarDisponibilidad(),
    ).length;
    const componentesRequierenLavado: number = this.hijos.filter((h) =>
      h.necesitaLavado(),
    ).length;
    const prioridadMaxima: number = this.obtenerPrioridadLavado();
    const nivel: number = this.obtenerMetadatos().nivel;

    return {
      totalComponentes,
      totalPiezas,
      precioTotal,
      componentesDisponibles,
      componentesRequierenLavado,
      prioridadMaxima,
      nivel,
    };
  }

  // Metadatos del conjunto
  setMetadata(key: string, value: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.metadata[key] = value;
    this.ultimaModificacion = new Date();
  }

  getMetadata(key: string): any {
    return this.metadata[key];
  }

  getAllMetadata(): { [key: string]: any } {
    return { ...this.metadata };
  }
}
