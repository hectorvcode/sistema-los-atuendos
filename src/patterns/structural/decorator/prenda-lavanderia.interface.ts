export interface IPrendaLavanderia {
  // Información básica
  getReferencia(): string;
  getNombre(): string;
  getDescripcion(): string;

  // Operaciones de prioridad (core del decorator)
  calcularPrioridad(): number;
  obtenerRazonesPrioridad(): string[];

  // Estado de lavandería
  necesitaLavado(): boolean;
  getTipoLavado(): string; // 'normal' | 'delicado' | 'especializado'
  getCosto(): number;

  // Para debugging y monitoreo
  obtenerDetalleCompleto(): {
    referencia: string;
    prioridad: number;
    razones: string[];
    tipoLavado: string;
    costo: number;
  };
}
