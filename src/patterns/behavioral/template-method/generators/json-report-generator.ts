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
 * Generador de reportes en formato JSON
 * Implementa los métodos abstractos del Template Method
 */
@Injectable()
export class JsonReportGenerator extends AbstractReportGenerator {
  protected getFormat(): string {
    return ReportFormat.JSON;
  }

  /**
   * Formatea el encabezado en formato JSON
   */
  protected async formatHeader(
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<string> {
    const header = {
      titulo: 'Reporte de Servicios de Alquiler',
      empresa: 'Los Atuendos',
      periodo: {
        inicio: data.fechaInicio.toISOString(),
        fin: data.fechaFin.toISOString(),
      },
      generadoEn: new Date().toISOString(),
      filtros: data.filtros || {},
    };

    return JSON.stringify(header, null, 2);
  }

  /**
   * Formatea el contenido (servicios) en formato JSON
   */
  protected async formatContent(
    servicios: ServicioAlquiler[],
    statistics: IReportStatistics,
  ): Promise<string> {
    const content = servicios.map(servicio => ({
      numero: servicio.numero,
      fechaAlquiler: servicio.fechaAlquiler.toISOString(),
      fechaDevolucion: servicio.fechaDevolucion?.toISOString() || null,
      estado: servicio.estado,
      valorTotal: servicio.valorTotal,
      cliente: {
        id: servicio.cliente?.id,
        nombre: servicio.cliente?.nombre,
        telefono: servicio.cliente?.telefono,
      },
      empleado: {
        id: servicio.empleado?.id,
        nombre: servicio.empleado?.nombre,
      },
      totalPrendas: servicio.prendas?.length || 0,
      observaciones: servicio.observaciones || '',
    }));

    return JSON.stringify(content, null, 2);
  }

  /**
   * Formatea el pie de página con estadísticas en formato JSON
   */
  protected async formatFooter(statistics: IReportStatistics): Promise<string> {
    const footer = {
      resumen: {
        totalServicios: statistics.totalServicios,
        valorTotal: statistics.valorTotal,
        valorPromedio: statistics.valorPromedio,
        serviciosPorEstado: statistics.serviciosPorEstado,
      },
      extremos: {
        servicioMasCaro: statistics.servicioMasCaro
          ? {
              numero: statistics.servicioMasCaro.numero,
              valorTotal: statistics.servicioMasCaro.valorTotal,
            }
          : null,
        servicioMasBarato: statistics.servicioMasBarato
          ? {
              numero: statistics.servicioMasBarato.numero,
              valorTotal: statistics.servicioMasBarato.valorTotal,
            }
          : null,
      },
      generadoEn: new Date().toISOString(),
    };

    return JSON.stringify(footer, null, 2);
  }

  /**
   * Genera el archivo JSON final combinando todas las partes
   */
  protected async generateFile(
    header: string,
    content: string,
    footer: string,
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<IReportResult> {
    // Combinar todas las partes en un objeto JSON completo
    const reporteCompleto = {
      encabezado: JSON.parse(header),
      servicios: JSON.parse(content),
      resumen: JSON.parse(footer),
    };

    const jsonContent = JSON.stringify(reporteCompleto, null, 2);
    const filename = this.generateFilename('json');

    return {
      filename,
      format: ReportFormat.JSON,
      content: jsonContent,
      generatedAt: new Date(),
      totalServicios: statistics.totalServicios,
      valorTotalGeneral: statistics.valorTotal,
      metadata: {
        size: Buffer.byteLength(jsonContent, 'utf8'),
        encoding: 'utf8',
      },
    };
  }

  /**
   * Hook post-generación para logging adicional
   */
  protected async postGeneration(result: IReportResult): Promise<void> {
    console.log('   📄 Reporte JSON generado con estructura completa');
    console.log(`   📦 Tamaño: ${result.metadata?.size} bytes`);
  }
}