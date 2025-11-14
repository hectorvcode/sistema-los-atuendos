import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import {
  createVestidoDamaTestData,
  createTrajeCaballeroTestData,
  createDisfrazTestData,
  generatePrendaReferencia,
} from './helpers/test-data.helper';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Prendas API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdPrendaId: number;
  let createdPrendaReferencia: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplicar la misma configuración que en main.ts
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
    await dataSource.query('DELETE FROM prendas WHERE referencia LIKE "%-TEST-%"');
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (dataSource) {
      await dataSource.query('DELETE FROM prendas WHERE referencia LIKE "%-TEST-%"');
    }

    if (app) {
      await app.close();
    }
  });

  describe('/api/prendas (POST)', () => {
    it('should create a vestido de dama successfully', async () => {
      const vestidoData = createVestidoDamaTestData();

      const response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(vestidoData)
        .expect(201);

      // Validar estructura de respuesta
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('statusCode', 201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');

      // Validar datos de la prenda creada
      const prenda = response.body.data;
      expect(prenda).toHaveProperty('id');
      expect(prenda.tipo).toBe('vestido-dama');
      expect(prenda.referencia).toBe(vestidoData.referencia);
      expect(prenda.color).toBe(vestidoData.color);
      expect(prenda.talla).toBe(vestidoData.talla);
      expect(prenda.valorAlquiler).toBe(vestidoData.valorAlquiler);
      expect(prenda.disponible).toBe(true);
      expect(prenda.estado).toBe('disponible');

      // Validar propiedades específicas de vestido de dama
      expect(prenda.tienePedreria).toBe(vestidoData.tienePedreria);
      expect(prenda.esLargo).toBe(vestidoData.esLargo);
      expect(prenda.cantidadPiezas).toBe(vestidoData.cantidadPiezas);

      // Guardar para tests posteriores
      createdPrendaId = prenda.id;
      createdPrendaReferencia = prenda.referencia;
    });

    it('should create a traje de caballero successfully', async () => {
      const trajeData = createTrajeCaballeroTestData();

      const response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(trajeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tipo).toBe('traje-caballero');
      expect(response.body.data.incluyeCorbata).toBe(trajeData.incluyeCorbata);
      expect(response.body.data.tipoCorte).toBe(trajeData.tipoCorte);
    });

    it('should create a disfraz successfully', async () => {
      const disfrazData = createDisfrazTestData();

      const response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(disfrazData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tipo).toBe('disfraz');
      expect(response.body.data.personaje).toBe(disfrazData.personaje);
      expect(response.body.data.incluyeAccesorios).toBe(disfrazData.incluyeAccesorios);
    });

    it('should fail with invalid data - missing required fields', async () => {
      const invalidData = {
        tipo: 'vestido-dama',
        // Falta referencia, color, marca, talla, valorAlquiler
      };

      const response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail with invalid tipo', async () => {
      const invalidData = {
        tipo: 'tipo-invalido',
        referencia: generatePrendaReferencia('INV'),
        color: 'Azul',
        marca: 'Test',
        talla: 'M',
        valorAlquiler: 100000,
      };

      const response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate referencia', async () => {
      const duplicateData = createVestidoDamaTestData();
      duplicateData.referencia = createdPrendaReferencia; // Usar referencia existente

      const response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(duplicateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('referencia');
    });

    it('should fail with negative valorAlquiler', async () => {
      const invalidData = createVestidoDamaTestData();
      invalidData.valorAlquiler = -100;

      const response = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/prendas (GET)', () => {
    it('should get all prendas with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas')
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
      expect(meta).toHaveProperty('hasNextPage');
      expect(meta).toHaveProperty('hasPreviousPage');

      // Debe haber al menos las prendas que creamos
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should get prendas with custom pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta.currentPage).toBe(1);
      expect(response.body.meta.itemsPerPage).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should filter by disponible=true', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas?disponible=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((p: any) => p.disponible === true)).toBe(true);
    });

    it('should filter by tipo', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas?tipo=vestido-dama')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data.every((p: any) => p.tipo === 'vestido-dama')).toBe(true);
      }
    });
  });

  describe('/api/prendas/:id (GET)', () => {
    it('should get prenda by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/prendas/${createdPrendaId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdPrendaId);
      expect(response.body.data.referencia).toBe(createdPrendaReferencia);
    });

    it('should return 404 for non-existent id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('/api/prendas/referencia/:referencia (GET)', () => {
    it('should find prenda by referencia', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/prendas/referencia/${createdPrendaReferencia}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.referencia).toBe(createdPrendaReferencia);
      expect(response.body.data.id).toBe(createdPrendaId);
    });

    it('should return 404 for non-existent referencia', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas/referencia/REF-NO-EXISTE')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/prendas/talla/:talla (GET)', () => {
    it('should get prendas by talla', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas/talla/M')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        expect(response.body.data.every((p: any) => p.talla === 'M')).toBe(true);
      }
    });

    it('should return empty array for talla without prendas', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/prendas/talla/XXXL')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('/api/prendas/:id (PATCH)', () => {
    it('should update prenda successfully', async () => {
      const updateData = {
        color: 'Azul Actualizado',
        valorAlquiler: 160000,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/prendas/${createdPrendaId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.color).toBe(updateData.color);
      expect(response.body.data.valorAlquiler).toBe(updateData.valorAlquiler);
      expect(response.body.data.referencia).toBe(createdPrendaReferencia); // No debe cambiar
    });

    it('should return 404 when updating non-existent prenda', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/prendas/99999')
        .send({ color: 'Verde' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail when updating with invalid data', async () => {
      const invalidUpdate = {
        valorAlquiler: -50000, // Valor negativo inválido
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/prendas/${createdPrendaId}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('/api/prendas/:id (DELETE)', () => {
    it('should delete prenda successfully', async () => {
      // Crear una prenda específica para eliminar
      const prendaToDelete = createDisfrazTestData();
      const createResponse = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(prendaToDelete)
        .expect(201);

      const prendaId = createResponse.body.data.id;

      // Eliminar la prenda
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/prendas/${prendaId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toContain('eliminada');

      // Verificar que ya no existe
      await request(app.getHttpServer())
        .get(`/api/prendas/${prendaId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent prenda', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/prendas/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Factory Method Pattern Validation', () => {
    it('should validate that different factories create correct types', async () => {
      const vestido = createVestidoDamaTestData();
      const traje = createTrajeCaballeroTestData();
      const disfraz = createDisfrazTestData();

      const vestidoResponse = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(vestido)
        .expect(201);

      const trajeResponse = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(traje)
        .expect(201);

      const disfrazResponse = await request(app.getHttpServer())
        .post('/api/prendas')
        .send(disfraz)
        .expect(201);

      // Validar que cada tipo tiene sus propiedades específicas
      expect(vestidoResponse.body.data.tipo).toBe('vestido-dama');
      expect(vestidoResponse.body.data).toHaveProperty('tienePedreria');
      expect(vestidoResponse.body.data).toHaveProperty('esLargo');

      expect(trajeResponse.body.data.tipo).toBe('traje-caballero');
      expect(trajeResponse.body.data).toHaveProperty('incluyeCorbata');
      expect(trajeResponse.body.data).toHaveProperty('tipoCorte');

      expect(disfrazResponse.body.data.tipo).toBe('disfraz');
      expect(disfrazResponse.body.data).toHaveProperty('personaje');
      expect(disfrazResponse.body.data).toHaveProperty('incluyeAccesorios');
    });
  });
});