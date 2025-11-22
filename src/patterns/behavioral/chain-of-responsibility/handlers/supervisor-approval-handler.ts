import { Injectable } from '@nestjs/common';
import { AbstractApprovalHandler } from '../abstract-approval-handler';
import {
  IApprovalRequest,
  IApprovalResult,
  ApprovalDecision,
  AuthorityLevel,
} from '../approval-request.interface';

/**
 * Handler de aprobación a nivel Supervisor
 * Puede aprobar servicios hasta $2,000,000
 */
@Injectable()
export class SupervisorApprovalHandler extends AbstractApprovalHandler {
  constructor() {
    super(
      2000000, // Límite de aprobación: $2,000,000
      AuthorityLevel.SUPERVISOR,
      'Supervisor',
    );
  }

  protected async approve(
    request: IApprovalRequest,
  ): Promise<IApprovalResult> {
    console.log(
      `✅ ${this.handlerName} aprobó servicio de $${request.valorTotal}`,
    );

    // Validación adicional para supervisores
    if (request.valorTotal > 1500000) {
      console.log(
        `⚠️  Servicio de alto valor ($${request.valorTotal}) - Requiere documentación adicional`,
      );
    }

    return this.createApprovalResult(
      ApprovalDecision.APPROVED,
      `Servicio aprobado por ${this.handlerName}. Valor: $${request.valorTotal}. ` +
        (request.valorTotal > 1500000
          ? 'Requiere documentación adicional.'
          : ''),
    );
  }
}