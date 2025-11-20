import { Injectable, Logger } from '@nestjs/common';
import { IServicioObserver } from '../servicio-observer.interface';
import { ServicioEvent, ServicioEventType } from '../servicio-event.interface';

/**
 * Reporte generado
 */
interface Report {
  id: string;
  tipo: string;
  fechaGeneracion: Date;
  servicioNumero: string;
  contenido: string;
}

/**
 * Observador para generación automática de reportes
 * Genera reportes cuando ocurren eventos importantes
 */
@Injectable()
export class ReportGeneratorObserver implements IServicioObserver {
  private readonly logger = new Logger(ReportGeneratorObserver.name);
  private reportes: Report[] = [];

  getNombre(): string {
    return 'ReportGeneratorObserver';
  }

  getEventosSuscritos(): ServicioEventType[] {
    // Solo eventos que requieren reportes
    return [
      ServicioEventType.SERVICIO_DEVUELTO,
      ServicioEventType.SERVICIO_CANCELADO,
      ServicioEventType.DEVOLUCION_TARDIA,
    ];
  }

  async update(event: ServicioEvent): Promise<void> {
    const { tipo, servicio } = event;

    this.logger.log(
      `📄 Generando reporte para servicio #${servicio.numero} - Evento: ${tipo}`,
    );

    const reporte = await this.generarReporte(event);
    this.reportes.push(reporte);

    this.logger.log(
      `✓ Reporte generado: ${reporte.id} - Tipo: ${reporte.tipo}`,
    );
  }

  /**
   * Genera un reporte según el tipo de evento
   */
  private async generarReporte(event: ServicioEvent): Promise<Report> {
    const { tipo, servicio, timestamp, metadata } = event;

    const reporte: Report = {
      id: this.generarIdReporte(),
      tipo: this.determinarTipoReporte(tipo),
      fechaGeneracion: timestamp,
      servicioNumero: servicio.numero,
      contenido: '',
    };

    switch (tipo) {
      case ServicioEventType.SERVICIO_DEVUELTO:
        reporte.contenido = this.generarReporteDevolucion(servicio, metadata);
        break;

      case ServicioEventType.SERVICIO_CANCELADO:
        reporte.contenido = this.generarReporteCancelacion(servicio, metadata);
        break;

      case ServicioEventType.DEVOLUCION_TARDIA:
        reporte.contenido = this.generarReporteDevolucionTardia(
          servicio,
          metadata,
        );
        break;
    }

    // Simular guardado en sistema de archivos o BD
    await this.guardarReporte(reporte);

    return reporte;
  }

  /**
   * Genera ID único para el reporte
   */
  private generarIdReporte(): string {
    return `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determina el tipo de reporte según el evento
   */
  private determinarTipoReporte(eventType: ServicioEventType): string {
    switch (eventType) {
      case ServicioEventType.SERVICIO_DEVUELTO:
        return 'REPORTE_DEVOLUCION';
      case ServicioEventType.SERVICIO_CANCELADO:
        return 'REPORTE_CANCELACION';
      case ServicioEventType.DEVOLUCION_TARDIA:
        return 'REPORTE_DEVOLUCION_TARDIA';
      default:
        return 'REPORTE_GENERAL';
    }
  }

  /**
   * Genera contenido del reporte de devolución
   */
  private generarReporteDevolucion(
    servicio: any,
    metadata?: Record<string, any>,
  ): string {
    return `
REPORTE DE DEVOLUCIÓN
=====================
Servicio: ${servicio.numero}
Cliente: ${servicio.cliente?.nombre || 'N/A'}
Fecha Alquiler: ${servicio.fechaAlquiler}
Fecha Devolución: ${servicio.fechaDevolucion || new Date()}
Prendas: ${servicio.prendas?.length || 0}
Valor Total: $${servicio.valorTotal}
Días de Retraso: ${metadata?.diasRetraso || 0}
Estado: COMPLETADO
`;
  }

  /**
   * Genera contenido del reporte de cancelación
   */
  private generarReporteCancelacion(
    servicio: any,
    metadata?: Record<string, any>,
  ): string {
    return `
REPORTE DE CANCELACIÓN
======================
Servicio: ${servicio.numero}
Cliente: ${servicio.cliente?.nombre || 'N/A'}
Fecha Solicitud: ${servicio.fechaSolicitud}
Fecha Cancelación: ${new Date()}
Motivo: ${metadata?.motivo || 'No especificado'}
Valor Total: $${servicio.valorTotal}
Estado: CANCELADO
`;
  }

  /**
   * Genera contenido del reporte de devolución tardía
   */
  private generarReporteDevolucionTardia(
    servicio: any,
    metadata?: Record<string, any>,
  ): string {
    return `
REPORTE DE DEVOLUCIÓN TARDÍA
=============================
Servicio: ${servicio.numero}
Cliente: ${servicio.cliente?.nombre || 'N/A'}
Días de Retraso: ${metadata?.diasRetraso || 0}
Cargo Adicional: $${metadata?.cargoAdicional || 0}
Fecha Reporte: ${new Date()}
Estado: REQUIERE ATENCIÓN
`;
  }

  /**
   * Guarda el reporte (simula escritura en BD o archivo)
   */
  private async guardarReporte(reporte: Report): Promise<void> {
    // TODO: Guardar en BD o generar archivo PDF
    this.logger.debug(`Guardando reporte ${reporte.id}...`);
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Obtiene todos los reportes generados
   */
  getReportes(): Report[] {
    return [...this.reportes];
  }

  /**
   * Obtiene reportes de un servicio específico
   */
  getReportesPorServicio(servicioNumero: string): Report[] {
    return this.reportes.filter((r) => r.servicioNumero === servicioNumero);
  }

  /**
   * Limpia los reportes (solo para testing)
   */
  clearReportes(): void {
    this.reportes = [];
  }
}