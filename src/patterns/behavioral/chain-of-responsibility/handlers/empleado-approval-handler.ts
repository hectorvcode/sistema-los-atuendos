import { Injectable } from '@nestjs/common';
import { AbstractApprovalHandler } from '../abstract-approval-handler';
import {
  IApprovalRequest,
  IApprovalResult,
  ApprovalDecision,
  AuthorityLevel,
} from '../approval-request.interface';

/**
 * Handler de aprobación a nivel Empleado
 * Puede aprobar servicios hasta $500,000
 */
@Injectable()
export class EmpleadoApprovalHandler extends AbstractApprovalHandler {
  constructor() {
    super(
      500000, // Límite de aprobación: $500,000
      AuthorityLevel.EMPLEADO,
      'Empleado',
    );
  }

  protected async approve(
    request: IApprovalRequest,
  ): Promise<IApprovalResult> {
    console.log(
      `✅ ${this.handlerName} aprobó servicio de $${request.valorTotal}`,
    );

    return this.createApprovalResult(
      ApprovalDecision.APPROVED,
      `Servicio aprobado por ${this.handlerName}. Valor: $${request.valorTotal}`,
    );
  }
}