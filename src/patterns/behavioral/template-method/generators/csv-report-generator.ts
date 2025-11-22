import { Injectable } from '@nestjs/common';
import { AbstractReportGenerator } from '../abstract-report-generator';
import {
  IReportData,
  IReportResult,
  IReportStatistics,
  ReportFormat,
} from '../report-data.interface';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Generador de reportes en formato CSV
 * Implementa los métodos abstractos del Template Method
 */
@Injectable()
export class CsvReportGenerator extends AbstractReportGenerator {
  protected getFormat(): string {
    return ReportFormat.CSV;
  }

  /**
   * Formatea el encabezado en formato CSV (comentarios)
   */
  protected async formatHeader(
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<string> {
    const lines: string[] = [];
    lines.push('# Reporte de Servicios de Alquiler - Los Atuendos');
    lines.push(`# Periodo: ${data.fechaInicio.toLocaleDateString('es-CO')} - ${data.fechaFin.toLocaleDateString('es-CO')}`);
    lines.push(`# Generado: ${new Date().toLocaleString('es-CO')}`);
    lines.push(`# Total Servicios: ${statistics.totalServicios}`);
    lines.push(`# Valor Total: $${statistics.valorTotal.toLocaleString('es-CO')}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Formatea el contenido (servicios) en formato CSV
   */
  protected async formatContent(
    servicios: ServicioAlquiler[],
    statistics: IReportStatistics,
  ): Promise<string> {
    const lines: string[] = [];

    // Encabezados de columnas
    lines.push(
      'Numero,Fecha Alquiler,Fecha Devolucion,Estado,Valor Total,Cliente,Empleado,Total Prendas,Observaciones',
    );

    // Datos de servicios
    servicios.forEach(servicio => {
      const row = [
        servicio.numero,
        servicio.fechaAlquiler.toLocaleDateString('es-CO'),
        servicio.fechaDevolucion?.toLocaleDateString('es-CO') || 'N/A',
        servicio.estado,
        servicio.valorTotal,
        servicio.cliente?.nombre || '',
        servicio.empleado?.nombre || '',
        servicio.prendas?.length || 0,
        this.escapeCsvField(servicio.observaciones || ''),
      ];

      lines.push(row.join(','));
    });

    return lines.join('\n');
  }

  /**
   * Formatea el pie de página con estadísticas en formato CSV
   */
  protected async formatFooter(statistics: IReportStatistics): Promise<string> {
    const lines: string[] = [];
    lines.push('');
    lines.push('# RESUMEN');
    lines.push(`# Total de Servicios: ${statistics.totalServicios}`);
    lines.push(`# Valor Total: $${statistics.valorTotal.toLocaleString('es-CO')}`);
    lines.push(`# Valor Promedio: $${statistics.valorPromedio.toLocaleString('es-CO')}`);
    lines.push('');
    lines.push('# Servicios por Estado:');

    Object.entries(statistics.serviciosPorEstado).forEach(([estado, cantidad]) => {
      lines.push(`# - ${estado}: ${cantidad}`);
    });

    if (statistics.servicioMasCaro) {
      lines.push('');
      lines.push(`# Servicio más caro: #${statistics.servicioMasCaro.numero} - $${statistics.servicioMasCaro.valorTotal.toLocaleString('es-CO')}`);
    }

    if (statistics.servicioMasBarato) {
      lines.push(`# Servicio más barato: #${statistics.servicioMasBarato.numero} - $${statistics.servicioMasBarato.valorTotal.toLocaleString('es-CO')}`);
    }

    return lines.join('\n');
  }

  /**
   * Genera el archivo CSV final combinando todas las partes
   */
  protected async generateFile(
    header: string,
    content: string,
    footer: string,
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<IReportResult> {
    const csvContent = `${header}${content}\n${footer}`;
    const filename = this.generateFilename('csv');

    return {
      filename,
      format: ReportFormat.CSV,
      content: csvContent,
      generatedAt: new Date(),
      totalServicios: statistics.totalServicios,
      valorTotalGeneral: statistics.valorTotal,
      metadata: {
        rows: statistics.totalServicios + 1, // +1 por el encabezado
        encoding: 'utf8',
        delimiter: ',',
      },
    };
  }

  /**
   * Hook post-generación para logging
   */
  protected async postGeneration(result: IReportResult): Promise<void> {
    console.log('   📊 Reporte CSV generado con formato tabular');
    console.log(`   📋 Filas: ${result.metadata?.rows}`);
  }

  /**
   * Helper para escapar campos CSV que contienen comas o comillas
   */
  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}