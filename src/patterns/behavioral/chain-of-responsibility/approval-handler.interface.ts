import { IApprovalRequest, IApprovalResult } from './approval-request.interface';

/**
 * Interfaz base para handlers de aprobación
 * Define el contrato que todos los handlers deben cumplir
 */
export interface IApprovalHandler {
  /**
   * Establece el siguiente handler en la cadena
   */
  setNext(handler: IApprovalHandler): IApprovalHandler;

  /**
   * Procesa una solicitud de aprobación
   * Si el handler puede aprobar, lo hace; si no, pasa al siguiente
   */
  handle(request: IApprovalRequest): Promise<IApprovalResult>;

  /**
   * Obtiene el nivel de autoridad del handler
   */
  getAuthorityLevel(): string;

  /**
   * Obtiene el límite de aprobación del handler
   */
  getApprovalLimit(): number;
}