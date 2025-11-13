// src/patterns/structural/adapter/interfaces/persistencia.interface.ts

/**
 * Interface IPersistencia del diagrama de clases
 * Define el contrato que necesita el dominio para persistir datos
 * independientemente de la tecnología de base de datos específica
 */
export interface IPersistencia {
  // Operaciones CRUD genéricas
  guardar<T>(entidad: T): Promise<boolean>;
  buscar<T>(id: string): Promise<T | null>;
  actualizar<T>(id: string, datos: Partial<T>): Promise<boolean>;
  eliminar(id: string): Promise<boolean>;

  // Operaciones de consulta específicas
  buscarTodos<T>(): Promise<T[]>;
  buscarPorCriterio<T>(criterio: any): Promise<T[]>;

  // Operaciones de transacción
  iniciarTransaccion(): Promise<string>;
  confirmarTransaccion(transactionId: string): Promise<boolean>;
  deshacerTransaccion(transactionId: string): Promise<boolean>;

  // Operaciones de conexión
  conectar(): Promise<boolean>;
  desconectar(): Promise<boolean>;
  verificarConexion(): Promise<boolean>;
}

/**
 * Interface específica para persistencia de Prendas
 * Extiende IPersistencia con operaciones específicas del dominio
 */
export interface IPersistenciaPrendas extends IPersistencia {
  guardarNuevaPrenda(prenda: any): Promise<boolean>;
  buscarPrendaPorReferencia(referencia: string): Promise<any>;
  buscarPrendasPorTalla(talla: string): Promise<any[]>;
  buscarPrendasDisponibles(): Promise<any[]>;
  actualizarEstadoPrenda(referencia: string, estado: string): Promise<boolean>;
  eliminarPrenda(referencia: string): Promise<boolean>;
}

/**
 * Configuración de conexión para diferentes tipos de BD
 */
export interface ConfiguracionConexion {
  tipo: 'mysql' | 'postgresql' | 'oracle' | 'sqlite';
  servidor: string;
  puerto: number;
  baseDatos: string;
  usuario: string;
  contrasena: string;
  configuracionPool?: {
    min: number;
    max: number;
    timeoutConexion: number;
    timeoutInactividad: number;
  };
  ssl?: boolean;
  configuracionAdicional?: Record<string, any>;
}

/**
 * Resultado de operaciones de persistencia
 */
export interface ResultadoPersistencia<T = any> {
  exito: boolean;
  datos?: T;
  mensaje?: string;
  error?: string;
  transactionId?: string;
}

/**
 * Estadísticas de la conexión
 */
export interface EstadisticasConexion {
  conexionesActivas: number;
  conexionesDisponibles: number;
  totalConsultas: number;
  tiempoPromedioRespuesta: number;
  ultimaActividad: Date;
  estado: 'conectado' | 'desconectado' | 'error';
}
