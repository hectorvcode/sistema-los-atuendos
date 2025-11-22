import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Interfaz para los datos del reporte
 */
export interface IReportData {
  servicios: ServicioAlquiler[];
  fechaInicio: Date;
  fechaFin: Date;
  filtros?: {
    estado?: string;
    clienteId?: number;
    empleadoId?: number;
  };
}

/**
 * Interfaz para el resultado de generación del reporte
 */
export interface IReportResult {
  filename: string;
  format: string;
  content: string | Buffer;
  generatedAt: Date;
  totalServicios: number;
  valorTotalGeneral: number;
  metadata?: Record<string, any>;
}

/**
 * Tipos de formato de reporte
 */
export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json',
  CSV = 'csv',
}

/**
 * Interfaz para estadísticas del reporte
 */
export interface IReportStatistics {
  totalServicios: number;
  valorTotal: number;
  serviciosPorEstado: Record<string, number>;
  valorPromedio: number;
  servicioMasCaro: ServicioAlquiler | null;
  servicioMasBarato: ServicioAlquiler | null;
}