import { ServicioAlquiler } from '../../../modules/servicios/entities/servicio-alquiler.entity';

/**
 * Tipos de decisión de aprobación
 */
export enum ApprovalDecision {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
  ESCALATED = 'escalated',
}

/**
 * Niveles de autoridad para aprobación
 */
export enum AuthorityLevel {
  EMPLEADO = 'empleado',
  SUPERVISOR = 'supervisor',
  GERENTE = 'gerente',
  DIRECTOR = 'director',
}

/**
 * Interfaz para solicitud de aprobación
 */
export interface IApprovalRequest {
  servicio: ServicioAlquiler;
  valorTotal: number;
  requester: string;
  timestamp: Date;
  motivo?: string;
}

/**
 * Interfaz para resultado de aprobación
 */
export interface IApprovalResult {
  decision: ApprovalDecision;
  approver: string;
  authorityLevel: AuthorityLevel;
  message: string;
  timestamp: Date;
  requiredLevel?: AuthorityLevel;
}