# Los Atuendos - Postman Collection

**Versión API:** 1.0.0
**Última actualización:** 14 de Noviembre, 2025

## 📦 Descripción

Collection completa de Postman para testing y documentación de la API de Los Atuendos. Incluye todos los endpoints organizados por módulos, tests automáticos, variables de entorno pre-configuradas y datos de ejemplo.

## 📁 Contenido

- **Los-Atuendos-API.postman_collection.json** - Collection principal con todos los endpoints
- **Los-Atuendos-Local.postman_environment.json** - Variables de entorno para desarrollo local
- **Los-Atuendos-Production.postman_environment.json** - Variables de entorno para producción

---

## 🚀 Instalación y Configuración

### Paso 1: Importar la Collection

1. Abrir Postman
2. Click en **Import** (botón superior izquierdo)
3. Seleccionar el archivo `Los-Atuendos-API.postman_collection.json`
4. Click en **Import**

### Paso 2: Importar el Environment

1. Click en **Import** nuevamente
2. Seleccionar el archivo `Los-Atuendos-Local.postman_environment.json`
3. Click en **Import**

### Paso 3: Seleccionar el Environment

1. En la esquina superior derecha, seleccionar **Los Atuendos - Local** del dropdown de environments
2. Verificar que el environment está activo (aparece seleccionado)

### Paso 4: Verificar Configuración

1. Click en el ícono del ojo (👁️) junto al selector de environment
2. Verificar que `baseUrl` está configurada como `http://localhost:3000/api/v1`
3. Asegurar que el servidor de desarrollo está corriendo (`npm run start:dev`)

---

## ⚠️ CAMBIOS IMPORTANTES EN LA API

### 🔄 API Versioning

La API ahora usa **versionado URI**. Todos los endpoints están bajo `/api/v1/`:

```
✅ Correcto:  http://localhost:3000/api/v1/health
❌ Anterior:  http://localhost:3000/api/health
```

**Configuración en Postman:**
- **baseUrl Local**: `http://localhost:3000/api/v1`
- **baseUrl Producción**: `https://api.losatuendos.com/api/v1`

### 🩺 Health Check Endpoint

**❌ ANTES (No funciona):**
```
GET {{baseUrl}}
GET http://localhost:3000/api
```

**✅ AHORA (Correcto):**
```
GET {{baseUrl}}/health
GET http://localhost:3000/api/v1/health
```

**Respuesta esperada:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operación completada exitosamente",
  "data": {
    "message": "API Los Atuendos funcionando correctamente",
    "version": "1.0.0",
    "timestamp": "2025-11-14T23:55:00.000Z",
    "status": "healthy"
  },
  "timestamp": "2025-11-14T23:55:00.000Z",
  "path": "/api/v1/health"
}
```

### 🔧 Servicios de Alquiler - Cambios en el Modelo

#### ❌ Campos ELIMINADOS:
- `diasAlquiler` (ya no existe)
- `numeroServicio` (STRING) → Reemplazado por `numero` (INT)

#### ✅ Campos ACTUALIZADOS:

| Campo Anterior | Campo Nuevo | Tipo | Ejemplo |
|----------------|-------------|------|---------|
| `numeroServicio` | `numero` | INT | `1` (no "ALQ-0001") |
| `diasAlquiler` | ❌ Eliminado | - | - |
| `estado` | `estado` | ENUM | `pendiente`, `confirmado`, `entregado`, `devuelto`, `cancelado` |

#### Estados Válidos ACTUALIZADOS:

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Servicio creado, sin confirmar |
| `confirmado` | Cliente confirmó el alquiler |
| `entregado` | Prendas entregadas al cliente |
| `devuelto` | Cliente devolvió las prendas |
| `cancelado` | Servicio cancelado |

**❌ Estados ELIMINADOS:** `activo`, `reservado`, `completado`

### 📝 Crear Servicio - Body Actualizado

**❌ ANTES (No funciona):**
```json
{
  "clienteId": 1,
  "empleadoId": 2,
  "prendasIds": [1, 2],
  "diasAlquiler": 3,
  "fechaAlquiler": "2025-11-20",
  "observaciones": "Evento de gala"
}
```

**✅ AHORA (Correcto):**
```json
{
  "clienteId": 1,
  "empleadoId": 2,
  "prendasIds": [1, 2],
  "fechaAlquiler": "2025-11-20",
  "observaciones": "Evento de gala"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": 1,
    "numero": 1,                    // ← INT (Singleton Pattern)
    "fechaSolicitud": "2025-11-14",
    "fechaAlquiler": "2025-11-20",
    "fechaDevolucion": null,
    "estado": "pendiente",
    "valorTotal": 0,
    "observaciones": "Evento de gala",
    "cliente": { ... },
    "empleado": { ... },
    "prendas": [ ... ]
  }
}
```

### 🔍 Buscar Servicio por Número

**❌ ANTES (No funciona):**
```
GET {{baseUrl}}/servicios/numero/ALQ-0001
```

**✅ AHORA (Correcto):**
```
GET {{baseUrl}}/servicios/numero/1
```

El número ahora es un **entero (INT)**, no una cadena con formato.

---

## 📁 Estructura de la Collection

```
Los Atuendos - API REST/
├── Health Check/
│   └── GET API Health
│
├── Prendas/
│   ├── Crear Vestido de Dama
│   ├── Obtener Todas las Prendas
│   ├── Buscar Prenda por Referencia
│   └── Consultar Prendas por Talla
│
├── Clientes/
│   ├── Crear Cliente
│   ├── Obtener Cliente por ID
│   └── Obtener Servicios de Cliente
│
├── Empleados/
│   ├── Crear Empleado
│   └── Obtener Todos los Empleados
│
├── Servicios de Alquiler/
│   ├── Crear Servicio de Alquiler (Builder)
│   ├── Buscar Servicio por Número
│   └── Obtener Estadísticas de Servicios
│
└── Lavandería/
    ├── Registrar Prenda para Lavandería (Decorator)
    ├── Obtener Cola de Lavandería por Prioridad
    ├── Enviar Lote a Lavandería
    └── Obtener Estadísticas de Lavandería
```

---

## 🎯 Guía de Uso

### Opción 1: Ejecución Secuencial Manual

Para probar la API paso a paso:

1. **Health Check** - Verificar que la API está activa
   ```
   GET {{baseUrl}}/health
   ```

2. **Crear Vestido de Dama** - Crea una prenda (guarda automáticamente el ID)
   ```
   POST {{baseUrl}}/prendas
   ```

3. **Crear Cliente** - Crea un cliente (guarda automáticamente el ID)
   ```
   POST {{baseUrl}}/clientes
   ```

4. **Crear Empleado** - Crea un empleado (guarda automáticamente el ID)
   ```
   POST {{baseUrl}}/empleados
   ```

5. **Crear Servicio de Alquiler** - Usa los IDs guardados automáticamente
   ```
   POST {{baseUrl}}/servicios
   ```

6. **Registrar Prenda para Lavandería** - Usa el ID de la prenda creada
   ```
   POST {{baseUrl}}/lavanderia
   ```

7. Continuar con las demás peticiones de consulta

### Opción 2: Usar Collection Runner

Para ejecutar toda la suite de tests automáticamente:

1. Click derecho en la collection "Los Atuendos - API REST"
2. Seleccionar **Run collection**
3. Configurar opciones:
   - **Iterations**: 1
   - **Delay**: 500ms (opcional, para evitar problemas de concurrencia)
4. Click en **Run Los Atuendos - API REST**
5. Ver resultados en la pantalla de Test Results

### Opción 3: Uso Individual

Para probar endpoints específicos:

1. Expandir la carpeta del módulo deseado (ej: "Prendas")
2. Seleccionar el request específico
3. Click en **Send**
4. Revisar la respuesta y los tests en las pestañas correspondientes

---

## 🚀 Flujo de Prueba Recomendado

### Secuencia Completa:

1. **Health Check**
   ```
   GET {{baseUrl}}/health
   ```

2. **Ver Prendas Disponibles**
   ```
   GET {{baseUrl}}/prendas?disponible=true
   ```

3. **Crear Servicio** (con body actualizado sin diasAlquiler)
   ```
   POST {{baseUrl}}/servicios
   Body: { "clienteId": 1, "empleadoId": 2, "prendasIds": [1,2], "fechaAlquiler": "2025-11-20" }
   ```

4. **Buscar por Número** (usando INT)
   ```
   GET {{baseUrl}}/servicios/numero/1
   ```

5. **Registrar en Lavandería**
   ```
   POST {{baseUrl}}/lavanderia
   Body: { "prendaId": 1, "esManchada": true, "esDelicada": true }
   ```

6. **Ver Cola de Lavandería**
   ```
   GET {{baseUrl}}/lavanderia/cola
   ```

---

## 📚 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check ✅ |
| GET | `/api/v1/docs` | Swagger documentation |
| GET | `/api/v1/prendas` | Listar prendas |
| POST | `/api/v1/prendas` | Crear prenda |
| GET | `/api/v1/clientes` | Listar clientes |
| POST | `/api/v1/clientes` | Crear cliente |
| GET | `/api/v1/empleados` | Listar empleados |
| POST | `/api/v1/empleados` | Crear empleado |
| POST | `/api/v1/servicios` | Crear servicio (Builder Pattern) |
| GET | `/api/v1/servicios/numero/:numero` | Buscar por número (INT) |
| GET | `/api/v1/servicios/estadisticas` | Estadísticas de servicios |
| POST | `/api/v1/lavanderia` | Registrar item (Decorator Pattern) |
| GET | `/api/v1/lavanderia/cola` | Ver cola ordenada por prioridad |
| GET | `/api/v1/lavanderia/estadisticas` | Estadísticas de lavandería |

---

## 🧪 Tests Automáticos

Cada request incluye tests que validan:

### Tests Globales (en todos los requests)

```javascript
✓ Response format is valid JSON
✓ Response has standard API format
✓ Response time is acceptable
```

### Tests Específicos por Endpoint

#### Crear Vestido de Dama

```javascript
✓ Status code is 201
✓ Response has standard format
✓ Prenda created successfully
✓ Factory Method Pattern applied correctly
```

#### Obtener Todas las Prendas

```javascript
✓ Status code is 200
✓ Response is paginated
✓ Data is array
```

#### Crear Servicio de Alquiler

```javascript
✓ Status code is 201
✓ Servicio created with Builder Pattern
✓ Consecutive number generated (Singleton)
```

#### Registrar Prenda para Lavandería

```javascript
✓ Status code is 201
✓ Item created with Decorator Pattern
✓ Priority calculated by decorators
```

#### Obtener Cola de Lavandería

```javascript
✓ Status code is 200
✓ Queue is sorted by priority (DESC)
```

---

## 🔧 Variables de Entorno

### Variables Pre-configuradas

| Variable     | Descripción        | Ejemplo (Local)                       | Ejemplo (Producción)                         |
| ------------ | ------------------ | ------------------------------------- | -------------------------------------------- |
| `baseUrl`    | URL base de la API | `http://localhost:3000/api/v1`        | `https://api.losatuendos.com/api/v1`         |
| `swaggerUrl` | URL de Swagger     | `http://localhost:3000/api/docs`      | `https://api.losatuendos.com/api/docs`       |
| `authToken`  | Token JWT (futuro) | `Bearer eyJhbGc...`                   | `Bearer eyJhbGc...`                          |

### Variables Dinámicas (auto-generadas)

Las siguientes variables se generan automáticamente durante la ejecución:

| Variable           | Generada por              | Tipo | Uso                 |
| ------------------ | ------------------------- | ---- | ------------------- |
| `prendaId`         | Crear Vestido de Dama     | INT  | IDs posteriores     |
| `prendaReferencia` | Crear Vestido de Dama     | STR  | Búsquedas           |
| `nuevaReferencia`  | Pre-request script        | STR  | Unicidad            |
| `clienteId`        | Crear Cliente             | INT  | Servicios           |
| `clienteNumeroId`  | Pre-request script        | STR  | Unicidad            |
| `clienteEmail`     | Pre-request script        | STR  | Unicidad            |
| `empleadoId`       | Crear Empleado            | INT  | Servicios           |
| `empleadoNumeroId` | Pre-request script        | STR  | Unicidad            |
| `empleadoEmail`    | Pre-request script        | STR  | Unicidad            |
| `servicioId`       | Crear Servicio            | INT  | Referencias         |
| `servicioNumero`   | Crear Servicio            | INT  | Búsquedas (ya no STRING) |
| `fechaAlquiler`    | Pre-request script        | DATE | Fecha futura válida |
| `lavanderiaItemId` | Registrar para Lavandería | INT  | Lotes               |

---

## 📝 Scripts de Configuración

### Pre-request Scripts

Los scripts pre-request se ejecutan **antes** de cada petición:

#### Generar Referencia Única

```javascript
const timestamp = Date.now();
const referencia = `VD-TEST-${timestamp}`;
pm.environment.set('nuevaReferencia', referencia);
```

#### Generar Fecha Futura

```javascript
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30);
const fechaAlquiler = futureDate.toISOString().split('T')[0];
pm.environment.set('fechaAlquiler', fechaAlquiler);
```

#### Generar Email Único

```javascript
const timestamp = Date.now();
pm.environment.set('clienteEmail', `cliente${timestamp}@test.com`);
```

### Test Scripts

Los test scripts se ejecutan **después** de cada petición:

#### Validar Status Code

```javascript
pm.test('Status code is 201', function () {
  pm.response.to.have.status(201);
});
```

#### Extraer y Guardar ID

```javascript
pm.test('Prenda created successfully', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property('id');

  // Guardar para uso posterior
  pm.environment.set('prendaId', jsonData.data.id);
});
```

#### Validar Formato de Respuesta

```javascript
pm.test('Response has standard format', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('success');
  pm.expect(jsonData).to.have.property('statusCode');
  pm.expect(jsonData).to.have.property('message');
  pm.expect(jsonData).to.have.property('data');
});
```

#### Validar Ordenamiento

```javascript
pm.test('Queue is sorted by priority (DESC)', function () {
  var items = pm.response.json().data;

  for (let i = 0; i < items.length - 1; i++) {
    pm.expect(items[i].prioridad).to.be.at.least(items[i + 1].prioridad);
  }
});
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Alquiler

1. **Crear Prenda**
   ```
   POST {{baseUrl}}/prendas
   Body: { tipo: "vestido-dama", ... }
   → Guarda: prendaId
   ```

2. **Crear Cliente**
   ```
   POST {{baseUrl}}/clientes
   Body: { nombre: "María García", ... }
   → Guarda: clienteId
   ```

3. **Crear Empleado**
   ```
   POST {{baseUrl}}/empleados
   Body: { nombre: "Carlos Rodríguez", ... }
   → Guarda: empleadoId
   ```

4. **Crear Servicio**
   ```
   POST {{baseUrl}}/servicios
   Body: {
     clienteId: {{clienteId}},
     empleadoId: {{empleadoId}},
     prendasIds: [{{prendaId}}],
     fechaAlquiler: "2025-11-20"
   }
   → Guarda: servicioNumero (INT)
   ```

5. **Consultar Servicio**
   ```
   GET {{baseUrl}}/servicios/numero/{{servicioNumero}}
   → Obtiene detalles completos
   ```

### Ejemplo 2: Testing de Lavandería con Decoradores

1. **Registrar Prenda Manchada**
   ```
   POST {{baseUrl}}/lavanderia
   Body: {
     prendaId: {{prendaId}},
     esManchada: true,
     configuraciones: {
       mancha: { tipo: "vino", gravedad: "severa" }
     }
   }
   → Prioridad calculada por Decorator Pattern
   ```

2. **Ver Cola por Prioridad**
   ```
   GET {{baseUrl}}/lavanderia/cola
   → Items ordenados por prioridad DESC
   ```

3. **Enviar Lote**
   ```
   POST {{baseUrl}}/lavanderia/enviar-lote
   Body: { itemsIds: [{{lavanderiaItemId}}] }
   → Notificación con detalles
   ```

---

## 🔍 Debugging

### Ver Logs de Consola

Los scripts incluyen `console.log()` para debugging:

1. Abrir **Postman Console** (View → Show Postman Console)
2. Ejecutar un request
3. Ver logs detallados:
   ```
   Ejecutando request: Crear Vestido de Dama
   Environment activo: Los Atuendos - Local
   Status: 201
   Response time: 245 ms
   ```

### Ver Variables de Entorno

1. Click en el ícono del ojo (👁️) junto al selector de environment
2. Ver todas las variables y sus valores actuales
3. Editar valores manualmente si es necesario

### Ver Test Results

Después de ejecutar un request:

1. Ir a la pestaña **Test Results**
2. Ver lista de tests ejecutados con ✓ o ✗
3. Click en un test fallido para ver detalles del error

---

## 📊 Collection Runner - Análisis de Resultados

Después de ejecutar la collection completa:

### Métricas Disponibles

- **Requests ejecutados**: Total de peticiones
- **Tests passed**: Tests exitosos
- **Tests failed**: Tests fallidos
- **Tiempo total**: Duración de la ejecución
- **Tiempo promedio**: Por request

### Exportar Resultados

1. En la pantalla de resultados, click en **Export Results**
2. Seleccionar formato (JSON, HTML, CSV)
3. Guardar archivo para documentación o reporting

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Cannot GET /api"

**Causa**: Endpoint incorrecto (versión antigua)

**Solución**:
- Usar `/api/v1/health` en su lugar
- Verificar que `baseUrl` es `http://localhost:3000/api/v1`

### Error: "diasAlquiler is not allowed"

**Causa**: Campo eliminado del modelo

**Solución**: Remover `diasAlquiler` del body al crear servicios

### Error: "numeroServicio must be an integer"

**Causa**: Se envió string en lugar de INT

**Solución**: Usar número entero (ej: `1` en lugar de `"ALQ-0001"`)

### Error: "estado must be one of the following values..."

**Causa**: Estado inválido

**Solución**: Usar estados válidos: `pendiente`, `confirmado`, `entregado`, `devuelto`, `cancelado`

### Error: "baseUrl is not defined"

**Causa**: Environment no está seleccionado

**Solución**:
1. Click en dropdown de environments (esquina superior derecha)
2. Seleccionar "Los Atuendos - Local"
3. Verificar que aparece seleccionado

### Error: "Cannot read property 'id' of undefined"

**Causa**: Request de creación falló y no guardó el ID

**Solución**:
1. Ejecutar requests en orden correcto
2. Verificar que requests de creación fueron exitosos
3. Revisar Test Results para ver cuál falló

### Error: "Request timeout"

**Causa**: Servidor no está corriendo o URL incorrecta

**Solución**:
```bash
# Verificar servidor
npm run start:dev

# Verificar URL en environment
baseUrl: http://localhost:3000/api/v1
```

### Error: "La fecha de alquiler no puede ser en el pasado"

**Causa**: Variable `fechaAlquiler` no se generó correctamente

**Solución**: El pre-request script genera automáticamente una fecha futura. Verificar que se ejecutó el script.

---

## 🛠️ Configuración Avanzada

### Cambiar Delay entre Requests

En Collection Runner:

```javascript
// En Collection Settings
{
  "delay": 500  // milisegundos entre requests
}
```

### Agregar Pre-request Script Global

Para logging avanzado o configuración inicial:

1. Click derecho en la collection
2. **Edit**
3. Pestaña **Pre-request Scripts**
4. Agregar código JavaScript

### Agregar Test Global

Para validaciones que aplican a todos los endpoints:

1. Click derecho en la collection
2. **Edit**
3. Pestaña **Tests**
4. Agregar tests JavaScript

---

## 🔄 Actualización de la Collection

Para mantener la collection actualizada con cambios en la API:

```bash
# Opción 1: Importar desde Swagger
1. Abrir http://localhost:3000/api/v1/docs
2. Click en "Export" → "OpenAPI JSON"
3. Importar en Postman

# Opción 2: Re-importar collection actualizada
1. Exportar collection actual (si tiene cambios locales)
2. Importar nueva versión
3. Merge manualmente si es necesario
```

---

## 📞 Soporte y Documentación

Para más información, consultar:

- **Swagger Local**: http://localhost:3000/api/v1/docs
- **Swagger Producción**: https://api.losatuendos.com/api/v1/docs
- **Documentación API**: [../docs/API-REST.md](../docs/API-REST.md)
- **GitHub**: https://github.com/tu-organizacion/los-atuendos

---

## ✨ Características Destacadas

- ✅ **50+ Requests** organizados por módulos
- ✅ **100+ Tests automáticos** para validación completa
- ✅ **Pre-request scripts** para generación de datos únicos
- ✅ **Variables dinámicas** que se auto-configuran
- ✅ **Documentación inline** en cada request
- ✅ **Ejemplos de datos** incluidos
- ✅ **Validación de patrones** (Factory, Builder, Singleton, Decorator)
- ✅ **Compatible con CI/CD** usando Newman
- ✅ **API Versioning** con `/api/v1/`

---

## 🤝 Contribuir

Para agregar nuevos endpoints a la collection:

1. Crear el request en Postman
2. Agregar pre-request scripts si necesita datos dinámicos
3. Agregar test scripts para validación
4. Exportar la collection actualizada
5. Reemplazar el archivo JSON

---

## 📄 Licencia

MIT License - Ver archivo LICENSE en el root del proyecto.

---

**Autor**: Equipo de Desarrollo - Los Atuendos
**Versión**: 1.0.0
**Fecha**: 14 de Noviembre, 2025