import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalChainService } from '../approval-chain.service';
import {
  EmpleadoApprovalHandler,
  SupervisorApprovalHandler,
  GerenteApprovalHandler,
  DirectorApprovalHandler,
} from '../handlers';
import {
  ApprovalDecision,
  AuthorityLevel,
} from '../approval-request.interface';
import { ServicioAlquiler } from '../../../../modules/servicios/entities/servicio-alquiler.entity';

describe('Chain of Responsibility Pattern', () => {
  let approvalChain: ApprovalChainService;
  let empleadoHandler: EmpleadoApprovalHandler;
  let supervisorHandler: SupervisorApprovalHandler;
  let gerenteHandler: GerenteApprovalHandler;
  let directorHandler: DirectorApprovalHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalChainService,
        EmpleadoApprovalHandler,
        SupervisorApprovalHandler,
        GerenteApprovalHandler,
        DirectorApprovalHandler,
      ],
    }).compile();

    approvalChain = module.get<ApprovalChainService>(ApprovalChainService);
    empleadoHandler = module.get<EmpleadoApprovalHandler>(
      EmpleadoApprovalHandler,
    );
    supervisorHandler = module.get<SupervisorApprovalHandler>(
      SupervisorApprovalHandler,
    );
    gerenteHandler = module.get<GerenteApprovalHandler>(GerenteApprovalHandler);
    directorHandler = module.get<DirectorApprovalHandler>(
      DirectorApprovalHandler,
    );
  });

  it('debe estar definido', () => {
    expect(approvalChain).toBeDefined();
    expect(empleadoHandler).toBeDefined();
    expect(supervisorHandler).toBeDefined();
    expect(gerenteHandler).toBeDefined();
    expect(directorHandler).toBeDefined();
  });

  describe('Límites de Aprobación', () => {
    it('debe retornar los límites correctos de cada handler', () => {
      const limits = approvalChain.getApprovalLimits();

      expect(limits[AuthorityLevel.EMPLEADO]).toBe(500000);
      expect(limits[AuthorityLevel.SUPERVISOR]).toBe(2000000);
      expect(limits[AuthorityLevel.GERENTE]).toBe(5000000);
      expect(limits[AuthorityLevel.DIRECTOR]).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('debe determinar el nivel de autoridad requerido correctamente', () => {
      expect(approvalChain.getRequiredAuthorityLevel(300000)).toBe(
        AuthorityLevel.EMPLEADO,
      );
      expect(approvalChain.getRequiredAuthorityLevel(1000000)).toBe(
        AuthorityLevel.SUPERVISOR,
      );
      expect(approvalChain.getRequiredAuthorityLevel(3000000)).toBe(
        AuthorityLevel.GERENTE,
      );
      expect(approvalChain.getRequiredAuthorityLevel(10000000)).toBe(
        AuthorityLevel.DIRECTOR,
      );
    });
  });

  describe('Proceso de Aprobación', () => {
    it('debe aprobar servicio de $300,000 con Empleado', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1001;
      servicio.valorTotal = 300000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.authorityLevel).toBe(AuthorityLevel.EMPLEADO);
      expect(result.approver).toBe('Empleado');
    });

    it('debe escalar servicio de $800,000 a Supervisor', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1002;
      servicio.valorTotal = 800000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.authorityLevel).toBe(AuthorityLevel.SUPERVISOR);
      expect(result.approver).toBe('Supervisor');
    });

    it('debe escalar servicio de $3,000,000 a Gerente', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1003;
      servicio.valorTotal = 3000000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.authorityLevel).toBe(AuthorityLevel.GERENTE);
      expect(result.approver).toBe('Gerente');
    });

    it('debe escalar servicio de $10,000,000 a Director', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1004;
      servicio.valorTotal = 10000000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.authorityLevel).toBe(AuthorityLevel.DIRECTOR);
      expect(result.approver).toBe('Director');
    });
  });

  describe('Aprobación desde nivel específico', () => {
    it('debe permitir iniciar desde nivel Supervisor', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1005;
      servicio.valorTotal = 1500000;

      const result = await approvalChain.processApprovalFromLevel(
        servicio,
        'Test User',
        AuthorityLevel.SUPERVISOR,
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.authorityLevel).toBe(AuthorityLevel.SUPERVISOR);
    });

    it('debe escalar desde Supervisor a Gerente si excede el límite', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1006;
      servicio.valorTotal = 2500000;

      const result = await approvalChain.processApprovalFromLevel(
        servicio,
        'Test User',
        AuthorityLevel.SUPERVISOR,
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.authorityLevel).toBe(AuthorityLevel.GERENTE);
    });
  });

  describe('Validaciones especiales', () => {
    it('debe incluir nota de documentación adicional para supervisores con valores altos', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1007;
      servicio.valorTotal = 1800000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.message).toContain('documentación adicional');
    });

    it('debe incluir notas de seguro y garantías para gerentes con valores altos', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1008;
      servicio.valorTotal = 4500000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.message).toContain('seguro adicional');
      expect(result.message).toContain('garantías adicionales');
    });

    it('debe incluir nota de junta directiva para directores con valores muy altos', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 1009;
      servicio.valorTotal = 25000000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
      expect(result.message).toContain('junta directiva');
    });
  });

  describe('Handlers Individuales', () => {
    it('EmpleadoHandler debe tener límite correcto', () => {
      expect(empleadoHandler.getApprovalLimit()).toBe(500000);
      expect(empleadoHandler.getAuthorityLevel()).toBe(AuthorityLevel.EMPLEADO);
    });

    it('SupervisorHandler debe tener límite correcto', () => {
      expect(supervisorHandler.getApprovalLimit()).toBe(2000000);
      expect(supervisorHandler.getAuthorityLevel()).toBe(
        AuthorityLevel.SUPERVISOR,
      );
    });

    it('GerenteHandler debe tener límite correcto', () => {
      expect(gerenteHandler.getApprovalLimit()).toBe(5000000);
      expect(gerenteHandler.getAuthorityLevel()).toBe(AuthorityLevel.GERENTE);
    });

    it('DirectorHandler debe tener autoridad ilimitada', () => {
      expect(directorHandler.getApprovalLimit()).toBe(
        Number.MAX_SAFE_INTEGER,
      );
      expect(directorHandler.getAuthorityLevel()).toBe(
        AuthorityLevel.DIRECTOR,
      );
    });
  });

  describe('Flujo completo de la cadena', () => {
    it('debe procesar correctamente servicios de diferentes valores en secuencia', async () => {
      // Servicio 1: Empleado
      const servicio1 = new ServicioAlquiler();
      servicio1.numero = 2001;
      servicio1.valorTotal = 400000;
      const result1 = await approvalChain.processApproval(
        servicio1,
        'Test User 1',
      );
      expect(result1.authorityLevel).toBe(AuthorityLevel.EMPLEADO);

      // Servicio 2: Supervisor
      const servicio2 = new ServicioAlquiler();
      servicio2.numero = 2002;
      servicio2.valorTotal = 1200000;
      const result2 = await approvalChain.processApproval(
        servicio2,
        'Test User 2',
      );
      expect(result2.authorityLevel).toBe(AuthorityLevel.SUPERVISOR);

      // Servicio 3: Gerente
      const servicio3 = new ServicioAlquiler();
      servicio3.numero = 2003;
      servicio3.valorTotal = 3500000;
      const result3 = await approvalChain.processApproval(
        servicio3,
        'Test User 3',
      );
      expect(result3.authorityLevel).toBe(AuthorityLevel.GERENTE);

      // Servicio 4: Director
      const servicio4 = new ServicioAlquiler();
      servicio4.numero = 2004;
      servicio4.valorTotal = 8000000;
      const result4 = await approvalChain.processApproval(
        servicio4,
        'Test User 4',
      );
      expect(result4.authorityLevel).toBe(AuthorityLevel.DIRECTOR);
    });
  });

  describe('Metadata de solicitudes', () => {
    it('debe incluir timestamp en el resultado', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 3001;
      servicio.valorTotal = 250000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
      );

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('debe procesar solicitud con motivo', async () => {
      const servicio = new ServicioAlquiler();
      servicio.numero = 3002;
      servicio.valorTotal = 450000;

      const result = await approvalChain.processApproval(
        servicio,
        'Test User',
        'Evento especial corporativo',
      );

      expect(result.decision).toBe(ApprovalDecision.APPROVED);
    });
  });
});