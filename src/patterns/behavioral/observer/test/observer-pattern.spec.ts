import { Test, TestingModule } from '@nestjs/testing';
import { ServicioSubject } from '../servicio-subject';
import { EmailNotificationObserver } from '../observers/email-notification.observer';
import { SmsNotificationObserver } from '../observers/sms-notification.observer';
import { AuditLogObserver } from '../observers/audit-log.observer';
import { DashboardObserver } from '../observers/dashboard.observer';
import { ReportGeneratorObserver } from '../observers/report-generator.observer';
import { ServicioEventType } from '../servicio-event.interface';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';
import { Cliente } from '../../../../modules/clientes/entities/cliente.entity';
import { Empleado } from '../../../../modules/empleados/entities/empleado.entity';

describe('Observer Pattern - Notificaciones de Eventos', () => {
  let subject: ServicioSubject;
  let emailObserver: EmailNotificationObserver;
  let smsObserver: SmsNotificationObserver;
  let auditObserver: AuditLogObserver;
  let dashboardObserver: DashboardObserver;
  let reportObserver: ReportGeneratorObserver;

  // Servicio de ejemplo para tests
  let servicioEjemplo: ServicioAlquiler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicioSubject,
        EmailNotificationObserver,
        SmsNotificationObserver,
        AuditLogObserver,
        DashboardObserver,
        ReportGeneratorObserver,
      ],
    }).compile();

    subject = module.get<ServicioSubject>(ServicioSubject);
    emailObserver = module.get<EmailNotificationObserver>(
      EmailNotificationObserver,
    );
    smsObserver = module.get<SmsNotificationObserver>(SmsNotificationObserver);
    auditObserver = module.get<AuditLogObserver>(AuditLogObserver);
    dashboardObserver = module.get<DashboardObserver>(DashboardObserver);
    reportObserver = module.get<ReportGeneratorObserver>(
      ReportGeneratorObserver,
    );

    // Crear servicio de ejemplo
    const cliente = new Cliente();
    cliente.id = 1;
    cliente.nombre = 'Juan Pérez';
    cliente.correoElectronico = 'juan@example.com';
    cliente.telefono = '+573001234567';
    cliente.numeroIdentificacion = '1234567890';

    const empleado = new Empleado();
    empleado.id = 1;
    empleado.nombre = 'María González';
    empleado.numeroIdentificacion = '0987654321';

    servicioEjemplo = new ServicioAlquiler();
    servicioEjemplo.id = 1;
    servicioEjemplo.numero = 1001;
    servicioEjemplo.estado = 'pendiente';
    servicioEjemplo.valorTotal = 100000;
    servicioEjemplo.fechaAlquiler = new Date('2024-02-01');
    servicioEjemplo.cliente = cliente;
    servicioEjemplo.empleado = empleado;
    servicioEjemplo.prendas = [];
  });

  describe('ServicioSubject - Gestión de Observadores', () => {
    it('debe inicializar con 5 observadores registrados', () => {
      expect(subject.getObserverCount()).toBe(5);
    });

    it('debe tener todos los observadores correctamente registrados', () => {
      const observers = subject.getObservers();
      const nombres = observers.map((o) => o.getNombre());

      expect(nombres).toContain('EmailNotificationObserver');
      expect(nombres).toContain('SmsNotificationObserver');
      expect(nombres).toContain('AuditLogObserver');
      expect(nombres).toContain('DashboardObserver');
      expect(nombres).toContain('ReportGeneratorObserver');
    });

    it('debe permitir desregistrar un observador', () => {
      subject.detach(emailObserver);
      expect(subject.getObserverCount()).toBe(4);

      const observers = subject.getObservers();
      const nombres = observers.map((o) => o.getNombre());
      expect(nombres).not.toContain('EmailNotificationObserver');
    });

    it('debe permitir limpiar todos los observadores', () => {
      subject.clearObservers();
      expect(subject.getObserverCount()).toBe(0);
    });

    it('no debe duplicar observadores al intentar registrarlos nuevamente', () => {
      subject.attach(emailObserver);
      expect(subject.getObserverCount()).toBe(5); // Sigue siendo 5
    });
  });

  describe('EmailNotificationObserver', () => {
    it('debe estar suscrito a los eventos principales', () => {
      const eventos = emailObserver.getEventosSuscritos();
      expect(eventos).toContain(ServicioEventType.SERVICIO_CREADO);
      expect(eventos).toContain(ServicioEventType.SERVICIO_CONFIRMADO);
      expect(eventos).toContain(ServicioEventType.SERVICIO_CANCELADO);
      expect(eventos.length).toBe(6);
    });

    it('debe procesar evento SERVICIO_CREADO', async () => {
      const spy = jest.spyOn(emailObserver, 'update');
      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );
      expect(spy).toHaveBeenCalled();
    });

    it('debe procesar evento SERVICIO_CONFIRMADO', async () => {
      const spy = jest.spyOn(emailObserver, 'update');
      servicioEjemplo.estado = 'confirmado';
      await subject.notify(
        ServicioEventType.SERVICIO_CONFIRMADO,
        servicioEjemplo,
      );
      expect(spy).toHaveBeenCalled();
    });

    it('debe procesar evento SERVICIO_CANCELADO', async () => {
      const spy = jest.spyOn(emailObserver, 'update');
      servicioEjemplo.estado = 'cancelado';
      await subject.notify(
        ServicioEventType.SERVICIO_CANCELADO,
        servicioEjemplo,
      );
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('SmsNotificationObserver', () => {
    it('debe estar suscrito solo a eventos críticos', () => {
      const eventos = smsObserver.getEventosSuscritos();
      expect(eventos).toContain(ServicioEventType.SERVICIO_CONFIRMADO);
      expect(eventos).toContain(ServicioEventType.SERVICIO_ENTREGADO);
      expect(eventos).toContain(ServicioEventType.DEVOLUCION_TARDIA);
      expect(eventos.length).toBe(3);
    });

    it('debe procesar evento SERVICIO_CONFIRMADO', async () => {
      const spy = jest.spyOn(smsObserver, 'update');
      servicioEjemplo.estado = 'confirmado';
      await subject.notify(
        ServicioEventType.SERVICIO_CONFIRMADO,
        servicioEjemplo,
      );
      expect(spy).toHaveBeenCalled();
    });

    it('debe procesar evento DEVOLUCION_TARDIA', async () => {
      const spy = jest.spyOn(smsObserver, 'update');
      await subject.notify(ServicioEventType.DEVOLUCION_TARDIA, servicioEjemplo, {
        diasRetraso: 3,
      });
      expect(spy).toHaveBeenCalled();
    });

    it('NO debe procesar evento SERVICIO_CREADO (no está suscrito)', async () => {
      const spy = jest.spyOn(smsObserver, 'update');
      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );
      expect(spy).not.toHaveBeenCalled();
    });

    it('NO debe procesar evento SERVICIO_CANCELADO (no está suscrito)', async () => {
      const spy = jest.spyOn(smsObserver, 'update');
      servicioEjemplo.estado = 'cancelado';
      await subject.notify(
        ServicioEventType.SERVICIO_CANCELADO,
        servicioEjemplo,
      );
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('AuditLogObserver', () => {
    it('debe estar suscrito a todos los eventos', () => {
      const eventos = auditObserver.getEventosSuscritos();
      expect(eventos.length).toBe(0); // Array vacío = todos los eventos
    });

    it('debe registrar evento SERVICIO_CREADO en el log de auditoría', async () => {
      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );

      const logs = auditObserver.getAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].eventType).toBe(
        ServicioEventType.SERVICIO_CREADO,
      );
    });

    it('debe registrar múltiples eventos secuencialmente', async () => {
      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );
      servicioEjemplo.estado = 'confirmado';
      await subject.notify(
        ServicioEventType.SERVICIO_CONFIRMADO,
        servicioEjemplo,
      );
      servicioEjemplo.estado = 'entregado';
      await subject.notify(
        ServicioEventType.SERVICIO_ENTREGADO,
        servicioEjemplo,
      );

      const logs = auditObserver.getAuditLogs();
      expect(logs.length).toBeGreaterThanOrEqual(3);
    });

    it('debe incluir metadata en los logs', async () => {
      const metadata = { usuario: 'admin', ip: '192.168.1.1' };
      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
        metadata,
      );

      const logs = auditObserver.getAuditLogs();
      const ultimoLog = logs[logs.length - 1];
      expect(ultimoLog.metadata).toEqual(metadata);
    });
  });

  describe('DashboardObserver', () => {
    it('debe estar suscrito a todos los eventos', () => {
      const eventos = dashboardObserver.getEventosSuscritos();
      expect(eventos.length).toBe(0);
    });

    it('debe actualizar estadísticas cuando se crea un servicio', async () => {
      const estadisticasAntes = dashboardObserver.getStats();
      const totalServiciosAntes = estadisticasAntes.totalServicios;

      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );

      const estadisticasDespues = dashboardObserver.getStats();
      expect(estadisticasDespues.totalServicios).toBe(totalServiciosAntes + 1);
    });

    it('debe actualizar contador de pendientes cuando se crea un servicio', async () => {
      const estadisticasAntes = dashboardObserver.getStats();
      const pendientesAntes = estadisticasAntes.serviciosPendientes;

      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );

      const estadisticasDespues = dashboardObserver.getStats();
      expect(estadisticasDespues.serviciosPendientes).toBe(
        pendientesAntes + 1,
      );
    });

    it('debe contabilizar servicios confirmados', async () => {
      servicioEjemplo.estado = 'confirmado';
      await subject.notify(
        ServicioEventType.SERVICIO_CONFIRMADO,
        servicioEjemplo,
      );

      const estadisticas = dashboardObserver.getStats();
      expect(estadisticas.serviciosConfirmados).toBeGreaterThan(0);
    });

    it('debe resetear estadísticas correctamente', () => {
      dashboardObserver.resetStats();
      const estadisticas = dashboardObserver.getStats();
      expect(estadisticas.totalServicios).toBe(0);
      expect(estadisticas.serviciosPendientes).toBe(0);
    });
  });

  describe('ReportGeneratorObserver', () => {
    it('debe estar suscrito solo a eventos de finalización', () => {
      const eventos = reportObserver.getEventosSuscritos();
      expect(eventos).toContain(ServicioEventType.SERVICIO_DEVUELTO);
      expect(eventos).toContain(ServicioEventType.SERVICIO_CANCELADO);
      expect(eventos).toContain(ServicioEventType.DEVOLUCION_TARDIA);
      expect(eventos.length).toBe(3);
    });

    it('debe generar reporte cuando se devuelve un servicio', async () => {
      const spy = jest.spyOn(reportObserver, 'update');
      servicioEjemplo.estado = 'devuelto';
      servicioEjemplo.fechaDevolucion = new Date('2024-02-05');
      await subject.notify(
        ServicioEventType.SERVICIO_DEVUELTO,
        servicioEjemplo,
      );

      expect(spy).toHaveBeenCalled();
      const reportes = reportObserver.getReportes();
      expect(reportes.length).toBeGreaterThan(0);
    });

    it('debe generar reporte cuando se cancela un servicio', async () => {
      servicioEjemplo.estado = 'cancelado';
      await subject.notify(
        ServicioEventType.SERVICIO_CANCELADO,
        servicioEjemplo,
      );

      const reportes = reportObserver.getReportes();
      expect(reportes.length).toBeGreaterThan(0);
      expect(reportes[reportes.length - 1].tipo).toBe('REPORTE_CANCELACION');
    });

    it('NO debe generar reporte para eventos no suscritos', async () => {
      const reportesAntes = reportObserver.getReportes().length;

      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );

      const reportesDespues = reportObserver.getReportes().length;
      expect(reportesDespues).toBe(reportesAntes);
    });
  });

  describe('Notificaciones - Flujo completo', () => {
    it('debe notificar correctamente el ciclo completo de un servicio', async () => {
      // 1. Crear servicio
      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );

      // 2. Confirmar servicio
      servicioEjemplo.estado = 'confirmado';
      await subject.notify(
        ServicioEventType.SERVICIO_CONFIRMADO,
        servicioEjemplo,
      );

      // 3. Entregar servicio
      servicioEjemplo.estado = 'entregado';
      await subject.notify(
        ServicioEventType.SERVICIO_ENTREGADO,
        servicioEjemplo,
      );

      // 4. Devolver servicio
      servicioEjemplo.estado = 'devuelto';
      servicioEjemplo.fechaDevolucion = new Date('2024-02-05');
      await subject.notify(
        ServicioEventType.SERVICIO_DEVUELTO,
        servicioEjemplo,
      );

      // Verificar que se registraron todos los eventos en auditoría
      const logs = auditObserver.getAuditLogs();
      expect(logs.length).toBeGreaterThanOrEqual(4);

      // Verificar que se generó el reporte final
      const reportes = reportObserver.getReportes();
      expect(reportes.length).toBeGreaterThan(0);
    });

    it('debe manejar devolución tardía correctamente', async () => {
      const smsUpdateSpy = jest.spyOn(smsObserver, 'update');
      const emailUpdateSpy = jest.spyOn(emailObserver, 'update');

      servicioEjemplo.estado = 'devuelto';
      servicioEjemplo.fechaDevolucion = new Date('2024-02-10'); // 9 días después

      await subject.notify(ServicioEventType.DEVOLUCION_TARDIA, servicioEjemplo, {
        diasRetraso: 9,
      });

      // SMS debe notificar (evento crítico)
      expect(smsUpdateSpy).toHaveBeenCalled();
      // Email también debe notificar (suscrito a todos)
      expect(emailUpdateSpy).toHaveBeenCalled();
    });
  });

  describe('Manejo de errores', () => {
    it('debe continuar notificando otros observadores si uno falla', async () => {
      // Forzar error en un observador
      jest
        .spyOn(emailObserver, 'update')
        .mockRejectedValueOnce(new Error('Error simulado'));

      const auditSpy = jest.spyOn(auditObserver, 'update');

      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
      );

      // A pesar del error en email, audit debe haber sido llamado
      expect(auditSpy).toHaveBeenCalled();
    });
  });

  describe('Metadata en eventos', () => {
    it('debe propagar metadata a los observadores', async () => {
      const metadata = {
        usuario: 'admin',
        ip: '192.168.1.100',
        accion: 'creacion_manual',
      };

      const auditSpy = jest.spyOn(auditObserver, 'update');

      await subject.notify(
        ServicioEventType.SERVICIO_CREADO,
        servicioEjemplo,
        metadata,
      );

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata,
        }),
      );
    });
  });
});