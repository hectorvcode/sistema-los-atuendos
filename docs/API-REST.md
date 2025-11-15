# Los Atuendos - Documentación API REST

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Configuración](#configuración)
- [Estándares de API](#estándares-de-api)
- [Autenticación](#autenticación)
- [Formato de Respuestas](#formato-de-respuestas)
- [Manejo de Errores](#manejo-de-errores)
- [Endpoints Principales](#endpoints-principales)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Códigos de Estado HTTP](#códigos-de-estado-http)

---

## Descripción General

API RESTful profesional para la gestión integral de un sistema de alquiler de vestuario. Implementa patrones de diseño avanzados, Clean Architecture y mejores prácticas de desarrollo.

### Características Principales

- ✅ **Arquitectura Hexagonal** con Repository Pattern
- ✅ **Patrones de Diseño** (Factory, Builder, Singleton, Decorator, Adapter, Composite, Facade)
- ✅ **Validación Automática** con class-validator
- ✅ **Documentación Interactiva** con Swagger/OpenAPI 3.0
- ✅ **Responses Estandarizados** con formato consistente
- ✅ **Manejo Centralizado de Errores**
- ✅ **Logging Automático** de peticiones
- ✅ **CORS Configurado** para integración frontend
- ✅ **Versionado de API** preparado para escalabilidad

### Tecnologías

- **Framework**: NestJS 11.0.1
- **ORM**: TypeORM
- **Base de Datos**: MySQL
- **Validación**: class-validator
- **Documentación**: Swagger/OpenAPI 3.0
- **Testing**: Jest

---

## Configuración

### URL Base

```
Desarrollo: http://localhost:3000/api
Producción:  https://api.losatuendos.com/api
```

### Swagger Documentación

```
Desarrollo: http://localhost:3000/api/docs
Producción:  https://api.losatuendos.com/api/docs
```

### Variables de Entorno

```env
# Servidor
APP_PORT=3000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=los_atuendos

# CORS
CORS_ORIGIN=http://localhost:4200
```

---

## Estándares de API

### Convenciones RESTful

Todos los endpoints siguen las convenciones REST estándar:

| Método HTTP | Acción | Ejemplo |
|-------------|--------|---------|
| `GET` | Obtener recursos | `GET /api/prendas` |
| `GET` | Obtener recurso específico | `GET /api/prendas/:id` |
| `POST` | Crear recurso | `POST /api/prendas` |
| `PUT` | Actualizar recurso completo | `PUT /api/prendas/:id` |
| `PATCH` | Actualizar parcialmente | `PATCH /api/servicios/:id/cancelar` |
| `DELETE` | Eliminar recurso | `DELETE /api/prendas/:id` |

### Naming Conventions

- **Recursos en plural**: `/prendas`, `/clientes`, `/servicios`
- **Kebab-case para URLs**: `/servicios-alquiler` (si fuera necesario)
- **camelCase en JSON**: `{ "fechaAlquiler": "2025-01-15" }`
- **IDs en la ruta**: `/prendas/123` en vez de `/prendas?id=123`

---

## Autenticación

*Actualmente en desarrollo. La autenticación JWT será implementada en futuras versiones.*

### Autenticación JWT (Próximamente)

```http
Authorization: Bearer <token>
```

Ejemplo:
```javascript
const headers = {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  'Content-Type': 'application/json'
};
```

---

## Formato de Respuestas

### Respuesta Exitosa

Todas las respuestas exitosas siguen este formato:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operación completada exitosamente",
  "data": {
    "id": 1,
    "referencia": "VD-001",
    "color": "Rojo",
    "talla": "M"
  },
  "meta": {
    "version": "1.0.0"
  },
  "timestamp": "2025-01-13T10:30:00.000Z",
  "path": "/api/v1/prendas/1"
}
```

### Respuesta con Paginación

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Datos obtenidos exitosamente",
  "data": [
    { "id": 1, "referencia": "VD-001" },
    { "id": 2, "referencia": "VD-002" }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 10,
    "totalItems": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2025-01-13T10:30:00.000Z",
  "path": "/api/v1/prendas"
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Indica si la operación fue exitosa |
| `statusCode` | number | Código de estado HTTP |
| `message` | string | Mensaje descriptivo de la operación |
| `data` | any | Datos de la respuesta (opcional) |
| `meta` | object | Metadatos adicionales (paginación, etc.) |
| `timestamp` | string | Timestamp en formato ISO 8601 |
| `path` | string | Ruta de la petición |

---

## Manejo de Errores

### Respuesta de Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error de validación en los datos enviados",
  "data": null,
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address",
      "constraint": "isEmail"
    },
    {
      "field": "talla",
      "message": "Talla must be one of: XS, S, M, L, XL",
      "constraint": "isEnum"
    }
  ],
  "timestamp": "2025-01-13T10:30:00.000Z",
  "path": "/api/v1/clientes"
}
```

### Códigos de Error

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| `BAD_REQUEST` | Petición mal formada | Datos inválidos o incompletos |
| `UNAUTHORIZED` | No autorizado | Token inválido o ausente |
| `FORBIDDEN` | Prohibido | Sin permisos suficientes |
| `NOT_FOUND` | No encontrado | Recurso no existe |
| `CONFLICT` | Conflicto | Violación de unicidad |
| `VALIDATION_ERROR` | Error de validación | Datos no cumplen reglas |
| `INTERNAL_ERROR` | Error interno | Error del servidor |

---

## Códigos de Estado HTTP

### Respuestas Exitosas (2xx)

| Código | Significado | Uso |
|--------|-------------|-----|
| `200 OK` | Éxito | GET, PUT, PATCH exitosos |
| `201 Created` | Creado | POST exitoso |
| `204 No Content` | Sin contenido | DELETE exitoso |

### Errores del Cliente (4xx)

| Código | Significado | Uso |
|--------|-------------|-----|
| `400 Bad Request` | Petición incorrecta | Datos inválidos |
| `401 Unauthorized` | No autenticado | Sin token o token inválido |
| `403 Forbidden` | Sin permisos | Usuario sin permisos |
| `404 Not Found` | No encontrado | Recurso no existe |
| `422 Unprocessable Entity` | No procesable | Error de validación |

### Errores del Servidor (5xx)

| Código | Significado | Uso |
|--------|-------------|-----|
| `500 Internal Server Error` | Error interno | Error no controlado |

---

## Endpoints Principales

### Módulo de Prendas

#### Crear Prenda (Factory Pattern)

```http
POST /api/prendas
Content-Type: application/json

{
  "tipo": "vestido-dama",
  "referencia": "VD-001",
  "color": "Rojo",
  "marca": "Elegancia",
  "talla": "M",
  "valorAlquiler": 150000,
  "largo": "largo",
  "tieneEnaguas": true,
  "esAjustable": false
}
```

#### Consultar Prendas por Talla

```http
GET /api/prendas/talla/M?pagina=1&limite=10
```

#### Obtener Prenda por Referencia

```http
GET /api/prendas/referencia/VD-001
```

### Módulo de Clientes

#### Crear Cliente

```http
POST /api/clientes
Content-Type: application/json

{
  "nombre": "María García",
  "numeroIdentificacion": "123456789",
  "correoElectronico": "maria@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67"
}
```

#### Obtener Servicios de Cliente

```http
GET /api/clientes/1/servicios?soloVigentes=true
```

### Módulo de Servicios de Alquiler (Builder Pattern)

#### Crear Servicio de Alquiler

```http
POST /api/servicios
Content-Type: application/json

{
  "clienteId": 1,
  "empleadoId": 1,
  "fechaAlquiler": "2025-02-15",
  "prendasIds": [1, 2, 3],
  "observaciones": "Cliente prefiere entrega a domicilio"
}
```

#### Buscar Servicio por Número

```http
GET /api/servicios/numero/1001
```

#### Cancelar Servicio

```http
PATCH /api/servicios/1/cancelar
```

### Módulo de Lavandería (Decorator Pattern)

#### Registrar Prenda para Lavandería

```http
POST /api/lavanderia
Content-Type: application/json

{
  "prendaId": 1,
  "esManchada": true,
  "esDelicada": true,
  "prioridadAdministrativa": false,
  "configuraciones": {
    "mancha": {
      "tipo": "vino",
      "gravedad": "severa"
    },
    "delicada": {
      "razon": "tejido delicado",
      "cuidadoEspecial": true
    }
  }
}
```

#### Obtener Cola de Lavandería por Prioridad

```http
GET /api/lavanderia/cola
```

#### Enviar Lote a Lavandería

```http
POST /api/lavanderia/enviar-lote
Content-Type: application/json

{
  "itemsIds": [1, 2, 3, 4, 5]
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Alquiler

```javascript
// 1. Buscar prendas disponibles
const prendas = await fetch('http://localhost:3000/api/prendas?estado=disponible');

// 2. Crear servicio de alquiler
const servicio = await fetch('http://localhost:3000/api/servicios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clienteId: 1,
    empleadoId: 1,
    fechaAlquiler: '2025-02-15',
    prendasIds: [1, 2, 3]
  })
});

// 3. Consultar servicio creado
const numero = servicio.data.numero;
const detalles = await fetch(`http://localhost:3000/api/servicios/numero/${numero}`);
```

### Ejemplo 2: Gestión de Lavandería con Prioridades

```javascript
// 1. Registrar prendas para lavandería con diferentes prioridades
await fetch('http://localhost:3000/api/lavanderia', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prendaId: 1,
    esManchada: true,
    configuraciones: {
      mancha: { tipo: 'vino', gravedad: 'severa' }
    }
  })
});

// 2. Obtener cola ordenada por prioridad
const cola = await fetch('http://localhost:3000/api/lavanderia/cola');

// 3. Enviar lote a lavandería
await fetch('http://localhost:3000/api/lavanderia/enviar-lote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemsIds: [1, 2, 3]
  })
});
```

### Ejemplo 3: Paginación

```javascript
// Obtener página 2 con 20 elementos
const respuesta = await fetch('http://localhost:3000/api/prendas?pagina=2&limite=20');

const { data, meta } = respuesta;
console.log(`Mostrando ${data.length} de ${meta.totalItems} elementos`);
console.log(`Página ${meta.currentPage} de ${meta.totalPages}`);

// Navegar a siguiente página
if (meta.hasNextPage) {
  const siguientePagina = meta.currentPage + 1;
  const siguiente = await fetch(`http://localhost:3000/api/prendas?pagina=${siguientePagina}`);
}
```

---

## Testing de la API

### Probar con cURL

```bash
# Crear prenda
curl -X POST http://localhost:3000/api/prendas \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "vestido-dama",
    "referencia": "VD-TEST-001",
    "color": "Azul",
    "marca": "Test",
    "talla": "M",
    "valorAlquiler": 100000
  }'

# Obtener prendas
curl http://localhost:3000/api/prendas

# Buscar por referencia
curl http://localhost:3000/api/prendas/referencia/VD-TEST-001
```

### Probar con Postman

1. Importar colección desde Swagger:
   - Abrir http://localhost:3000/api/docs
   - Click en "Get Postman Collection"
   - Importar en Postman

2. Variables de entorno:
   ```json
   {
     "baseUrl": "http://localhost:3000/api",
     "token": "Bearer eyJhbGc..."
   }
   ```

---

## Mejores Prácticas

### Para Desarrolladores Frontend

1. **Usar el formato estandarizado**:
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     statusCode: number;
     message: string;
     data?: T;
     meta?: any;
     timestamp: string;
     path: string;
   }
   ```

2. **Manejar errores consistentemente**:
   ```typescript
   try {
     const response = await apiClient.post('/prendas', data);
     if (response.success) {
       // Manejar éxito
       console.log(response.data);
     }
   } catch (error) {
     // error.errors contiene array de errores de validación
     error.errors?.forEach(err => {
       console.error(`${err.field}: ${err.message}`);
     });
   }
   ```

3. **Implementar paginación**:
   ```typescript
   const { data, meta } = response;

   // Verificar si hay más páginas
   if (meta.hasNextPage) {
     fetchPage(meta.currentPage + 1);
   }
   ```

### Para Desarrolladores Backend

1. **Usar DTOs con validación**:
   ```typescript
   export class CreatePrendaDto {
     @IsString()
     @MaxLength(50)
     referencia: string;

     @IsNumber()
     @Min(0)
     valorAlquiler: number;
   }
   ```

2. **Retornar responses en formato estándar** (automático con interceptor)

3. **Documentar endpoints con Swagger**:
   ```typescript
   @ApiOperation({ summary: 'Crear nueva prenda' })
   @ApiResponse({ status: 201, description: 'Prenda creada' })
   @ApiResponse({ status: 400, description: 'Datos inválidos' })
   async crearPrenda(@Body() dto: CreatePrendaDto) {
     // ...
   }
   ```

---

## Soporte y Contacto

- **Documentación Interactiva**: http://localhost:3000/api/docs
- **Repositorio**: https://github.com/tu-organizacion/los-atuendos
- **Email**: soporte@losatuendos.com

---

## Licencia

MIT License - Ver archivo LICENSE para más detalles.