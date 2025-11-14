# Los Atuendos - Postman Collection

## Descripción

Collection completa de Postman para testing y documentación de la API de Los Atuendos. Incluye todos los endpoints organizados por módulos, tests automáticos, variables de entorno pre-configuradas y datos de ejemplo.

## 📦 Contenido

- **Los-Atuendos-API.postman_collection.json** - Collection principal con todos los endpoints
- **Los-Atuendos-Local.postman_environment.json** - Variables de entorno para desarrollo local
- **Los-Atuendos-Production.postman_environment.json** - Variables de entorno para producción

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
2. Verificar que `baseUrl` está configurada como `http://localhost:3000/api`
3. Asegurar que el servidor de desarrollo está corriendo (`npm run start:dev`)

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

## 🎯 Uso Recomendado

### Opción 1: Ejecución Secuencial Manual

Para probar la API paso a paso:

1. **Health Check** - Verificar que la API está activa
2. **Crear Vestido de Dama** - Crea una prenda (guarda automáticamente el ID)
3. **Crear Cliente** - Crea un cliente (guarda automáticamente el ID)
4. **Crear Empleado** - Crea un empleado (guarda automáticamente el ID)
5. **Crear Servicio de Alquiler** - Usa los IDs guardados automáticamente
6. **Registrar Prenda para Lavandería** - Usa el ID de la prenda creada
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

## 🔧 Variables de Entorno

### Variables Pre-configuradas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `baseUrl` | URL base de la API | `http://localhost:3000/api` |
| `swaggerUrl` | URL de Swagger | `http://localhost:3000/api/docs` |
| `authToken` | Token JWT (futuro) | `Bearer eyJhbGc...` |

### Variables Dinámicas (auto-generadas)

Las siguientes variables se generan automáticamente durante la ejecución:

| Variable | Generada por | Uso |
|----------|--------------|-----|
| `prendaId` | Crear Vestido de Dama | IDs posteriores |
| `prendaReferencia` | Crear Vestido de Dama | Búsquedas |
| `nuevaReferencia` | Pre-request script | Unicidad |
| `clienteId` | Crear Cliente | Servicios |
| `clienteNumeroId` | Pre-request script | Unicidad |
| `clienteEmail` | Pre-request script | Unicidad |
| `empleadoId` | Crear Empleado | Servicios |
| `empleadoNumeroId` | Pre-request script | Unicidad |
| `empleadoEmail` | Pre-request script | Unicidad |
| `servicioId` | Crear Servicio | Referencias |
| `servicioNumero` | Crear Servicio | Búsquedas |
| `fechaAlquiler` | Pre-request script | Fecha futura válida |
| `lavanderiaItemId` | Registrar para Lavandería | Lotes |

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
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
```

#### Extraer y Guardar ID
```javascript
pm.test("Prenda created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('id');

    // Guardar para uso posterior
    pm.environment.set('prendaId', jsonData.data.id);
});
```

#### Validar Formato de Respuesta
```javascript
pm.test("Response has standard format", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('statusCode');
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData).to.have.property('data');
});
```

#### Validar Ordenamiento
```javascript
pm.test("Queue is sorted by priority (DESC)", function () {
    var items = pm.response.json().data;

    for (let i = 0; i < items.length - 1; i++) {
        pm.expect(items[i].prioridad).to.be.at.least(items[i+1].prioridad);
    }
});
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Alquiler

1. **Crear Prenda**
   ```
   POST /api/prendas
   Body: { tipo: "vestido-dama", ... }
   → Guarda: prendaId
   ```

2. **Crear Cliente**
   ```
   POST /api/clientes
   Body: { nombre: "María García", ... }
   → Guarda: clienteId
   ```

3. **Crear Empleado**
   ```
   POST /api/empleados
   Body: { nombre: "Carlos Rodríguez", ... }
   → Guarda: empleadoId
   ```

4. **Crear Servicio**
   ```
   POST /api/servicios
   Body: {
     clienteId: {{clienteId}},
     empleadoId: {{empleadoId}},
     prendasIds: [{{prendaId}}]
   }
   → Guarda: servicioNumero
   ```

5. **Consultar Servicio**
   ```
   GET /api/servicios/numero/{{servicioNumero}}
   → Obtiene detalles completos
   ```

### Ejemplo 2: Testing de Lavandería con Decoradores

1. **Registrar Prenda Manchada**
   ```
   POST /api/lavanderia
   Body: {
     prendaId: {{prendaId}},
     esManchada: true,
     configuraciones: {
       mancha: { tipo: "vino", gravedad: "severa" }
     }
   }
   → Prioridad calculada por Decorator
   ```

2. **Ver Cola por Prioridad**
   ```
   GET /api/lavanderia/cola
   → Items ordenados por prioridad DESC
   ```

3. **Enviar Lote**
   ```
   POST /api/lavanderia/enviar-lote
   Body: { itemsIds: [{{lavanderiaItemId}}] }
   → Notificación con detalles
   ```

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

## 🚨 Troubleshooting

### Error: "baseUrl is not defined"

**Solución**: Verificar que el environment está seleccionado

```bash
1. Click en dropdown de environments (esquina superior derecha)
2. Seleccionar "Los Atuendos - Local"
3. Verificar que aparece seleccionado
```

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
baseUrl: http://localhost:3000/api
```

### Error: "La fecha de alquiler no puede ser en el pasado"

**Causa**: Variable `fechaAlquiler` no se generó correctamente

**Solución**: El pre-request script genera automáticamente una fecha futura. Verificar que se ejecutó el script.

## 📚 Recursos Adicionales

- **Swagger Docs**: http://localhost:3000/api/docs
- **API Documentation**: [docs/API-REST.md](../docs/API-REST.md)
- **Postman Learning**: https://learning.postman.com/

## 🤝 Contribuir

Para agregar nuevos endpoints a la collection:

1. Crear el request en Postman
2. Agregar pre-request scripts si necesita datos dinámicos
3. Agregar test scripts para validación
4. Exportar la collection actualizada
5. Reemplazar el archivo JSON

## 📄 Licencia

MIT License - Ver archivo LICENSE en el root del proyecto.

## ✨ Características Destacadas

- ✅ **50+ Requests** organizados por módulos
- ✅ **100+ Tests automáticos** para validación completa
- ✅ **Pre-request scripts** para generación de datos únicos
- ✅ **Variables dinámicas** que se auto-configuran
- ✅ **Documentación inline** en cada request
- ✅ **Ejemplos de datos** incluidos
- ✅ **Validación de patrones** (Factory, Builder, Singleton, Decorator)
- ✅ **Compatible con CI/CD** usando Newman

## 🔄 Actualización de la Collection

Para mantener la collection actualizada con cambios en la API:

```bash
# Opción 1: Importar desde Swagger
1. Abrir http://localhost:3000/api/docs
2. Click en "Export" → "OpenAPI JSON"
3. Importar en Postman

# Opción 2: Re-importar collection actualizada
1. Exportar collection actual (si tiene cambios locales)
2. Importar nueva versión
3. Merge manualmente si es necesario
```

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
**Autor**: Equipo de Desarrollo - Los Atuendos