import { IReportData, IReportResult, IReportStatistics } from './report-data.interface';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Clase abstracta que implementa el patrón Template Method
 * Define el esqueleto del algoritmo de generación de reportes
 *
 * El Template Method es generateReport(), que define los pasos:
 * 1. Validar datos
 * 2. Preparar datos
 * 3. Calcular estadísticas
 * 4. Formatear encabezado
 * 5. Formatear contenido
 * 6. Formatear pie de página
 * 7. Generar archivo final
 */
export abstract class AbstractReportGenerator {
  /**
   * TEMPLATE METHOD
   * Define el esqueleto del algoritmo de generación de reportes
   * Este método NO debe ser sobrescrito por las subclases
   */
  public async generateReport(data: IReportData): Promise<IReportResult> {
    console.log(`\n📊 Iniciando generación de reporte en formato ${this.getFormat()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Paso 1: Validar datos de entrada
    console.log('1️⃣  Validando datos de entrada...');
    this.validateData(data);

    // Paso 2: Preparar y filtrar datos
    console.log('2️⃣  Preparando y filtrando datos...');
    const preparedData = this.prepareData(data);

    // Paso 3: Calcular estadísticas
    console.log('3️⃣  Calculando estadísticas...');
    const statistics = this.calculateStatistics(preparedData);

    // Paso 4: Formatear encabezado (método abstracto - debe ser implementado)
    console.log('4️⃣  Formateando encabezado...');
    const header = await this.formatHeader(data, statistics);

    // Paso 5: Formatear contenido (método abstracto - debe ser implementado)
    console.log('5️⃣  Formateando contenido...');
    const content = await this.formatContent(preparedData, statistics);

    // Paso 6: Formatear pie de página (método con implementación por defecto)
    console.log('6️⃣  Formateando pie de página...');
    const footer = await this.formatFooter(statistics);

    // Paso 7: Generar archivo final (método abstracto - debe ser implementado)
    console.log('7️⃣  Generando archivo final...');
    const result = await this.generateFile(header, content, footer, data, statistics);

    // Hook: Operaciones post-generación (opcional)
    await this.postGeneration(result);

    console.log('✅ Reporte generado exitosamente');
    console.log(`   Archivo: ${result.filename}`);
    console.log(`   Servicios: ${result.totalServicios}`);
    console.log(`   Valor total: $${result.valorTotalGeneral.toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return result;
  }

  /**
   * Paso 1: Validación de datos (implementación por defecto)
   * Puede ser sobrescrito si se necesita validación específica
   */
  protected validateData(data: IReportData): void {
    if (!data.servicios || data.servicios.length === 0) {
      throw new Error('No hay servicios para generar el reporte');
    }

    if (!data.fechaInicio || !data.fechaFin) {
      throw new Error('Las fechas de inicio y fin son requeridas');
    }

    if (data.fechaInicio > data.fechaFin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    console.log(`   ✓ Validación exitosa: ${data.servicios.length} servicios`);
  }

  /**
   * Paso 2: Preparación de datos (implementación por defecto)
   * Puede ser sobrescrito para lógica de preparación específica
   */
  protected prepareData(data: IReportData): ServicioAlquiler[] {
    let servicios = [...data.servicios];

    // Aplicar filtros si existen
    if (data.filtros) {
      const filtros = data.filtros;

      if (filtros.estado) {
        servicios = servicios.filter(s => s.estado === filtros.estado);
        console.log(`   ✓ Filtrado por estado: ${filtros.estado}`);
      }

      if (filtros.clienteId) {
        servicios = servicios.filter(s => s.cliente?.id === filtros.clienteId);
        console.log(`   ✓ Filtrado por cliente ID: ${filtros.clienteId}`);
      }

      if (filtros.empleadoId) {
        servicios = servicios.filter(s => s.empleado?.id === filtros.empleadoId);
        console.log(`   ✓ Filtrado por empleado ID: ${filtros.empleadoId}`);
      }
    }

    // Ordenar por fecha de alquiler (más reciente primero)
    servicios.sort((a, b) => b.fechaAlquiler.getTime() - a.fechaAlquiler.getTime());

    console.log(`   ✓ ${servicios.length} servicios preparados`);
    return servicios;
  }

  /**
   * Paso 3: Cálculo de estadísticas (implementación común)
   * Raramente necesita ser sobrescrito
   */
  protected calculateStatistics(servicios: ServicioAlquiler[]): IReportStatistics {
    const totalServicios = servicios.length;
    const valorTotal = servicios.reduce((sum, s) => sum + s.valorTotal, 0);
    const valorPromedio = totalServicios > 0 ? valorTotal / totalServicios : 0;

    // Servicios por estado
    const serviciosPorEstado: Record<string, number> = {};
    servicios.forEach(s => {
      serviciosPorEstado[s.estado] = (serviciosPorEstado[s.estado] || 0) + 1;
    });

    // Servicio más caro y más barato
    let servicioMasCaro: ServicioAlquiler | null = null;
    let servicioMasBarato: ServicioAlquiler | null = null;

    if (servicios.length > 0) {
      servicioMasCaro = servicios.reduce((max, s) =>
        s.valorTotal > max.valorTotal ? s : max
      );
      servicioMasBarato = servicios.reduce((min, s) =>
        s.valorTotal < min.valorTotal ? s : min
      );
    }

    console.log(`   ✓ Estadísticas calculadas: ${totalServicios} servicios, $${valorTotal.toLocaleString()}`);

    return {
      totalServicios,
      valorTotal,
      serviciosPorEstado,
      valorPromedio,
      servicioMasCaro,
      servicioMasBarato,
    };
  }

  /**
   * Paso 4: MÉTODO ABSTRACTO - Formatear encabezado
   * Debe ser implementado por cada subclase según el formato
   */
  protected abstract formatHeader(
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<string>;

  /**
   * Paso 5: MÉTODO ABSTRACTO - Formatear contenido
   * Debe ser implementado por cada subclase según el formato
   */
  protected abstract formatContent(
    servicios: ServicioAlquiler[],
    statistics: IReportStatistics,
  ): Promise<string>;

  /**
   * Paso 6: Formatear pie de página (implementación por defecto)
   * Puede ser sobrescrito para personalización
   */
  protected async formatFooter(statistics: IReportStatistics): Promise<string> {
    const timestamp = new Date().toLocaleString('es-CO');
    return `Generado el ${timestamp} | Total de servicios: ${statistics.totalServicios}`;
  }

  /**
   * Paso 7: MÉTODO ABSTRACTO - Generar archivo final
   * Debe ser implementado por cada subclase según el formato
   */
  protected abstract generateFile(
    header: string,
    content: string,
    footer: string,
    data: IReportData,
    statistics: IReportStatistics,
  ): Promise<IReportResult>;

  /**
   * HOOK: Operaciones post-generación (opcional)
   * Puede ser sobrescrito para lógica adicional después de generar el reporte
   */
  protected async postGeneration(result: IReportResult): Promise<void> {
    // Implementación vacía por defecto
    // Las subclases pueden sobrescribir para agregar funcionalidad
  }

  /**
   * MÉTODO ABSTRACTO - Obtener formato del reporte
   */
  protected abstract getFormat(): string;

  /**
   * Método helper para generar nombre de archivo
   */
  protected generateFilename(format: string): string {
    const timestamp = new Date().getTime();
    return `reporte_servicios_${timestamp}.${format}`;
  }
}