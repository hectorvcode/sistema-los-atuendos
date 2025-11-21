import { Injectable, Logger } from '@nestjs/common';
import { IServicioObserver } from '../servicio-observer.interface';
import { ServicioEvent, ServicioEventType } from '../servicio-event.interface';

/**
 * Registro de auditoría
 */
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: ServicioEventType;
  servicioNumero: string;
  servicioId: number;
  estadoAnterior?: string;
  estadoNuevo?: string;
  metadata?: Record<string, any>;
}

/**
 * Observador para registro de auditoría
 * Registra todos los eventos del sistema para auditoría y trazabilidad
 */
@Injectable()
export class AuditLogObserver implements IServicioObserver {
  private readonly logger = new Logger(AuditLogObserver.name);
  private auditLogs: AuditLogEntry[] = [];

  getNombre(): string {
    return 'AuditLogObserver';
  }

  getEventosSuscritos(): ServicioEventType[] {
    // Suscrito a TODOS los eventos (retorna array vacío)
    return [];
  }

  async update(event: ServicioEvent): Promise<void> {
    const { tipo, servicio, timestamp, metadata } = event;

    const logEntry: AuditLogEntry = {
      id: this.generarId(),
      timestamp,
      eventType: tipo,
      servicioNumero: servicio.numero.toString(),
      servicioId: servicio.id,
      estadoNuevo: servicio.estado,
      metadata,
    };

    // Guardar en memoria (en producción, guardar en BD)
    this.auditLogs.push(logEntry);

    this.logger.log(
      `📋 Registro de auditoría: ${tipo} - Servicio #${servicio.numero} [${timestamp.toISOString()}]`,
    );

    // TODO: Persistir en base de datos
    await this.persistirAuditoria(logEntry);
  }

  /**
   * Genera un ID único para el registro de auditoría
   */
  private generarId(): string {
    return `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persiste el registro de auditoría (simula BD)
   */
  private async persistirAuditoria(logEntry: AuditLogEntry): Promise<void> {
    // En producción, guardar en tabla de auditoría
    this.logger.debug(`Persistiendo auditoría: ${logEntry.id}`);
    // Simular escritura en BD
    return new Promise((resolve) => setTimeout(resolve, 50));
  }

  /**
   * Obtiene los logs de auditoría (para debugging/testing)
   */
  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  /**
   * Obtiene logs de un servicio específico
   */
  getLogsPorServicio(servicioId: number): AuditLogEntry[] {
    return this.auditLogs.filter((log) => log.servicioId === servicioId);
  }

  /**
   * Limpia los logs (solo para testing)
   */
  clearLogs(): void {
    this.auditLogs = [];
  }
}