import { Injectable } from '@nestjs/common';
import { AbstractApprovalHandler } from '../abstract-approval-handler';
import {
  IApprovalRequest,
  IApprovalResult,
  ApprovalDecision,
  AuthorityLevel,
} from '../approval-request.interface';

/**
 * Handler de aprobación a nivel Director
 * Tiene autoridad ilimitada para aprobar servicios
 */
@Injectable()
export class DirectorApprovalHandler extends AbstractApprovalHandler {
  constructor() {
    super(
      Number.MAX_SAFE_INTEGER, // Sin límite de aprobación
      AuthorityLevel.DIRECTOR,
      'Director',
    );
  }

  protected async approve(
    request: IApprovalRequest,
  ): Promise<IApprovalResult> {
    console.log(
      `✅ ${this.handlerName} aprobó servicio de alto valor: $${request.valorTotal}`,
    );

    // Validaciones especiales para montos muy altos
    const isVeryHighValue = request.valorTotal > 10000000;
    const requiresBoardApproval = request.valorTotal > 20000000;

    let additionalNotes = '';
    if (requiresBoardApproval) {
      console.log(
        `🏛️  Servicio de valor excepcional - Se notificará a la junta directiva`,
      );
      additionalNotes += ' Notificación a junta directiva requerida.';
    } else if (isVeryHighValue) {
      console.log(`💼 Servicio de alto valor - Seguimiento especial requerido`);
      additionalNotes += ' Seguimiento especial requerido.';
    }

    additionalNotes += ' Seguro premium obligatorio.';

    return this.createApprovalResult(
      ApprovalDecision.APPROVED,
      `Servicio aprobado por ${this.handlerName} (Autoridad máxima). Valor: $${request.valorTotal}.${additionalNotes}`,
    );
  }
}