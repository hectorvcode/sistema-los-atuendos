# Documentación de Testing - Los Atuendos

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estrategia de Testing](#estrategia-de-testing)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Tests Unitarios](#tests-unitarios)
5. [Comandos de Testing](#comandos-de-testing)
6. [Cobertura de Código](#cobertura-de-código)
7. [Buenas Prácticas](#buenas-prácticas)
8. [Troubleshooting](#troubleshooting)

---

## Introducción

Este documento describe la estrategia de testing implementada en el proyecto Los Atuendos. El proyecto utiliza **Jest** como framework de testing principal.

### Objetivos del Testing

- ✅ Validar la correcta implementación de patrones de diseño
- ✅ Asegurar la integridad de los datos y reglas de negocio
- ✅ Facilitar refactorización segura del código
- ✅ Documentar el comportamiento esperado del sistema

---

## Estrategia de Testing

### Tests Unitarios

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

---

## Configuración del Entorno

### Requisitos Previos

1. **Dependencias Instaladas**
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
├── coverage/           # Cobertura de tests unitarios
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

## Comandos de Testing

### Comandos Principales

```bash
# Ejecutar TODOS los tests
npm run test:all

# Ejecutar todos con cobertura
npm run test:all:cov

# Solo tests unitarios
npm run test:unit

# Tests con coverage
npm run test:cov
npm run test:unit:cov

# Watch mode (útil durante desarrollo)
npm run test:watch
npm run test:unit:watch
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

---

## Cobertura de Código

### Generar Reportes de Cobertura

```bash
# Cobertura de tests unitarios
npm run test:unit:cov
# Reporte en: coverage/index.html

# Cobertura completa
npm run test:all:cov
```

### Ver Reporte de Cobertura

```bash
# Windows
start coverage/index.html

# Linux/Mac
open coverage/index.html
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

### Objetivos de Cobertura

| Categoría | Objetivo | Actual |
|-----------|----------|---------|
| Unit Tests - Patrones | 90% | ✅ |
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
    await dataSource.query('DELETE FROM clientes WHERE correoElectronico LIKE "%@test.com"');
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

# O cambiar puerto en .env
APP_PORT=3001
```

### Problema 2: "Database connection failed"

**Causa**: XAMPP no está corriendo o base de datos no existe

**Solución**:
```bash
# 1. Iniciar XAMPP (Apache + MySQL)

# 2. Crear base de datos
mysql -u root -p
CREATE DATABASE los_atuendos;
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
npm run db:reset
```

---

## Resumen de Testing

### Estadísticas

- **Tests Unitarios**: 140+ tests
- **Cobertura Total**: ~85%
- **Patrones Validados**: 7 patrones de diseño

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

---

## Recursos Adicionales

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
**Mantenedor**: Equipo de Desarrollo - Los Atuendos