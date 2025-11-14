# Documentación de Testing - Los Atuendos

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estrategia de Testing](#estrategia-de-testing)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Tests Unitarios](#tests-unitarios)
5. [Tests de Integración (E2E)](#tests-de-integración-e2e)
6. [Comandos de Testing](#comandos-de-testing)
7. [Cobertura de Código](#cobertura-de-código)
8. [Buenas Prácticas](#buenas-prácticas)
9. [Troubleshooting](#troubleshooting)

---

## Introducción

Este documento describe la estrategia de testing implementada en el proyecto Los Atuendos. El proyecto utiliza **Jest** como framework de testing y **Supertest** para tests de integración de endpoints.

### Objetivos del Testing

- ✅ Validar la correcta implementación de patrones de diseño
- ✅ Garantizar el funcionamiento de todos los endpoints de la API
- ✅ Asegurar la integridad de los datos y reglas de negocio
- ✅ Facilitar refactorización segura del código
- ✅ Documentar el comportamiento esperado del sistema

---

## Estrategia de Testing

### Tipos de Tests Implementados

#### 1. Unit Tests (Tests Unitarios)
**Propósito**: Validar la lógica de negocio y patrones de diseño de forma aislada.

**Ubicación**: `src/*/test/*.spec.ts`

**Cobertura**:
- ✅ Factory Method Pattern (Creación de prendas)
- ✅ Builder Pattern (Construcción de servicios)
- ✅ Singleton Pattern (Generación de consecutivos)
- ✅ Decorator Pattern (Cálculo de prioridades)
- ✅ Adapter Pattern (Abstracción de repositorios)
- ✅ Composite Pattern (Gestión de conjuntos)
- ✅ Facade Pattern (Simplificación de operaciones)

#### 2. Integration Tests / E2E (Tests de Integración)
**Propósito**: Validar el funcionamiento completo de los endpoints con base de datos real.

**Ubicación**: `test/*.e2e-spec.ts`

**Cobertura**:
- ✅ API REST de Prendas (CRUD + Factory Pattern)
- ✅ API REST de Clientes (CRUD + Validaciones)
- ✅ API REST de Empleados (CRUD)
- ✅ API REST de Servicios (CRUD + Builder + Singleton)
- ✅ API REST de Lavandería (CRUD + Decorator Pattern)

---

## Configuración del Entorno

### Requisitos Previos

1. **Base de Datos de Testing**
   ```sql
   -- En MySQL/XAMPP, crear base de datos de testing
   CREATE DATABASE los_atuendos_test;
   ```

2. **Variables de Entorno**

   El archivo `.env.test` está configurado automáticamente:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=
   DB_NAME=los_atuendos_test
   NODE_ENV=test
   TYPEORM_SYNC=true
   TYPEORM_LOGGING=false
   ```

3. **Dependencias Instaladas**
   ```bash
   npm install
   ```

### Estructura de Archivos

```
los-atuendos/
├── src/
│   ├── patterns/
│   │   ├── creational/
│   │   │   └── test/
│   │   │       ├── factory.spec.ts
│   │   │       ├── builder.spec.ts
│   │   │       └── singleton.spec.ts
│   │   └── structural/
│   │       ├── adapter/test/adapter.spec.ts
│   │       ├── decorator/test/decorator.spec.ts
│   │       ├── composite/test/composite.spec.ts
│   │       └── facade/test/facade.spec.ts
│   └── modules/
│       ├── prendas/test/
│       ├── clientes/test/
│       └── servicios/test/
├── test/
│   ├── prendas.e2e-spec.ts
│   ├── clientes.e2e-spec.ts
│   ├── empleados.e2e-spec.ts
│   ├── servicios.e2e-spec.ts
│   ├── lavanderia.e2e-spec.ts
│   ├── setup-tests.ts
│   ├── jest-e2e.json
│   └── helpers/
│       └── test-data.helper.ts
├── coverage/           # Cobertura de tests unitarios
├── coverage-e2e/       # Cobertura de tests E2E
└── docs/
    └── TESTING.md      # Este documento
```

---

## Tests Unitarios

### Ejecutar Tests Unitarios

```bash
# Ejecutar todos los tests unitarios
npm run test:unit

# Ejecutar en modo watch (útil durante desarrollo)
npm run test:unit:watch

# Ejecutar con reporte de cobertura
npm run test:unit:cov
```

### Tests por Patrón de Diseño

#### Factory Method Pattern
```bash
npm run test:factory
```

**Valida**:
- ✅ Creación correcta de diferentes tipos de prendas
- ✅ Validación de datos antes de crear
- ✅ Registry de factories funciona correctamente
- ✅ Manejo de errores para tipos inválidos

**Ejemplo de Test**:
```typescript
it('should create a vestido de dama successfully', async () => {
  const vestidoData = {
    referencia: 'VD-TEST-001',
    color: 'Rojo',
    marca: 'Test Elegancia',
    talla: 'M',
    valorAlquiler: 150000,
    tienePedreria: true,
    esLargo: true,
  };

  const vestido = await vestidoDamaFactory.crearPrenda(vestidoData);

  expect(vestido).toBeDefined();
  expect(vestido.referencia).toBe(vestidoData.referencia);
  expect(vestido.tienePedreria).toBe(true);
});
```

#### Builder Pattern
```bash
npm run test:builder
```

**Valida**:
- ✅ Construcción paso a paso de servicios complejos
- ✅ Validación de campos requeridos
- ✅ Validación de reglas de negocio (fechas, disponibilidad)
- ✅ Reset del builder después de build

**Ejemplo de Test**:
```typescript
it('should validate required fields', async () => {
  await expect(builder.build()).rejects.toThrow('Error de validación');

  await expect(
    builder.setCliente(1).build()
  ).rejects.toThrow('Error de validación');
});
```

#### Singleton Pattern
```bash
npm run test:singleton
```

**Valida**:
- ✅ Solo existe una instancia del generador
- ✅ Números consecutivos son únicos
- ✅ Thread-safety en generación concurrente
- ✅ Persistencia de consecutivos en base de datos

#### Decorator Pattern
```bash
npm run test:decorator
```

**Valida**:
- ✅ Cálculo dinámico de prioridades
- ✅ Aplicación correcta de múltiples decorators
- ✅ Prioridad base + incrementos por características
- ✅ Mancha, delicada y urgente modifican prioridad

---

## Tests de Integración (E2E)

### Ejecutar Tests E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar en modo watch
npm run test:e2e:watch

# Ejecutar con cobertura
npm run test:e2e:cov
```

### Tests por Módulo

#### Prendas API
```bash
npm run test:e2e:prendas
```

**Endpoints Validados**:
- ✅ POST `/api/prendas` - Crear prenda (Factory Pattern)
- ✅ GET `/api/prendas` - Listar con paginación
- ✅ GET `/api/prendas/:id` - Obtener por ID
- ✅ GET `/api/prendas/referencia/:ref` - Buscar por referencia
- ✅ GET `/api/prendas/talla/:talla` - Filtrar por talla
- ✅ PATCH `/api/prendas/:id` - Actualizar prenda
- ✅ DELETE `/api/prendas/:id` - Eliminar prenda

**Casos de Prueba**:
- ✅ Creación exitosa de vestido de dama, traje y disfraz
- ✅ Validación de campos requeridos
- ✅ Error con tipo inválido
- ✅ Error con referencia duplicada
- ✅ Paginación funciona correctamente
- ✅ Filtros funcionan correctamente

#### Clientes API
```bash
npm run test:e2e:clientes
```

**Endpoints Validados**:
- ✅ POST `/api/clientes` - Crear cliente
- ✅ GET `/api/clientes` - Listar con paginación
- ✅ GET `/api/clientes/:id` - Obtener por ID
- ✅ PATCH `/api/clientes/:id` - Actualizar cliente
- ✅ DELETE `/api/clientes/:id` - Eliminar cliente
- ✅ GET `/api/clientes/:id/servicios` - Servicios del cliente

**Casos de Prueba**:
- ✅ Creación exitosa con todos los campos
- ✅ Validación de email único
- ✅ Validación de número de identificación único
- ✅ Formato de email válido
- ✅ Whitelist validation (rechaza campos extras)

#### Empleados API
```bash
npm run test:e2e:empleados
```

**Endpoints Validados**:
- ✅ POST `/api/empleados` - Crear empleado
- ✅ GET `/api/empleados` - Listar con paginación
- ✅ GET `/api/empleados/:id` - Obtener por ID
- ✅ PATCH `/api/empleados/:id` - Actualizar empleado
- ✅ DELETE `/api/empleados/:id` - Eliminar empleado

#### Servicios de Alquiler API
```bash
npm run test:e2e:servicios
```

**Endpoints Validados**:
- ✅ POST `/api/servicios` - Crear servicio (Builder Pattern)
- ✅ GET `/api/servicios` - Listar con paginación
- ✅ GET `/api/servicios/:id` - Obtener con relaciones
- ✅ GET `/api/servicios/numero/:numero` - Buscar por número
- ✅ GET `/api/servicios/estadisticas` - Estadísticas

**Validaciones Especiales**:
- ✅ Singleton Pattern: números consecutivos únicos
- ✅ Builder Pattern: construcción compleja de servicios
- ✅ Cálculo correcto de valor total
- ✅ Validación de fecha no puede ser en el pasado
- ✅ Validación de existencia de cliente, empleado y prendas

**Ejemplo de Test**:
```typescript
it('should validate Singleton Pattern - consecutive numbers', async () => {
  const response1 = await request(app.getHttpServer())
    .post('/api/servicios')
    .send(servicioData)
    .expect(201);

  const numero1 = response1.body.data.numeroServicio;

  const response2 = await request(app.getHttpServer())
    .post('/api/servicios')
    .send(servicioData)
    .expect(201);

  const numero2 = response2.body.data.numeroServicio;

  // Validar que son consecutivos
  const num1 = parseInt(numero1.split('-')[1]);
  const num2 = parseInt(numero2.split('-')[1]);
  expect(num2).toBe(num1 + 1);
});
```

#### Lavandería API
```bash
npm run test:e2e:lavanderia
```

**Endpoints Validados**:
- ✅ POST `/api/lavanderia` - Registrar prenda (Decorator Pattern)
- ✅ GET `/api/lavanderia/cola` - Cola ordenada por prioridad
- ✅ GET `/api/lavanderia` - Listar con paginación
- ✅ GET `/api/lavanderia/:id` - Obtener item
- ✅ POST `/api/lavanderia/enviar-lote` - Enviar lote
- ✅ GET `/api/lavanderia/estadisticas` - Estadísticas

**Validaciones Decorator Pattern**:
- ✅ Prioridad base para item simple
- ✅ Incremento de prioridad por mancha
- ✅ Incremento de prioridad por delicada
- ✅ Incremento máximo de prioridad por urgente
- ✅ Prioridad combinada con múltiples decorators
- ✅ Cola ordenada por prioridad descendente

**Ejemplo de Test**:
```typescript
it('should calculate combined priority - multiple decorators', async () => {
  const itemCombinado = {
    prendaId,
    esManchada: true,
    esDelicada: true,
    requiereUrgente: true,
    configuraciones: {
      mancha: { tipo: 'grasa', gravedad: 'severa' },
      delicada: { tipoTela: 'seda' },
      urgente: { motivo: 'Evento VIP' },
    },
  };

  const response = await request(app.getHttpServer())
    .post('/api/lavanderia')
    .send(itemCombinado)
    .expect(201);

  const prioridadCombinada = response.body.data.prioridad;
  expect(prioridadCombinada).toBeGreaterThan(80);
});
```

---

## Comandos de Testing

### Comandos Principales

```bash
# Ejecutar TODOS los tests (unit + e2e)
npm run test:all

# Ejecutar todos con cobertura
npm run test:all:cov

# Solo tests unitarios
npm run test:unit

# Solo tests E2E
npm run test:e2e

# Tests con coverage
npm run test:cov
npm run test:unit:cov
npm run test:e2e:cov

# Watch mode (útil durante desarrollo)
npm run test:watch
npm run test:unit:watch
npm run test:e2e:watch
```

### Comandos por Patrón

```bash
# Patrones Creacionales
npm run test:creational     # Todos los creacionales
npm run test:factory        # Factory Method
npm run test:builder        # Builder
npm run test:singleton      # Singleton

# Patrones Estructurales
npm run test:structural     # Todos los estructurales
npm run test:decorator      # Decorator
npm run test:adapter        # Adapter
npm run test:composite      # Composite
npm run test:facade         # Facade

# Todos los patrones
npm run test:patterns
npm run test:patterns:watch
```

### Comandos por Módulo E2E

```bash
npm run test:e2e:prendas
npm run test:e2e:clientes
npm run test:e2e:empleados
npm run test:e2e:servicios
npm run test:e2e:lavanderia
```

---

## Cobertura de Código

### Generar Reportes de Cobertura

```bash
# Cobertura de tests unitarios
npm run test:unit:cov
# Reporte en: coverage/index.html

# Cobertura de tests E2E
npm run test:e2e:cov
# Reporte en: coverage-e2e/index.html

# Cobertura completa
npm run test:all:cov
```

### Ver Reporte de Cobertura

```bash
# Windows
start coverage/index.html
start coverage-e2e/index.html

# Linux/Mac
open coverage/index.html
open coverage-e2e/index.html
```

### Configuración de Cobertura

**Jest Config** (package.json):
```json
{
  "collectCoverageFrom": [
    "**/*.(t|j)s",
    "!**/*.interface.ts",
    "!**/*.dto.ts",
    "!**/*.entity.ts",
    "!**/*.module.ts"
  ]
}
```

**E2E Config** (test/jest-e2e.json):
```json
{
  "collectCoverageFrom": [
    "../src/**/*.{ts,js}",
    "!../src/main.ts",
    "!../src/**/*.interface.ts",
    "!../src/**/*.dto.ts",
    "!../src/**/*.entity.ts",
    "!../src/**/*.module.ts"
  ]
}
```

### Objetivos de Cobertura

| Categoría | Objetivo | Actual |
|-----------|----------|---------|
| Unit Tests - Patrones | 90% | ✅ |
| E2E Tests - Endpoints | 80% | ✅ |
| Servicios Core | 85% | ✅ |
| Controllers | 80% | ✅ |

---

## Buenas Prácticas

### 1. Nomenclatura de Tests

```typescript
// ✅ BIEN - Describe claramente qué se está probando
describe('PrendasController', () => {
  describe('POST /api/prendas', () => {
    it('should create vestido de dama successfully', async () => {
      // Test code
    });

    it('should fail with missing required fields', async () => {
      // Test code
    });
  });
});

// ❌ MAL - No es descriptivo
describe('Test 1', () => {
  it('works', () => {
    // Test code
  });
});
```

### 2. Estructura AAA (Arrange-Act-Assert)

```typescript
it('should calculate total correctly', async () => {
  // Arrange - Preparar datos
  const prenda = { valorAlquiler: 100000 };
  const diasAlquiler = 3;

  // Act - Ejecutar acción
  const result = await calcularTotal(prenda, diasAlquiler);

  // Assert - Verificar resultado
  expect(result).toBe(300000);
});
```

### 3. Datos de Prueba Únicos

```typescript
// ✅ BIEN - Usa helpers para generar datos únicos
const clienteData = createClienteTestData();

// ❌ MAL - Datos hardcodeados pueden causar conflictos
const clienteData = {
  email: 'test@test.com', // Puede fallar si ya existe
};
```

### 4. Cleanup Después de Tests

```typescript
afterAll(async () => {
  // Limpiar datos de prueba
  if (dataSource) {
    await dataSource.query('DELETE FROM clientes WHERE email LIKE "%@test.com"');
  }

  if (app) {
    await app.close();
  }
});
```

### 5. Tests Independientes

```typescript
// ✅ BIEN - Cada test es independiente
it('should create cliente', async () => {
  const cliente = createClienteTestData();
  const result = await createCliente(cliente);
  expect(result).toBeDefined();
});

it('should update cliente', async () => {
  // Crea su propio cliente para actualizar
  const cliente = await createClienteTestData();
  const created = await createCliente(cliente);
  // Ahora actualiza
});

// ❌ MAL - Tests dependientes
let clienteId;

it('should create cliente', async () => {
  const result = await createCliente(data);
  clienteId = result.id; // El siguiente test depende de esto
});

it('should update cliente', async () => {
  await updateCliente(clienteId, data); // Falla si el test anterior falla
});
```

### 6. Validar Estructuras Completas

```typescript
// ✅ BIEN - Valida estructura completa
expect(response.body).toHaveProperty('success', true);
expect(response.body).toHaveProperty('statusCode', 201);
expect(response.body).toHaveProperty('data');
expect(response.body.data).toHaveProperty('id');

// ⚠️ ACEPTABLE - Solo valida lo crítico
expect(response.body.success).toBe(true);
expect(response.body.data.id).toBeDefined();
```

### 7. Usar beforeAll vs beforeEach

```typescript
// beforeAll - Setup costoso (conexión DB, crear app)
beforeAll(async () => {
  app = await createTestApp();
  dataSource = await connectDatabase();
});

// beforeEach - Reset de estado entre tests
beforeEach(async () => {
  await cleanupTestData();
});
```

---

## Troubleshooting

### Problema 1: "Port 3000 already in use"

**Causa**: Servidor de desarrollo corriendo

**Solución**:
```bash
# Detener servidor de desarrollo
# Ctrl+C en la terminal del servidor

# O cambiar puerto en .env.test
APP_PORT=3001
```

### Problema 2: "Database connection failed"

**Causa**: XAMPP no está corriendo o base de datos no existe

**Solución**:
```bash
# 1. Iniciar XAMPP (Apache + MySQL)

# 2. Crear base de datos de testing
mysql -u root -p
CREATE DATABASE los_atuendos_test;
exit;
```

### Problema 3: "Cannot find module"

**Causa**: Dependencias no instaladas

**Solución**:
```bash
npm install
```

### Problema 4: Tests fallan por datos existentes

**Causa**: Cleanup no ejecutado correctamente

**Solución**:
```bash
# Limpiar manualmente la base de datos
mysql -u root -p los_atuendos_test
DELETE FROM servicios_prendas;
DELETE FROM servicios;
DELETE FROM lavanderia;
DELETE FROM prendas WHERE referencia LIKE "%-TEST-%";
DELETE FROM clientes WHERE email LIKE "%@test.com";
DELETE FROM empleados WHERE email LIKE "%@test.com";
```

### Problema 5: "Test timeout"

**Causa**: Tests E2E tardan mucho

**Solución**: Aumentar timeout en jest-e2e.json
```json
{
  "testTimeout": 60000
}
```

### Problema 6: "Duplicate entry for key 'email'"

**Causa**: Email duplicado en tests paralelos

**Solución**: Los helpers ya generan emails únicos con timestamp:
```typescript
// Ya implementado en test-data.helper.ts
export const generateEmail = (prefix: string = 'test'): string => {
  const timestamp = generateTimestamp();
  return `${prefix}-${timestamp}@test.com`;
};
```

---

## Helpers de Testing

### test-data.helper.ts

Funciones auxiliares para generar datos de prueba:

```typescript
// Generar datos únicos
generateTimestamp()
generatePrendaReferencia('VD')
generateEmail('cliente')
generateNumeroIdentificacion()
generateFechaFutura(30)

// Crear datos completos de prueba
createVestidoDamaTestData()
createTrajeCaballeroTestData()
createDisfrazTestData()
createClienteTestData()
createEmpleadoTestData()
createServicioAlquilerTestData(clienteId, empleadoId, prendasIds)
createLavanderiaItemTestData(prendaId)
```

### setup-tests.ts

Configuración global para todos los tests E2E:
- Configura NODE_ENV='test'
- Configura base de datos de testing
- Establece timeout global
- Hooks beforeAll y afterAll globales

---

## Resumen de Testing

### Estadísticas

- **Tests Unitarios**: 50+ tests
- **Tests E2E**: 100+ tests
- **Cobertura Total**: ~85%
- **Patrones Validados**: 7 patrones de diseño
- **Endpoints Validados**: 30+ endpoints

### Beneficios

✅ **Confianza en Refactorización**: Cambios seguros en el código
✅ **Documentación Viva**: Tests documentan comportamiento esperado
✅ **Detección Temprana**: Errores detectados antes de producción
✅ **Integración Continua**: Listos para CI/CD pipelines
✅ **Calidad de Código**: Mantiene estándares altos

### Próximos Pasos

- [ ] Integrar tests en CI/CD (GitHub Actions, GitLab CI)
- [ ] Agregar tests de performance
- [ ] Agregar tests de seguridad
- [ ] Aumentar cobertura a 90%+
- [ ] Agregar mutation testing

---

## Recursos Adicionales

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Última actualización**: Enero 2025
**Versión**: 1.0.0
**Mantenedor**: Equipo de Desarrollo - Los Atuendos