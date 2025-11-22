import { Module } from '@nestjs/common';
import { ApprovalChainService } from './approval-chain.service';
import {
  EmpleadoApprovalHandler,
  SupervisorApprovalHandler,
  GerenteApprovalHandler,
  DirectorApprovalHandler,
} from './handlers';

/**
 * Módulo que implementa el patrón Chain of Responsibility
 * para el procesamiento de aprobaciones de servicios
 */
@Module({
  providers: [
    ApprovalChainService,
    EmpleadoApprovalHandler,
    SupervisorApprovalHandler,
    GerenteApprovalHandler,
    DirectorApprovalHandler,
  ],
  exports: [ApprovalChainService],
})
export class ChainOfResponsibilityModule {}