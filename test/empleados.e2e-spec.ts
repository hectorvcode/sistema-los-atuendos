import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { createEmpleadoTestData, generateEmail } from './helpers/test-data.helper';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Empleados API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdEmpleadoId: number;

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

    // Limpiar datos de prueba previos
    await dataSource.query('DELETE FROM empleados WHERE email LIKE "%@test.com"');
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.query('DELETE FROM empleados WHERE email LIKE "%@test.com"');
    }

    if (app) {
      await app.close();
    }
  });

  describe('/api/empleados (POST)', () => {
    it('should create empleado successfully', async () => {
      const empleadoData = createEmpleadoTestData();

      const response = await request(app.getHttpServer())
        .post('/api/empleados')
        .send(empleadoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(201);

      const empleado = response.body.data;
      expect(empleado).toHaveProperty('id');
      expect(empleado.nombre).toBe(empleadoData.nombre);
      expect(empleado.apellido).toBe(empleadoData.apellido);
      expect(empleado.numeroIdentificacion).toBe(empleadoData.numeroIdentificacion);
      expect(empleado.email).toBe(empleadoData.email);
      expect(empleado.cargo).toBe(empleadoData.cargo);

      createdEmpleadoId = empleado.id;
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        nombre: 'Test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/empleados')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email', async () => {
      const invalidData = createEmpleadoTestData();
      invalidData.email = 'email-invalido';

      const response = await request(app.getHttpServer())
        .post('/api/empleados')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      const empleado1 = createEmpleadoTestData();
      const email = generateEmail('empleado-dup');
      empleado1.email = email;

      await request(app.getHttpServer())
        .post('/api/empleados')
        .send(empleado1)
        .expect(201);

      const empleado2 = createEmpleadoTestData();
      empleado2.email = email;

      const response = await request(app.getHttpServer())
        .post('/api/empleados')
        .send(empleado2)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/empleados (GET)', () => {
    it('should get all empleados with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/empleados')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/empleados?page=1&limit=5')
        .expect(200);

      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(5);
    });
  });

  describe('/api/empleados/:id (GET)', () => {
    it('should get empleado by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/empleados/${createdEmpleadoId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdEmpleadoId);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/empleados/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/empleados/:id (PATCH)', () => {
    it('should update empleado successfully', async () => {
      const updateData = {
        cargo: 'Gerente de Ventas',
        telefono: '3001111111',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/empleados/${createdEmpleadoId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cargo).toBe(updateData.cargo);
    });

    it('should return 404 when updating non-existent empleado', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/empleados/99999')
        .send({ cargo: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/empleados/:id (DELETE)', () => {
    it('should delete empleado successfully', async () => {
      const empleadoToDelete = createEmpleadoTestData();
      const createResponse = await request(app.getHttpServer())
        .post('/api/empleados')
        .send(empleadoToDelete)
        .expect(201);

      const empleadoId = createResponse.body.data.id;

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/empleados/${empleadoId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      await request(app.getHttpServer())
        .get(`/api/empleados/${empleadoId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent empleado', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/empleados/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});