import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { createClienteTestData, generateEmail, generateNumeroIdentificacion } from './helpers/test-data.helper';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Clientes API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdClienteId: number;
  let createdClienteEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar configuración global
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
    await dataSource.query('DELETE FROM clientes WHERE email LIKE "%@test.com"');
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (dataSource) {
      await dataSource.query('DELETE FROM clientes WHERE email LIKE "%@test.com"');
    }

    if (app) {
      await app.close();
    }
  });

  describe('/api/clientes (POST)', () => {
    it('should create a cliente successfully', async () => {
      const clienteData = createClienteTestData();

      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      // Validar estructura de respuesta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');

      // Validar datos del cliente creado
      const cliente = response.body.data;
      expect(cliente).toHaveProperty('id');
      expect(cliente.nombre).toBe(clienteData.nombre);
      expect(cliente.apellido).toBe(clienteData.apellido);
      expect(cliente.numeroIdentificacion).toBe(clienteData.numeroIdentificacion);
      expect(cliente.email).toBe(clienteData.email);
      expect(cliente.telefono).toBe(clienteData.telefono);
      expect(cliente.direccion).toBe(clienteData.direccion);

      // Guardar para tests posteriores
      createdClienteId = cliente.id;
      createdClienteEmail = cliente.email;
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        nombre: 'Test',
        // Faltan campos requeridos
      };

      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const invalidData = createClienteTestData();
      invalidData.email = 'email-invalido'; // Sin @

      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should fail with duplicate email', async () => {
      const duplicateData = createClienteTestData();
      duplicateData.email = createdClienteEmail; // Email ya existe
      duplicateData.numeroIdentificacion = generateNumeroIdentificacion(); // Diferente número

      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should fail with duplicate numeroIdentificacion', async () => {
      // Primero obtener el número de identificación del cliente creado
      const getResponse = await request(app.getHttpServer())
        .get(`/api/clientes/${createdClienteId}`)
        .expect(200);

      const numeroIdentificacion = getResponse.body.data.numeroIdentificacion;

      const duplicateData = createClienteTestData();
      duplicateData.numeroIdentificacion = numeroIdentificacion; // Número ya existe
      duplicateData.email = generateEmail('otro-cliente'); // Diferente email

      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid phone format', async () => {
      const invalidData = createClienteTestData();
      invalidData.telefono = '123'; // Teléfono demasiado corto

      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject extra fields (whitelist validation)', async () => {
      const dataWithExtraFields = {
        ...createClienteTestData(),
        campoExtra: 'no debería estar aquí',
        otroCampo: 'tampoco este',
      };

      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(dataWithExtraFields)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/clientes (GET)', () => {
    it('should get all clientes with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clientes')
        .expect(200);

      // Validar estructura de respuesta paginada
      expect(response.body.success).toBe(true);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();

      // Validar metadatos de paginación
      const meta = response.body.meta;
      expect(meta).toHaveProperty('currentPage');
      expect(meta).toHaveProperty('itemsPerPage');
      expect(meta).toHaveProperty('totalItems');
      expect(meta).toHaveProperty('totalPages');

      // Debe haber al menos el cliente que creamos
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get clientes with custom pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clientes?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('/api/clientes/:id (GET)', () => {
    it('should get cliente by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/clientes/${createdClienteId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdClienteId);
      expect(response.body.data.email).toBe(createdClienteEmail);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clientes/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clientes/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/clientes/:id (PATCH)', () => {
    it('should update cliente successfully', async () => {
      const updateData = {
        telefono: '3009999999',
        direccion: 'Nueva Dirección Test 456',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/clientes/${createdClienteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.telefono).toBe(updateData.telefono);
      expect(response.body.data.direccion).toBe(updateData.direccion);
      expect(response.body.data.email).toBe(createdClienteEmail); // No debe cambiar
    });

    it('should fail when updating with duplicate email', async () => {
      // Crear otro cliente primero
      const otroCliente = createClienteTestData();
      const createResponse = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(otroCliente)
        .expect(201);

      const otroClienteId = createResponse.body.data.id;

      // Intentar actualizar con email existente
      const updateData = {
        email: createdClienteEmail, // Email del primer cliente
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/clientes/${otroClienteId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when updating non-existent cliente', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/clientes/99999')
        .send({ nombre: 'Nuevo Nombre' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email in update', async () => {
      const invalidUpdate = {
        email: 'email-sin-arroba',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/clientes/${createdClienteId}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/clientes/:id (DELETE)', () => {
    it('should delete cliente successfully', async () => {
      // Crear un cliente específico para eliminar
      const clienteToDelete = createClienteTestData();
      const createResponse = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(clienteToDelete)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      // Eliminar el cliente
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/clientes/${clienteId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('eliminado');

      // Verificar que ya no existe
      await request(app.getHttpServer())
        .get(`/api/clientes/${clienteId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent cliente', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/clientes/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/clientes/:id/servicios (GET)', () => {
    it('should get servicios for cliente', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/clientes/${createdClienteId}/servicios`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      // Puede estar vacío si no tiene servicios aún
    });

    it('should return 404 for servicios of non-existent cliente', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/clientes/99999/servicios')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Validation and Business Rules', () => {
    it('should validate that cliente data persists correctly', async () => {
      const clienteData = createClienteTestData();

      // Crear cliente
      const createResponse = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(clienteData)
        .expect(201);

      const clienteId = createResponse.body.data.id;

      // Obtener cliente y verificar todos los campos
      const getResponse = await request(app.getHttpServer())
        .get(`/api/clientes/${clienteId}`)
        .expect(200);

      const cliente = getResponse.body.data;
      expect(cliente.nombre).toBe(clienteData.nombre);
      expect(cliente.apellido).toBe(clienteData.apellido);
      expect(cliente.numeroIdentificacion).toBe(clienteData.numeroIdentificacion);
      expect(cliente.email).toBe(clienteData.email);
      expect(cliente.telefono).toBe(clienteData.telefono);
      expect(cliente.direccion).toBe(clienteData.direccion);
      expect(cliente).toHaveProperty('createdAt');
      expect(cliente).toHaveProperty('updatedAt');
    });

    it('should validate email uniqueness across multiple clients', async () => {
      const email = generateEmail('unique-test');

      // Crear primer cliente
      const cliente1 = createClienteTestData();
      cliente1.email = email;
      await request(app.getHttpServer())
        .post('/api/clientes')
        .send(cliente1)
        .expect(201);

      // Intentar crear segundo cliente con mismo email
      const cliente2 = createClienteTestData();
      cliente2.email = email;
      const response = await request(app.getHttpServer())
        .post('/api/clientes')
        .send(cliente2)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});