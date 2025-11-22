import { IApprovalHandler } from './approval-handler.interface';
import {
  IApprovalRequest,
  IApprovalResult,
  ApprovalDecision,
  AuthorityLevel,
} from './approval-request.interface';

/**
 * Clase abstracta base para handlers de aprobación
 * Implementa la lógica común de la cadena de responsabilidad
 */
export abstract class AbstractApprovalHandler implements IApprovalHandler {
  protected nextHandler: IApprovalHandler | null = null;
  protected readonly approvalLimit: number;
  protected readonly authorityLevel: AuthorityLevel;
  protected readonly handlerName: string;

  constructor(
    approvalLimit: number,
    authorityLevel: AuthorityLevel,
    handlerName: string,
  ) {
    this.approvalLimit = approvalLimit;
    this.authorityLevel = authorityLevel;
    this.handlerName = handlerName;
  }

  /**
   * Establece el siguiente handler en la cadena
   */
  setNext(handler: IApprovalHandler): IApprovalHandler {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Método principal para manejar solicitudes
   * Implementa la lógica de decisión de la cadena
   */
  async handle(request: IApprovalRequest): Promise<IApprovalResult> {
    console.log(
      `📋 ${this.handlerName} evaluando solicitud de $${request.valorTotal}`,
    );

    // Verificar si este handler puede aprobar la solicitud
    if (this.canApprove(request)) {
      return await this.approve(request);
    }

    // Si no puede aprobar, escalar al siguiente nivel
    if (this.nextHandler) {
      console.log(
        `⬆️  ${this.handlerName} escalando al siguiente nivel (límite: $${this.approvalLimit})`,
      );
      return await this.nextHandler.handle(request);
    }

    // Si no hay siguiente handler, rechazar
    return this.reject(request, 'No hay autoridad suficiente para aprobar');
  }

  /**
   * Verifica si este handler puede aprobar la solicitud
   */
  protected canApprove(request: IApprovalRequest): boolean {
    return request.valorTotal <= this.approvalLimit;
  }

  /**
   * Método abstracto para aprobar - debe ser implementado por subclases
   */
  protected abstract approve(
    request: IApprovalRequest,
  ): Promise<IApprovalResult>;

  /**
   * Método para rechazar una solicitud
   */
  protected reject(request: IApprovalRequest, reason: string): IApprovalResult {
    console.log(`❌ ${this.handlerName} rechazó la solicitud: ${reason}`);

    return {
      decision: ApprovalDecision.REJECTED,
      approver: this.handlerName,
      authorityLevel: this.authorityLevel,
      message: reason,
      timestamp: new Date(),
    };
  }

  /**
   * Obtiene el nivel de autoridad del handler
   */
  getAuthorityLevel(): string {
    return this.authorityLevel;
  }

  /**
   * Obtiene el límite de aprobación del handler
   */
  getApprovalLimit(): number {
    return this.approvalLimit;
  }

  /**
   * Método helper para crear un resultado de aprobación
   */
  protected createApprovalResult(
    decision: ApprovalDecision,
    message: string,
  ): IApprovalResult {
    return {
      decision,
      approver: this.handlerName,
      authorityLevel: this.authorityLevel,
      message,
      timestamp: new Date(),
    };
  }
}