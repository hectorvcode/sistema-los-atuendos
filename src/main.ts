import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ======================
  // CONFIGURACIÓN GLOBAL
  // ======================

  // Prefijo global para todas las rutas de la API
  app.setGlobalPrefix('api');

  // Versionado de API (opcional, preparado para futuro)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS - Configuración para producción
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // ======================
  // PIPES GLOBALES
  // ======================

  // Validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transforma payloads a instancias de DTO
      whitelist: true, // Remueve propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
      exceptionFactory: (errors) => {
        // Formato personalizado para errores de validación
        const messages = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', '),
          constraint: Object.keys(error.constraints || {})[0],
        }));
        return {
          statusCode: 422,
          message: 'Error de validación en los datos enviados',
          errors: messages,
        };
      },
    }),
  );

  // ======================
  // FILTROS GLOBALES
  // ======================

  // Filtro para todas las excepciones (debe ir primero)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Filtro específico para HttpException
  app.useGlobalFilters(new HttpExceptionFilter());

  // ======================
  // INTERCEPTORES GLOBALES
  // ======================

  // Logging de peticiones
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Transformación de respuestas a formato estandarizado
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // ======================
  // SWAGGER / OPENAPI 3.0
  // ======================

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Los Atuendos - API de Gestión de Alquiler de Vestuario')
    .setDescription(
      `
## Descripción General

API RESTful profesional para la gestión integral de alquiler de vestuario.
Implementa patrones de diseño avanzados y mejores prácticas de desarrollo.

## Características Principales

- **Gestión de Prendas**: CRUD completo con Factory Method Pattern
- **Gestión de Clientes y Empleados**: Administración de usuarios del sistema
- **Servicios de Alquiler**: Builder Pattern para creación compleja
- **Lavandería**: Decorator Pattern para priorización dinámica
- **Arquitectura Hexagonal**: Clean Architecture con Repository Pattern

## Patrones de Diseño Implementados

### Patrones Creacionales
- **Factory Method**: Creación de diferentes tipos de prendas
- **Builder**: Construcción compleja de servicios de alquiler
- **Singleton**: Generación de números consecutivos thread-safe

### Patrones Estructurales
- **Adapter/Repository**: Abstracción de capa de persistencia
- **Decorator**: Cálculo dinámico de prioridades de lavandería
- **Composite**: Gestión de conjuntos de prendas
- **Facade**: Simplificación de operaciones complejas

## Estándares de la API

### Formato de Respuesta
Todas las respuestas siguen un formato consistente:

\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "message": "Operación completada exitosamente",
  "data": { ... },
  "meta": { ... },
  "timestamp": "2025-01-13T10:30:00.000Z",
  "path": "/api/v1/prendas"
}
\`\`\`

### Códigos de Estado HTTP
- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado
- **400 Bad Request**: Datos inválidos
- **404 Not Found**: Recurso no encontrado
- **422 Unprocessable Entity**: Error de validación
- **500 Internal Server Error**: Error del servidor

### Paginación
Los endpoints que retornan listas incluyen paginación:

\`\`\`json
{
  "data": [...],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
\`\`\`

## Tecnologías
- **Framework**: NestJS 11.0.1
- **ORM**: TypeORM
- **Database**: MySQL
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI 3.0
`,
    )
    .setVersion('1.0.0')
    .setContact(
      'Equipo de Desarrollo',
      'https://github.com/tu-organizacion/los-atuendos',
      'soporte@losatuendos.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Servidor de Desarrollo Local')
    .addServer('https://api.losatuendos.com', 'Servidor de Producción')
    .addTag('Prendas', 'Gestión de prendas de vestuario')
    .addTag('Clientes', 'Gestión de clientes')
    .addTag('Empleados', 'Gestión de empleados')
    .addTag('Servicios de Alquiler', 'Gestión de alquileres')
    .addTag('Gestión de Lavandería', 'Sistema de lavandería con prioridades')
    .addTag('Patrones de Diseño', 'Demos de patrones implementados')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT para autenticación',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token entre recargas
      docExpansion: 'none', // Colapsa todas las secciones por defecto
      filter: true, // Habilita búsqueda
      showRequestDuration: true, // Muestra duración de peticiones
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      tryItOutEnabled: true, // Habilita "Try it out" por defecto
    },
    customSiteTitle: 'Los Atuendos API - Documentación',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 36px; }
    `,
  });

  // ======================
  // INICIAR SERVIDOR
  // ======================

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║           🎭  LOS ATUENDOS - API REST  🎭                ║');
  console.log('║                                                          ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(
    `║  🚀 Servidor:     http://localhost:${port.toString().padEnd(26)}║`,
  );
  console.log(
    `║  📚 Documentación: http://localhost:${port}/api/docs${' '.repeat(13)}║`,
  );
  console.log(
    `║  🌍 Entorno:      ${(process.env.NODE_ENV || 'development').padEnd(37)}║`,
  );
  console.log('║  ✅ Estado:       Activo                                 ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

bootstrap();
