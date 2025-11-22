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
 * Generador de reportes en formato HTML
 * Implementa los métodos abstractos del Template Method
 */
@Injectable()
export class HtmlReportGenerator extends AbstractReportGenerator {
  protected getFormat(): string {
    return 'html';
  }

  /**
   * Formatea el encabezado en formato HTML
   */
  protected async formatHeader(
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<string> {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Servicios - Los Atuendos</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        .header {
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #333;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            font-size: 16px;
        }
        .info-box {
            background-color: #f9f9f9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 20px 0;
        }
        .info-box p {
            margin: 5px 0;
            color: #555;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background-color: #4CAF50;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .estado-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .estado-pendiente { background-color: #fff3cd; color: #856404; }
        .estado-confirmado { background-color: #d1ecf1; color: #0c5460; }
        .estado-entregado { background-color: #d4edda; color: #155724; }
        .estado-devuelto { background-color: #d1d1d1; color: #383838; }
        .estado-cancelado { background-color: #f8d7da; color: #721c24; }
        .valor {
            font-weight: 600;
            color: #2e7d32;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Reporte de Servicios de Alquiler</h1>
            <p class="subtitle">Los Atuendos - Sistema de Gestión de Alquiler de Vestuario</p>
        </div>

        <div class="info-box">
            <p><strong>📅 Período:</strong> ${data.fechaInicio.toLocaleDateString('es-CO')} - ${data.fechaFin.toLocaleDateString('es-CO')}</p>
            <p><strong>📊 Total de servicios:</strong> ${statistics.totalServicios}</p>
            <p><strong>💰 Valor total:</strong> $${statistics.valorTotal.toLocaleString('es-CO')}</p>
            <p><strong>📈 Valor promedio:</strong> $${statistics.valorPromedio.toLocaleString('es-CO')}</p>
            <p><strong>🕒 Generado:</strong> ${new Date().toLocaleString('es-CO')}</p>
        </div>
`;
  }

  /**
   * Formatea el contenido (servicios) en formato HTML (tabla)
   */
  protected async formatContent(
    servicios: ServicioAlquiler[],
    statistics: IReportStatistics,
  ): Promise<string> {
    let html = `
        <h2>Detalle de Servicios</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Empleado</th>
                    <th>Estado</th>
                    <th>Prendas</th>
                    <th>Valor Total</th>
                </tr>
            </thead>
            <tbody>
`;

    servicios.forEach(servicio => {
      const estadoClass = `estado-${servicio.estado.toLowerCase()}`;
      html += `
                <tr>
                    <td><strong>#${servicio.numero}</strong></td>
                    <td>${servicio.fechaAlquiler.toLocaleDateString('es-CO')}</td>
                    <td>${servicio.cliente?.nombre || ''}</td>
                    <td>${servicio.empleado?.nombre || ''}</td>
                    <td><span class="estado-badge ${estadoClass}">${servicio.estado}</span></td>
                    <td>${servicio.prendas?.length || 0}</td>
                    <td class="valor">$${servicio.valorTotal.toLocaleString('es-CO')}</td>
                </tr>
`;
    });

    html += `
            </tbody>
        </table>
`;

    return html;
  }

  /**
   * Formatea el pie de página con estadísticas en formato HTML
   */
  protected async formatFooter(statistics: IReportStatistics): Promise<string> {
    let html = `
        <div class="info-box" style="border-left-color: #2196F3;">
            <h3>📊 Resumen Estadístico</h3>
            <p><strong>Total de servicios:</strong> ${statistics.totalServicios}</p>
            <p><strong>Valor total:</strong> $${statistics.valorTotal.toLocaleString('es-CO')}</p>
            <p><strong>Valor promedio:</strong> $${statistics.valorPromedio.toLocaleString('es-CO')}</p>

            <h4>Distribución por Estado:</h4>
            <ul>
`;

    Object.entries(statistics.serviciosPorEstado).forEach(([estado, cantidad]) => {
      html += `                <li><strong>${estado}:</strong> ${cantidad} servicios</li>\n`;
    });

    html += `            </ul>\n`;

    if (statistics.servicioMasCaro) {
      html += `            <p><strong>🔝 Servicio más caro:</strong> #${statistics.servicioMasCaro.numero} - $${statistics.servicioMasCaro.valorTotal.toLocaleString('es-CO')}</p>\n`;
    }

    if (statistics.servicioMasBarato) {
      html += `            <p><strong>💵 Servicio más económico:</strong> #${statistics.servicioMasBarato.numero} - $${statistics.servicioMasBarato.valorTotal.toLocaleString('es-CO')}</p>\n`;
    }

    html += `        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>Reporte generado automáticamente por el Sistema Los Atuendos</p>
            <p>${new Date().toLocaleString('es-CO')}</p>
        </div>
    </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Genera el archivo HTML final
   */
  protected async generateFile(
    header: string,
    content: string,
    footer: string,
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<IReportResult> {
    const htmlContent = `${header}${content}${footer}`;
    const filename = this.generateFilename('html');

    return {
      filename,
      format: 'html',
      content: htmlContent,
      generatedAt: new Date(),
      totalServicios: statistics.totalServicios,
      valorTotalGeneral: statistics.valorTotal,
      metadata: {
        size: Buffer.byteLength(htmlContent, 'utf8'),
        hasStyles: true,
        responsive: true,
      },
    };
  }

  /**
   * Hook post-generación para logging
   */
  protected async postGeneration(result: IReportResult): Promise<void> {
    console.log('   🌐 Reporte HTML generado con estilos responsive');
    console.log(`   📦 Tamaño: ${result.metadata?.size} bytes`);
  }
}