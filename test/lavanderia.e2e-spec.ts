import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import {
  createVestidoDamaTestData,
  createLavanderiaItemTestData,
} from './helpers/test-data.helper';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Lavandería API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let prendaId: number;
  let lavanderiaItemId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Crear prenda para usar en tests de lavandería
    const prendaData = createVestidoDamaTestData();
    const prendaResponse = await request(app.getHttpServer())
      .post('/api/prendas')
      .send(prendaData);
    prendaId = prendaResponse.body.data.id;
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.query('DELETE FROM lavanderia WHERE id IS NOT NULL');
      await dataSource.query('DELETE FROM prendas WHERE referencia LIKE "%-TEST-%"');
    }

    if (app) {
      await app.close();
    }
  });

  describe('/api/lavanderia (POST) - Decorator Pattern', () => {
    it('should register prenda for lavanderia with decorator pattern', async () => {
      const lavanderiaData = createLavanderiaItemTestData(prendaId);

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(lavanderiaData)
        .expect(201);

      // Validar estructura de respuesta
      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(201);

      // Validar datos del item de lavandería
      const item = response.body.data;
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('prioridad'); // Calculada por Decorators
      expect(item.prendaId).toBe(prendaId);
      expect(item.esManchada).toBe(lavanderiaData.esManchada);
      expect(item.estado).toBe('pendiente');

      // Guardar para tests posteriores
      lavanderiaItemId = item.id;
    });

    it('should calculate priority correctly - manchada adds priority', async () => {
      const prenda2Data = createVestidoDamaTestData();
      const prenda2Response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prenda2Data);
      const prenda2Id = prenda2Response.body.data.id;

      // Item manchado (alta prioridad)
      const itemManchado = {
        prendaId: prenda2Id,
        esManchada: true,
        esDelicada: false,
        requiereUrgente: false,
        configuraciones: {
          mancha: {
            tipo: 'vino',
            gravedad: 'severa',
          },
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(itemManchado)
        .expect(201);

      const prioridadManchado = response.body.data.prioridad;

      // La prioridad debe ser mayor a 0 debido al decorator de mancha
      expect(prioridadManchado).toBeGreaterThan(0);
    });

    it('should calculate priority correctly - delicada adds priority', async () => {
      const prenda3Data = createVestidoDamaTestData();
      const prenda3Response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prenda3Data);
      const prenda3Id = prenda3Response.body.data.id;

      // Item delicado
      const itemDelicado = {
        prendaId: prenda3Id,
        esManchada: false,
        esDelicada: true,
        requiereUrgente: false,
        configuraciones: {
          delicada: {
            tipoTela: 'seda',
            cuidadosEspeciales: 'Lavado a mano',
          },
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(itemDelicado)
        .expect(201);

      const prioridadDelicada = response.body.data.prioridad;
      expect(prioridadDelicada).toBeGreaterThan(0);
    });

    it('should calculate priority correctly - urgente adds highest priority', async () => {
      const prenda4Data = createVestidoDamaTestData();
      const prenda4Response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prenda4Data);
      const prenda4Id = prenda4Response.body.data.id;

      // Item urgente (máxima prioridad)
      const itemUrgente = {
        prendaId: prenda4Id,
        esManchada: false,
        esDelicada: false,
        requiereUrgente: true,
        configuraciones: {
          urgente: {
            motivo: 'Evento importante',
            fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(itemUrgente)
        .expect(201);

      const prioridadUrgente = response.body.data.prioridad;

      // Urgente debe tener alta prioridad
      expect(prioridadUrgente).toBeGreaterThan(50);
    });

    it('should calculate combined priority - multiple decorators', async () => {
      const prenda5Data = createVestidoDamaTestData();
      const prenda5Response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prenda5Data);
      const prenda5Id = prenda5Response.body.data.id;

      // Item con múltiples características (múltiples decorators)
      const itemCombinado = {
        prendaId: prenda5Id,
        esManchada: true,
        esDelicada: true,
        requiereUrgente: true,
        configuraciones: {
          mancha: {
            tipo: 'grasa',
            gravedad: 'severa',
          },
          delicada: {
            tipoTela: 'seda',
            cuidadosEspeciales: 'Lavado especial',
          },
          urgente: {
            motivo: 'Evento VIP',
            fechaLimite: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          },
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(itemCombinado)
        .expect(201);

      const prioridadCombinada = response.body.data.prioridad;

      // La prioridad combinada debe ser muy alta
      expect(prioridadCombinada).toBeGreaterThan(80);
    });

    it('should fail with non-existent prenda', async () => {
      const invalidData = {
        prendaId: 99999,
        esManchada: false,
        esDelicada: false,
        requiereUrgente: false,
        configuraciones: {},
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        prendaId,
        // Faltan campos requeridos
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/lavanderia/cola (GET)', () => {
    it('should get cola sorted by priority DESC', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lavanderia/cola')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const items = response.body.data;

      // Validar que está ordenado por prioridad descendente
      if (items.length > 1) {
        for (let i = 0; i < items.length - 1; i++) {
          expect(items[i].prioridad).toBeGreaterThanOrEqual(items[i + 1].prioridad);
        }
      }
    });

    it('should filter cola by estado pendiente only', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lavanderia/cola')
        .expect(200);

      expect(response.body.success).toBe(true);
      const items = response.body.data;

      // Todos los items deben estar pendientes
      expect(items.every((item: any) => item.estado === 'pendiente')).toBe(true);
    });
  });

  describe('/api/lavanderia (GET)', () => {
    it('should get all lavanderia items with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lavanderia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lavanderia?page=1&limit=5')
        .expect(200);

      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(5);
    });

    it('should filter by estado', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lavanderia?estado=pendiente')
        .expect(200);

      expect(response.body.success).toBe(true);
      const items = response.body.data;

      if (items.length > 0) {
        expect(items.every((item: any) => item.estado === 'pendiente')).toBe(true);
      }
    });
  });

  describe('/api/lavanderia/:id (GET)', () => {
    it('should get lavanderia item by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/lavanderia/${lavanderiaItemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(lavanderiaItemId);
      expect(response.body.data).toHaveProperty('prenda');
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lavanderia/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/lavanderia/enviar-lote (POST)', () => {
    it('should send batch to lavanderia successfully', async () => {
      // Crear varios items primero
      const items = [];
      for (let i = 0; i < 3; i++) {
        const prendaData = createVestidoDamaTestData();
        const prendaResponse = await request(app.getHttpServer())
          .post('/api/prendas')
          .send(prendaData);

        const lavanderiaData = createLavanderiaItemTestData(prendaResponse.body.data.id);
        const itemResponse = await request(app.getHttpServer())
          .post('/api/lavanderia')
          .send(lavanderiaData);

        items.push(itemResponse.body.data.id);
      }

      // Enviar lote
      const loteData = {
        itemsIds: items,
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia/enviar-lote')
        .send(loteData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('loteId');
      expect(response.body.data).toHaveProperty('cantidadItems');
      expect(response.body.data.cantidadItems).toBe(3);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toHaveLength(3);
    });

    it('should fail with empty items array', async () => {
      const invalidData = {
        itemsIds: [],
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia/enviar-lote')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent item ids', async () => {
      const invalidData = {
        itemsIds: [99999, 99998],
      };

      const response = await request(app.getHttpServer())
        .post('/api/lavanderia/enviar-lote')
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/lavanderia/estadisticas (GET)', () => {
    it('should get lavanderia statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/lavanderia/estadisticas')
        .expect(200);

      expect(response.body.success).toBe(true);
      const stats = response.body.data;

      expect(stats).toHaveProperty('totalItems');
      expect(stats).toHaveProperty('itemsPendientes');
      expect(stats).toHaveProperty('itemsEnProceso');
      expect(stats).toHaveProperty('itemsCompletados');
      expect(stats).toHaveProperty('prioridadPromedio');

      expect(typeof stats.totalItems).toBe('number');
      expect(stats.totalItems).toBeGreaterThan(0);
    });
  });

  describe('Decorator Pattern Validation', () => {
    it('should validate priority calculation with different combinations', async () => {
      // Crear items con diferentes características
      const testCases = [
        {
          name: 'Solo manchada',
          data: {
            esManchada: true,
            esDelicada: false,
            requiereUrgente: false,
            configuraciones: {
              mancha: { tipo: 'grasa', gravedad: 'media' },
            },
          },
          expectedPriorityRange: { min: 10, max: 40 },
        },
        {
          name: 'Solo delicada',
          data: {
            esManchada: false,
            esDelicada: true,
            requiereUrgente: false,
            configuraciones: {
              delicada: { tipoTela: 'seda', cuidadosEspeciales: 'Especial' },
            },
          },
          expectedPriorityRange: { min: 10, max: 40 },
        },
        {
          name: 'Manchada + Delicada',
          data: {
            esManchada: true,
            esDelicada: true,
            requiereUrgente: false,
            configuraciones: {
              mancha: { tipo: 'vino', gravedad: 'media' },
              delicada: { tipoTela: 'seda', cuidadosEspeciales: 'Especial' },
            },
          },
          expectedPriorityRange: { min: 20, max: 60 },
        },
      ];

      for (const testCase of testCases) {
        const prendaData = createVestidoDamaTestData();
        const prendaResponse = await request(app.getHttpServer())
          .post('/api/prendas')
          .send(prendaData);

        const itemData = {
          prendaId: prendaResponse.body.data.id,
          ...testCase.data,
        };

        const response = await request(app.getHttpServer())
          .post('/api/lavanderia')
          .send(itemData)
          .expect(201);

        const prioridad = response.body.data.prioridad;
        expect(prioridad).toBeGreaterThanOrEqual(testCase.expectedPriorityRange.min);
        expect(prioridad).toBeLessThanOrEqual(testCase.expectedPriorityRange.max);
      }
    });

    it('should validate that decorators are applied in correct order', async () => {
      // Crear dos items idénticos para verificar consistencia
      const prendaData1 = createVestidoDamaTestData();
      const prenda1Response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prendaData1);

      const prendaData2 = createVestidoDamaTestData();
      const prenda2Response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prendaData2);

      const itemData = {
        esManchada: true,
        esDelicada: true,
        requiereUrgente: false,
        configuraciones: {
          mancha: { tipo: 'vino', gravedad: 'media' },
          delicada: { tipoTela: 'seda', cuidadosEspeciales: 'Especial' },
        },
      };

      const response1 = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send({ ...itemData, prendaId: prenda1Response.body.data.id })
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send({ ...itemData, prendaId: prenda2Response.body.data.id })
        .expect(201);

      // Las prioridades deben ser iguales para configuraciones idénticas
      expect(response1.body.data.prioridad).toBe(response2.body.data.prioridad);
    });

    it('should validate urgente decorator adds maximum priority boost', async () => {
      const prendaBase = createVestidoDamaTestData();
      const prendaBaseResponse = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prendaBase);

      const prendaUrgente = createVestidoDamaTestData();
      const prendaUrgenteResponse = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prendaUrgente);

      // Item sin urgente
      const itemBase = {
        prendaId: prendaBaseResponse.body.data.id,
        esManchada: true,
        esDelicada: false,
        requiereUrgente: false,
        configuraciones: {
          mancha: { tipo: 'vino', gravedad: 'media' },
        },
      };

      const responseBase = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(itemBase)
        .expect(201);

      // Item con urgente
      const itemUrgente = {
        prendaId: prendaUrgenteResponse.body.data.id,
        esManchada: true,
        esDelicada: false,
        requiereUrgente: true,
        configuraciones: {
          mancha: { tipo: 'vino', gravedad: 'media' },
          urgente: {
            motivo: 'Evento importante',
            fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      };

      const responseUrgente = await request(app.getHttpServer())
        .post('/api/lavanderia')
        .send(itemUrgente)
        .expect(201);

      // El urgente debe tener prioridad significativamente mayor
      const prioridadBase = responseBase.body.data.prioridad;
      const prioridadUrgente = responseUrgente.body.data.prioridad;

      expect(prioridadUrgente).toBeGreaterThan(prioridadBase);
      expect(prioridadUrgente - prioridadBase).toBeGreaterThanOrEqual(50);
    });
  });
});