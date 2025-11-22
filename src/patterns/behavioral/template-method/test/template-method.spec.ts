import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportGenerationService } from '../report-generation.service';
import {
  JsonReportGenerator,
  CsvReportGenerator,
  HtmlReportGenerator,
} from '../generators';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';
import { Cliente } from '../../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../../modules/empleados/entities/empleado.entity';
import { ReportFormat } from '../report-data.interface';

describe('Template Method Pattern - Report Generation', () => {
  let service: ReportGenerationService;
  let jsonGenerator: JsonReportGenerator;
  let csvGenerator: CsvReportGenerator;
  let htmlGenerator: HtmlReportGenerator;
  let servicioRepository: Repository<ServicioAlquiler>;

  // Mock data
  const mockCliente: Cliente = {
    id: 1,
    nombre: 'Juan',
    apellido: 'Pérez',
    telefono: '3001234567',
  } as Cliente;

  const mockEmpleado: Empleado = {
    id: 1,
    nombre: 'María',
    apellido: 'González',
  } as Empleado;

  const mockServicios: ServicioAlquiler[] = [
    {
      id: 1,
      numero: 1001,
      fechaAlquiler: new Date('2024-01-15'),
      fechaDevolucion: null,
      estado: 'pendiente',
      valorTotal: 150000,
      cliente: mockCliente,
      empleado: mockEmpleado,
      prendas: [{}, {}] as any,
      observaciones: 'Evento corporativo',
    } as ServicioAlquiler,
    {
      id: 2,
      numero: 1002,
      fechaAlquiler: new Date('2024-01-20'),
      fechaDevolucion: new Date('2024-01-22'),
      estado: 'devuelto',
      valorTotal: 300000,
      cliente: mockCliente,
      empleado: mockEmpleado,
      prendas: [{}, {}, {}] as any,
      observaciones: 'Boda',
    } as ServicioAlquiler,
    {
      id: 3,
      numero: 1003,
      fechaAlquiler: new Date('2024-01-25'),
      fechaDevolucion: null,
      estado: 'entregado',
      valorTotal: 200000,
      cliente: mockCliente,
      empleado: mockEmpleado,
      prendas: [{}] as any,
      observaciones: '',
    } as ServicioAlquiler,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportGenerationService,
        JsonReportGenerator,
        CsvReportGenerator,
        HtmlReportGenerator,
        {
          provide: getRepositoryToken(ServicioAlquiler),
          useValue: {
            find: jest.fn().mockResolvedValue(mockServicios),
          },
        },
      ],
    }).compile();

    service = module.get<ReportGenerationService>(ReportGenerationService);
    jsonGenerator = module.get<JsonReportGenerator>(JsonReportGenerator);
    csvGenerator = module.get<CsvReportGenerator>(CsvReportGenerator);
    htmlGenerator = module.get<HtmlReportGenerator>(HtmlReportGenerator);
    servicioRepository = module.get<Repository<ServicioAlquiler>>(
      getRepositoryToken(ServicioAlquiler),
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
    expect(jsonGenerator).toBeDefined();
    expect(csvGenerator).toBeDefined();
    expect(htmlGenerator).toBeDefined();
  });

  describe('Generación de Reportes JSON', () => {
    it('debe generar un reporte en formato JSON correctamente', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.JSON,
        fechaInicio,
        fechaFin,
      );

      expect(result).toBeDefined();
      expect(result.format).toBe(ReportFormat.JSON);
      expect(result.filename).toContain('.json');
      expect(result.totalServicios).toBe(3);
      expect(result.valorTotalGeneral).toBe(650000);
      expect(typeof result.content).toBe('string');

      // Verificar que el contenido es JSON válido
      const parsedContent = JSON.parse(result.content as string);
      expect(parsedContent).toHaveProperty('encabezado');
      expect(parsedContent).toHaveProperty('servicios');
      expect(parsedContent).toHaveProperty('resumen');
      expect(parsedContent.servicios).toHaveLength(3);
    });

    it('debe incluir todos los datos del encabezado en JSON', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.JSON,
        fechaInicio,
        fechaFin,
      );

      const parsedContent = JSON.parse(result.content as string);
      expect(parsedContent.encabezado.titulo).toBe(
        'Reporte de Servicios de Alquiler',
      );
      expect(parsedContent.encabezado.empresa).toBe('Los Atuendos');
      expect(parsedContent.encabezado.periodo.inicio).toBeDefined();
      expect(parsedContent.encabezado.periodo.fin).toBeDefined();
    });

    it('debe incluir estadísticas en el resumen JSON', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.JSON,
        fechaInicio,
        fechaFin,
      );

      const parsedContent = JSON.parse(result.content as string);
      expect(parsedContent.resumen.resumen.totalServicios).toBe(3);
      expect(parsedContent.resumen.resumen.valorTotal).toBe(650000);
      expect(parsedContent.resumen.resumen.valorPromedio).toBe(650000 / 3);
      expect(parsedContent.resumen.resumen.serviciosPorEstado).toBeDefined();
    });
  });

  describe('Generación de Reportes CSV', () => {
    it('debe generar un reporte en formato CSV correctamente', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.CSV,
        fechaInicio,
        fechaFin,
      );

      expect(result).toBeDefined();
      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.filename).toContain('.csv');
      expect(result.totalServicios).toBe(3);
      expect(result.valorTotalGeneral).toBe(650000);
      expect(typeof result.content).toBe('string');
    });

    it('debe incluir encabezados de columnas en CSV', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.CSV,
        fechaInicio,
        fechaFin,
      );

      const content = result.content as string;
      expect(content).toContain('Numero,Fecha Alquiler,Fecha Devolucion');
      expect(content).toContain('Estado,Valor Total,Cliente');
    });

    it('debe incluir todos los servicios como filas en CSV', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.CSV,
        fechaInicio,
        fechaFin,
      );

      const content = result.content as string;
      expect(content).toContain('1001');
      expect(content).toContain('1002');
      expect(content).toContain('1003');
      expect(content).toContain('150000');
      expect(content).toContain('300000');
      expect(content).toContain('200000');
    });

    it('debe incluir metadata correcta para CSV', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.CSV,
        fechaInicio,
        fechaFin,
      );

      expect(result.metadata?.rows).toBe(4); // 3 servicios + 1 encabezado
      expect(result.metadata?.delimiter).toBe(',');
    });
  });

  describe('Generación de Reportes HTML', () => {
    it('debe generar un reporte en formato HTML correctamente', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.EXCEL, // Usamos EXCEL que mapea a HTML
        fechaInicio,
        fechaFin,
      );

      expect(result).toBeDefined();
      expect(result.format).toBe('html');
      expect(result.filename).toContain('.html');
      expect(result.totalServicios).toBe(3);
      expect(result.valorTotalGeneral).toBe(650000);
      expect(typeof result.content).toBe('string');
    });

    it('debe incluir estructura HTML válida', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.EXCEL,
        fechaInicio,
        fechaFin,
      );

      const content = result.content as string;
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<html');
      expect(content).toContain('</html>');
      expect(content).toContain('<table>');
      expect(content).toContain('</table>');
    });

    it('debe incluir estilos CSS en HTML', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.EXCEL,
        fechaInicio,
        fechaFin,
      );

      const content = result.content as string;
      expect(content).toContain('<style>');
      expect(content).toContain('</style>');
      expect(content).toContain('background-color');
    });

    it('debe incluir metadata correcta para HTML', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.EXCEL,
        fechaInicio,
        fechaFin,
      );

      expect(result.metadata?.hasStyles).toBe(true);
      expect(result.metadata?.responsive).toBe(true);
      expect(result.metadata?.size).toBeGreaterThan(0);
    });
  });

  describe('Filtros de Reportes', () => {
    it('debe generar reporte con filtro de estado', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.JSON,
        fechaInicio,
        fechaFin,
        { estado: 'pendiente' },
      );

      expect(result).toBeDefined();
      expect(result.totalServicios).toBeLessThanOrEqual(3);
    });

    it('debe generar reporte con filtro de cliente', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.JSON,
        fechaInicio,
        fechaFin,
        { clienteId: 1 },
      );

      expect(result).toBeDefined();
    });

    it('debe generar reporte con múltiples filtros', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.JSON,
        fechaInicio,
        fechaFin,
        {
          estado: 'entregado',
          clienteId: 1,
          empleadoId: 1,
        },
      );

      expect(result).toBeDefined();
    });
  });

  describe('Generación de Múltiples Formatos', () => {
    it('debe generar reportes en múltiples formatos simultáneamente', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');
      const formats = [ReportFormat.JSON, ReportFormat.CSV, ReportFormat.EXCEL];

      const results = await service.generateMultipleFormats(
        formats,
        fechaInicio,
        fechaFin,
      );

      expect(results).toHaveLength(3);
      expect(results[0].format).toBe(ReportFormat.JSON);
      expect(results[1].format).toBe(ReportFormat.CSV);
      expect(results[2].format).toBe('html');

      // Todos deben tener los mismos totales
      results.forEach(result => {
        expect(result.totalServicios).toBe(3);
        expect(result.valorTotalGeneral).toBe(650000);
      });
    });
  });

  describe('Validaciones', () => {
    it('debe lanzar error si no hay servicios', async () => {
      jest.spyOn(servicioRepository, 'find').mockResolvedValue([]);

      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      await expect(
        service.generateReport(ReportFormat.JSON, fechaInicio, fechaFin),
      ).rejects.toThrow('No se encontraron servicios');
    });

    it('debe lanzar error con formato no soportado', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      await expect(
        service.generateReport('INVALID' as any, fechaInicio, fechaFin),
      ).rejects.toThrow('Formato de reporte no soportado');
    });
  });

  describe('Formatos Disponibles', () => {
    it('debe retornar los formatos disponibles', () => {
      const formats = service.getAvailableFormats();

      expect(formats).toContain(ReportFormat.JSON);
      expect(formats).toContain(ReportFormat.CSV);
      expect(formats).toContain(ReportFormat.EXCEL);
    });
  });

  describe('Template Method - Flujo Completo', () => {
    it('debe ejecutar todos los pasos del template method para JSON', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.JSON,
        fechaInicio,
        fechaFin,
      );

      // Verificar que el resultado tenga todas las propiedades esperadas
      expect(result.filename).toBeDefined();
      expect(result.format).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(result.totalServicios).toBeDefined();
      expect(result.valorTotalGeneral).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('debe ejecutar todos los pasos del template method para CSV', async () => {
      const fechaInicio = new Date('2024-01-01');
      const fechaFin = new Date('2024-01-31');

      const result = await service.generateReport(
        ReportFormat.CSV,
        fechaInicio,
        fechaFin,
      );

      expect(result.filename).toBeDefined();
      expect(result.format).toBe(ReportFormat.CSV);
      expect(result.content).toBeDefined();
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });
});