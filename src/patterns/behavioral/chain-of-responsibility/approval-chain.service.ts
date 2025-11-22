import { Injectable } from '@nestjs/common';
import {
  EmpleadoApprovalHandler,
  SupervisorApprovalHandler,
  GerenteApprovalHandler,
  DirectorApprovalHandler,
} from './handlers';
import { IApprovalHandler } from './approval-handler.interface';
import {
  IApprovalRequest,
  IApprovalResult,
  AuthorityLevel,
} from './approval-request.interface';
import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Servicio que gestiona la cadena de aprobación
 * Implementa el patrón Chain of Responsibility
 */
@Injectable()
export class ApprovalChainService {
  private chainHead: IApprovalHandler;
  private handlers: Map<AuthorityLevel, IApprovalHandler>;

  constructor(
    private readonly empleadoHandler: EmpleadoApprovalHandler,
    private readonly supervisorHandler: SupervisorApprovalHandler,
    private readonly gerenteHandler: GerenteApprovalHandler,
    private readonly directorHandler: DirectorApprovalHandler,
  ) {
    this.handlers = new Map();
    this.setupChain();
  }

  /**
   * Configura la cadena de responsabilidad
   * Empleado -> Supervisor -> Gerente -> Director
   */
  private setupChain(): void {
    console.log('🔗 Configurando cadena de aprobación...');

    // Establecer la cadena
    this.empleadoHandler
      .setNext(this.supervisorHandler)
      .setNext(this.gerenteHandler)
      .setNext(this.directorHandler);

    // El primer handler es el empleado
    this.chainHead = this.empleadoHandler;

    // Guardar referencias a los handlers
    this.handlers.set(AuthorityLevel.EMPLEADO, this.empleadoHandler);
    this.handlers.set(AuthorityLevel.SUPERVISOR, this.supervisorHandler);
    this.handlers.set(AuthorityLevel.GERENTE, this.gerenteHandler);
    this.handlers.set(AuthorityLevel.DIRECTOR, this.directorHandler);

    console.log('✅ Cadena de aprobación configurada correctamente');
    console.log(
      `   Empleado (hasta $${this.empleadoHandler.getApprovalLimit()})`,
    );
    console.log(
      `   -> Supervisor (hasta $${this.supervisorHandler.getApprovalLimit()})`,
    );
    console.log(
      `   -> Gerente (hasta $${this.gerenteHandler.getApprovalLimit()})`,
    );
    console.log(`   -> Director (sin límite)`);
  }

  /**
   * Procesa una solicitud de aprobación para un servicio
   * @param servicio - Servicio a aprobar
   * @param requester - Nombre del solicitante
   * @param motivo - Motivo opcional de la solicitud
   */
  async processApproval(
    servicio: ServicioAlquiler,
    requester: string,
    motivo?: string,
  ): Promise<IApprovalResult> {
    const request: IApprovalRequest = {
      servicio,
      valorTotal: servicio.valorTotal,
      requester,
      timestamp: new Date(),
      motivo,
    };

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Iniciando proceso de aprobación');
    console.log(`   Servicio #${servicio.numero}`);
    console.log(`   Valor total: $${servicio.valorTotal}`);
    console.log(`   Solicitante: ${requester}`);
    if (motivo) {
      console.log(`   Motivo: ${motivo}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Procesar através de la cadena
    const result = await this.chainHead.handle(request);

    console.log('');
    console.log('📊 Resultado de aprobación:');
    console.log(`   Decisión: ${result.decision}`);
    console.log(`   Aprobador: ${result.approver}`);
    console.log(`   Nivel: ${result.authorityLevel}`);
    console.log(`   Mensaje: ${result.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return result;
  }

  /**
   * Procesa una aprobación desde un nivel específico de autoridad
   * Útil cuando se quiere saltar niveles inferiores
   */
  async processApprovalFromLevel(
    servicio: ServicioAlquiler,
    requester: string,
    startLevel: AuthorityLevel,
    motivo?: string,
  ): Promise<IApprovalResult> {
    const handler = this.handlers.get(startLevel);

    if (!handler) {
      throw new Error(`Nivel de autoridad no válido: ${startLevel}`);
    }

    const request: IApprovalRequest = {
      servicio,
      valorTotal: servicio.valorTotal,
      requester,
      timestamp: new Date(),
      motivo,
    };

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(
      `🎯 Iniciando proceso de aprobación desde nivel: ${startLevel}`,
    );
    console.log(`   Servicio #${servicio.numero}`);
    console.log(`   Valor total: $${servicio.valorTotal}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return await handler.handle(request);
  }

  /**
   * Obtiene información sobre los límites de aprobación
   */
  getApprovalLimits(): Record<AuthorityLevel, number> {
    return {
      [AuthorityLevel.EMPLEADO]: this.empleadoHandler.getApprovalLimit(),
      [AuthorityLevel.SUPERVISOR]: this.supervisorHandler.getApprovalLimit(),
      [AuthorityLevel.GERENTE]: this.gerenteHandler.getApprovalLimit(),
      [AuthorityLevel.DIRECTOR]: this.directorHandler.getApprovalLimit(),
    };
  }

  /**
   * Determina qué nivel de autoridad es necesario para un monto
   */
  getRequiredAuthorityLevel(amount: number): AuthorityLevel {
    if (amount <= this.empleadoHandler.getApprovalLimit()) {
      return AuthorityLevel.EMPLEADO;
    }
    if (amount <= this.supervisorHandler.getApprovalLimit()) {
      return AuthorityLevel.SUPERVISOR;
    }
    if (amount <= this.gerenteHandler.getApprovalLimit()) {
      return AuthorityLevel.GERENTE;
    }
    return AuthorityLevel.DIRECTOR;
  }
}