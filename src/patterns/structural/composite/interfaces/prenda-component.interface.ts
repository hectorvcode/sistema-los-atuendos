export interface IPrendaComponent {
  // Operaciones básicas
  getId(): string;
  getNombre(): string;
  getDescripcion(): string;

  // Operaciones de cálculo (recursivas)
  calcularPrecioTotal(): number;
  contarPiezas(): number;
  obtenerListaReferencias(): string[];

  // Operaciones de estado
  verificarDisponibilidad(): boolean;
  marcarComoAlquilado(): void;
  marcarComoDisponible(): void;

  // Operaciones de estructura
  esComposite(): boolean;
  obtenerHijos(): IPrendaComponent[];
  agregarHijo(componente: IPrendaComponent): void;
  removerHijo(componente: IPrendaComponent): void;
  buscarPorReferencia(referencia: string): IPrendaComponent | null;

  // Operaciones de lavandería
  necesitaLavado(): boolean;
  marcarParaLavado(): void;
  obtenerPrioridadLavado(): number;

  // Serialización para persistencia
  toJSON(): any;
  fromJSON(data: any): IPrendaComponent;

  // Operaciones de validación
  validarIntegridad(): { valido: boolean; errores: string[] };

  // Información adicional
  obtenerMetadatos(): {
    tipo: 'simple' | 'composite';
    nivel: number;
    padre: IPrendaComponent | null;
    fechaCreacion: Date;
    ultimaModificacion: Date;
  };
}
