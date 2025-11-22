import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';
import {
  IReportData,
  IReportResult,
  ReportFormat,
} from './report-data.interface';
import {
  JsonReportGenerator,
  CsvReportGenerator,
  HtmlReportGenerator,
} from './generators';

/**
 * Servicio para generación de reportes usando Template Method Pattern
 * Gestiona los diferentes generadores de reportes y proporciona
 * una interfaz unificada para generar reportes en distintos formatos
 */
@Injectable()
export class ReportGenerationService {
  constructor(
    @InjectRepository(ServicioAlquiler)
    private readonly servicioRepository: Repository<ServicioAlquiler>,
    private readonly jsonGenerator: JsonReportGenerator,
    private readonly csvGenerator: CsvReportGenerator,
    private readonly htmlGenerator: HtmlReportGenerator,
  ) {}

  /**
   * Genera un reporte en el formato especificado
   */
  async generateReport(
    format: ReportFormat,
    fechaInicio: Date,
    fechaFin: Date,
    filtros?: {
      estado?: string;
      clienteId?: number;
      empleadoId?: number;
    },
  ): Promise<IReportResult> {
    console.log(`\n🚀 Solicitud de generación de reporte en formato: ${format}`);

    // Obtener servicios del repositorio
    const servicios = await this.obtenerServicios(fechaInicio, fechaFin);

    if (servicios.length === 0) {
      throw new BadRequestException(
        'No se encontraron servicios en el rango de fechas especificado',
      );
    }

    // Preparar datos para el reporte
    const reportData: IReportData = {
      servicios,
      fechaInicio,
      fechaFin,
      filtros,
    };

    // Seleccionar el generador apropiado y generar el reporte
    const generator = this.getGenerator(format);
    const result = await generator.generateReport(reportData);

    return result;
  }

  /**
   * Genera reportes en múltiples formatos simultáneamente
   */
  async generateMultipleFormats(
    formats: ReportFormat[],
    fechaInicio: Date,
    fechaFin: Date,
    filtros?: {
      estado?: string;
      clienteId?: number;
      empleadoId?: number;
    },
  ): Promise<IReportResult[]> {
    console.log(`\n📦 Generando reportes en ${formats.length} formatos`);

    const servicios = await this.obtenerServicios(fechaInicio, fechaFin);

    if (servicios.length === 0) {
      throw new BadRequestException(
        'No se encontraron servicios en el rango de fechas especificado',
      );
    }

    const reportData: IReportData = {
      servicios,
      fechaInicio,
      fechaFin,
      filtros,
    };

    // Generar todos los reportes en paralelo
    const promises = formats.map(format => {
      const generator = this.getGenerator(format);
      return generator.generateReport(reportData);
    });

    const results = await Promise.all(promises);

    console.log(`✅ ${results.length} reportes generados exitosamente\n`);

    return results;
  }

  /**
   * Obtiene los formatos de reporte disponibles
   */
  getAvailableFormats(): ReportFormat[] {
    return [ReportFormat.JSON, ReportFormat.CSV, ReportFormat.EXCEL];
  }

  /**
   * Obtiene servicios del repositorio con relaciones necesarias
   */
  private async obtenerServicios(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<ServicioAlquiler[]> {
    return await this.servicioRepository.find({
      where: {
        fechaAlquiler: Between(fechaInicio, fechaFin),
      },
      relations: ['cliente', 'empleado', 'prendas'],
      order: {
        fechaAlquiler: 'DESC',
      },
    });
  }

  /**
   * Selecciona el generador apropiado según el formato
   */
  private getGenerator(format: ReportFormat) {
    switch (format) {
      case ReportFormat.JSON:
        return this.jsonGenerator;
      case ReportFormat.CSV:
        return this.csvGenerator;
      case ReportFormat.EXCEL:
        return this.htmlGenerator; // Usamos HTML como alternativa a Excel
      default:
        throw new BadRequestException(
          `Formato de reporte no soportado: ${format}`,
        );
    }
  }
}