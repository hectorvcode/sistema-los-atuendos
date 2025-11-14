import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import {
  createClienteTestData,
  createEmpleadoTestData,
  createVestidoDamaTestData,
  createServicioAlquilerTestData,
  generateFechaFutura,
} from './helpers/test-data.helper';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Servicios de Alquiler API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let clienteId: number;
  let empleadoId: number;
  let prendaId: number;
  let servicioId: number;
  let servicioNumero: string;

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

    // Crear datos necesarios para los tests
    // 1. Crear Cliente
    const clienteData = createClienteTestData();
    const clienteResponse = await request(app.getHttpServer())
      .post('/api/clientes')
      .send(clienteData);
    clienteId = clienteResponse.body.data.id;

    // 2. Crear Empleado
    const empleadoData = createEmpleadoTestData();
    const empleadoResponse = await request(app.getHttpServer())
      .post('/api/empleados')
      .send(empleadoData);
    empleadoId = empleadoResponse.body.data.id;

    // 3. Crear Prenda
    const prendaData = createVestidoDamaTestData();
    const prendaResponse = await request(app.getHttpServer())
      .post('/api/prendas')
      .send(prendaData);
    prendaId = prendaResponse.body.data.id;
  });

  afterAll(async () => {
    if (dataSource) {
      // Limpiar en orden inverso debido a foreign keys
      await dataSource.query('DELETE FROM servicios_prendas WHERE servicio_id IN (SELECT id FROM servicios WHERE observaciones LIKE "%testing%")');
      await dataSource.query('DELETE FROM servicios WHERE observaciones LIKE "%testing%"');
      await dataSource.query('DELETE FROM prendas WHERE referencia LIKE "%-TEST-%"');
      await dataSource.query('DELETE FROM clientes WHERE email LIKE "%@test.com"');
      await dataSource.query('DELETE FROM empleados WHERE email LIKE "%@test.com"');
    }

    if (app) {
      await app.close();
    }
  });

  describe('/api/servicios (POST) - Builder Pattern', () => {
    it('should create servicio using Builder Pattern successfully', async () => {
      const servicioData = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [prendaId],
      );

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(servicioData)
        .expect(201);

      // Validar estructura de respuesta
      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(201);

      // Validar datos del servicio creado
      const servicio = response.body.data;
      expect(servicio).toHaveProperty('id');
      expect(servicio).toHaveProperty('numeroServicio'); // Generado por Singleton
      expect(servicio.clienteId).toBe(clienteId);
      expect(servicio.empleadoId).toBe(empleadoId);
      expect(servicio.diasAlquiler).toBe(servicioData.diasAlquiler);
      expect(servicio.estado).toBe('activo');

      // Guardar para tests posteriores
      servicioId = servicio.id;
      servicioNumero = servicio.numeroServicio;
    });

    it('should validate Singleton Pattern - consecutive numbers', async () => {
      // Crear múltiples servicios y verificar que los números son consecutivos
      const servicioData = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [prendaId],
      );

      const response1 = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(servicioData)
        .expect(201);

      const numero1 = response1.body.data.numeroServicio;

      // Crear segundo servicio
      const response2 = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(servicioData)
        .expect(201);

      const numero2 = response2.body.data.numeroServicio;

      // Validar que los números son diferentes y consecutivos
      expect(numero1).not.toBe(numero2);

      // Extraer el número del formato (ej: "ALQ-0001" -> 1)
      const num1 = parseInt(numero1.split('-')[1]);
      const num2 = parseInt(numero2.split('-')[1]);
      expect(num2).toBe(num1 + 1);
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        clienteId,
        // Falta empleadoId, prendas, fecha
      };

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent cliente', async () => {
      const invalidData = createServicioAlquilerTestData(
        99999, // Cliente inexistente
        empleadoId,
        [prendaId],
      );

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent empleado', async () => {
      const invalidData = createServicioAlquilerTestData(
        clienteId,
        99999, // Empleado inexistente
        [prendaId],
      );

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent prenda', async () => {
      const invalidData = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [99999], // Prenda inexistente
      );

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail with date in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invalidData = {
        clienteId,
        empleadoId,
        prendasIds: [prendaId],
        fechaAlquiler: pastDate.toISOString().split('T')[0],
        diasAlquiler: 3,
        observaciones: 'Test con fecha pasada',
      };

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('pasado');
    });

    it('should fail with invalid diasAlquiler', async () => {
      const invalidData = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [prendaId],
      );
      invalidData.diasAlquiler = 0; // Debe ser al menos 1

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate valorTotal correctly', async () => {
      // Obtener valor de la prenda
      const prendaResponse = await request(app.getHttpServer())
        .get(`/api/prendas/${prendaId}`);

      const valorPrenda = prendaResponse.body.data.valorAlquiler;
      const diasAlquiler = 3;

      const servicioData = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [prendaId],
      );
      servicioData.diasAlquiler = diasAlquiler;

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(servicioData)
        .expect(201);

      const valorEsperado = valorPrenda * diasAlquiler;
      expect(response.body.data.valorTotal).toBe(valorEsperado);
    });
  });

  describe('/api/servicios (GET)', () => {
    it('should get all servicios with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/servicios')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
    });

    it('should filter by estado', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/servicios?estado=activo')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data.every((s: any) => s.estado === 'activo')).toBe(true);
      }
    });
  });

  describe('/api/servicios/:id (GET)', () => {
    it('should get servicio by id with relations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/servicios/${servicioId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const servicio = response.body.data;
      expect(servicio.id).toBe(servicioId);

      // Validar relaciones cargadas
      expect(servicio).toHaveProperty('cliente');
      expect(servicio).toHaveProperty('empleado');
      expect(servicio).toHaveProperty('prendas');
      expect(servicio.prendas).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/servicios/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/servicios/numero/:numero (GET)', () => {
    it('should find servicio by numero', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/servicios/numero/${servicioNumero}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.numeroServicio).toBe(servicioNumero);
      expect(response.body.data.id).toBe(servicioId);
    });

    it('should return 404 for non-existent numero', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/servicios/numero/ALQ-99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/servicios/estadisticas (GET)', () => {
    it('should get servicios statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/servicios/estadisticas')
        .expect(200);

      expect(response.body.success).toBe(true);
      const stats = response.body.data;

      expect(stats).toHaveProperty('totalServicios');
      expect(stats).toHaveProperty('serviciosActivos');
      expect(stats).toHaveProperty('serviciosCompletados');
      expect(stats).toHaveProperty('valorTotalServicios');
      expect(stats).toHaveProperty('promedioValorServicio');

      expect(typeof stats.totalServicios).toBe('number');
      expect(stats.totalServicios).toBeGreaterThan(0);
    });
  });

  describe('Builder Pattern Validation', () => {
    it('should validate complex servicio creation with multiple prendas', async () => {
      // Crear más prendas
      const prenda2Data = createVestidoDamaTestData();
      const prenda2Response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prenda2Data);
      const prenda2Id = prenda2Response.body.data.id;

      const servicioData = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [prendaId, prenda2Id], // Múltiples prendas
      );

      const response = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(servicioData)
        .expect(201);

      const servicio = response.body.data;
      expect(servicio.prendas).toHaveLength(2);

      // Validar que el valor total considera ambas prendas
      const prenda1Response = await request(app.getHttpServer())
        .get(`/api/prendas/${prendaId}`);
      const prenda2ResponseGet = await request(app.getHttpServer())
        .get(`/api/prendas/${prenda2Id}`);

      const valorEsperado =
        (prenda1Response.body.data.valorAlquiler + prenda2ResponseGet.body.data.valorAlquiler)
        * servicioData.diasAlquiler;

      expect(servicio.valorTotal).toBe(valorEsperado);
    });

    it('should validate builder reset between creations', async () => {
      // Crear dos servicios diferentes consecutivamente
      const servicio1Data = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [prendaId],
      );
      servicio1Data.diasAlquiler = 2;

      const response1 = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(servicio1Data)
        .expect(201);

      const servicio2Data = createServicioAlquilerTestData(
        clienteId,
        empleadoId,
        [prendaId],
      );
      servicio2Data.diasAlquiler = 5;

      const response2 = await request(app.getHttpServer())
        .post('/api/servicios')
        .send(servicio2Data)
        .expect(201);

      // Validar que son servicios diferentes
      expect(response1.body.data.id).not.toBe(response2.body.data.id);
      expect(response1.body.data.numeroServicio).not.toBe(response2.body.data.numeroServicio);
      expect(response1.body.data.diasAlquiler).toBe(2);
      expect(response2.body.data.diasAlquiler).toBe(5);
    });
  });
});