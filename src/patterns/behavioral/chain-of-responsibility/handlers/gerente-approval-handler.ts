import { Injectable } from '@nestjs/common';
import { AbstractApprovalHandler } from '../abstract-approval-handler';
import {
  IApprovalRequest,
  IApprovalResult,
  ApprovalDecision,
  AuthorityLevel,
} from '../approval-request.interface';

/**
 * Handler de aprobación a nivel Gerente
 * Puede aprobar servicios hasta $5,000,000
 */
@Injectable()
export class GerenteApprovalHandler extends AbstractApprovalHandler {
  constructor() {
    super(
      5000000, // Límite de aprobación: $5,000,000
      AuthorityLevel.GERENTE,
      'Gerente',
    );
  }

  protected async approve(
    request: IApprovalRequest,
  ): Promise<IApprovalResult> {
    console.log(
      `✅ ${this.handlerName} aprobó servicio de $${request.valorTotal}`,
    );

    // Validaciones adicionales para gerentes
    const requiresSpecialApproval = request.valorTotal > 3000000;
    const requiresInsurance = request.valorTotal > 4000000;

    let additionalNotes = '';
    if (requiresInsurance) {
      console.log(`🛡️  Servicio requiere seguro adicional`);
      additionalNotes += ' Requiere seguro adicional.';
    }
    if (requiresSpecialApproval) {
      console.log(
        `📄 Servicio requiere aprobación especial y garantías adicionales`,
      );
      additionalNotes += ' Requiere garantías adicionales.';
    }

    return this.createApprovalResult(
      ApprovalDecision.APPROVED,
      `Servicio aprobado por ${this.handlerName}. Valor: $${request.valorTotal}.${additionalNotes}`,
    );
  }
}